const path = require("path");

const {
  ALLOWED_LANGUAGES,
  REQUIRED_STACK,
  isPlainObject,
  isNonEmptyString,
  normalizeStack,
} = require("../schemas/generatedProjectSchema");
const { validateGeneratedPath } = require("./pathValidator");
const { validatePackageJson } = require("./packageJsonValidator");

const MAX_FILES = 80;
const MAX_FILE_BYTES = 128 * 1024;
const MAX_TOTAL_BYTES = 3 * 1024 * 1024;

const EXTENSION_LANGUAGES = new Map([
  [".js", "javascript"],
  [".mjs", "javascript"],
  [".cjs", "javascript"],
  [".jsx", "jsx"],
  [".ts", "typescript"],
  [".tsx", "tsx"],
  [".json", "json"],
  [".html", "html"],
  [".css", "css"],
  [".md", "markdown"],
  [".svg", "svg"],
]);

const REQUIRED_FILES = [
  "frontend/package.json",
  "frontend/index.html",
  "backend/package.json",
  "README.md",
  ".gitignore",
  ".env.example",
];

function validationError(code, errorPath, message) {
  return { code, path: errorPath, message };
}

function hasOwn(source, key) {
  return Object.prototype.hasOwnProperty.call(source, key);
}

function validateTopLevel(payload, errors) {
  if (!isPlainObject(payload)) {
    errors.push(validationError("INVALID_TOP_LEVEL", "", "Generated project must be a JSON object."));
    return false;
  }

  if (payload.schemaVersion !== 1) {
    errors.push(validationError("INVALID_SCHEMA_VERSION", "schemaVersion", "Generated project schemaVersion must be 1."));
  }

  if (!isPlainObject(payload.project)) {
    errors.push(validationError("INVALID_PROJECT", "project", "Generated project project must be an object."));
  }

  if (!Array.isArray(payload.files) || payload.files.length === 0) {
    errors.push(validationError("INVALID_FILES", "files", "Generated project files must be a non-empty array."));
  }

  if (Array.isArray(payload.files) && payload.files.length > MAX_FILES) {
    errors.push(validationError("FILE_COUNT_EXCEEDED", "files", `Generated project may contain at most ${MAX_FILES} files.`));
  }

  return true;
}

function validateProjectMetadata(project, errors) {
  if (!isPlainObject(project)) return;

  ["name", "summary"].forEach((field) => {
    if (!isNonEmptyString(project[field])) {
      errors.push(validationError("INVALID_PROJECT_FIELD", `project.${field}`, `project.${field} must be a non-empty string.`));
    }
  });

  if (!Array.isArray(project.stack) || project.stack.length === 0 || project.stack.some((item) => !isNonEmptyString(item))) {
    errors.push(validationError("INVALID_STACK", "project.stack", "project.stack must be a non-empty array of strings."));
  } else {
    const normalizedStack = new Set(normalizeStack(project.stack));
    REQUIRED_STACK.forEach((technology) => {
      if (!normalizedStack.has(technology)) {
        errors.push(validationError("MISSING_STACK_TECHNOLOGY", "project.stack", `Required stack technology is missing: ${technology}.`));
      }
    });
  }

  if (!isPlainObject(project.entrypoints)) {
    errors.push(validationError("INVALID_ENTRYPOINTS", "project.entrypoints", "project.entrypoints must be an object."));
    return;
  }

  ["frontend", "backend"].forEach((field) => {
    if (!isNonEmptyString(project.entrypoints[field])) {
      errors.push(validationError("INVALID_ENTRYPOINT", `project.entrypoints.${field}`, "Entrypoint must be a non-empty string."));
    }
  });
}

function validateLanguage(language, filePath, errors, index) {
  if (!isNonEmptyString(language) || !ALLOWED_LANGUAGES.has(language.trim().toLowerCase())) {
    errors.push(validationError("INVALID_LANGUAGE", `files[${index}].language`, "Generated file language is not allowed."));
    return;
  }

  const extension = path.posix.extname(filePath).toLowerCase();
  const expectedLanguage = EXTENSION_LANGUAGES.get(extension);
  const normalizedLanguage = language.trim().toLowerCase();
  const isSpecialTextFile = filePath === ".gitignore" || filePath === ".env.example" || filePath === "README.md";

  if (expectedLanguage && normalizedLanguage !== expectedLanguage) {
    errors.push(validationError("LANGUAGE_EXTENSION_MISMATCH", `files[${index}].language`, `Language does not match the ${extension} extension.`));
  }

  if (isSpecialTextFile) {
    const allowedLanguages = filePath === "README.md" ? ["text", "markdown"] : ["text"];
    if (!allowedLanguages.includes(normalizedLanguage)) {
      errors.push(validationError("LANGUAGE_EXTENSION_MISMATCH", `files[${index}].language`, "This root file must use its required text or markdown language."));
    }
  }
}

function hasSensitiveFileName(filePath) {
  const lowerPath = filePath.toLowerCase();
  const baseName = path.posix.basename(lowerPath);

  if (baseName === ".env.example") return false;
  if (baseName === ".env" || baseName.startsWith(".env.")) return true;
  if (["id_rsa", "credentials.json", "service-account.json", "secrets.json"].includes(baseName)) return true;
  return [".pem", ".key", ".crt"].some((extension) => baseName.endsWith(extension));
}

function isSafeEnvironmentExampleValue(value) {
  return /^(?:your_[a-z0-9_]*|replace[-_ ]with[a-z0-9_-]*|<[^>]+>|\$\{[A-Z0-9_]+\}|process\.env\.[A-Z0-9_]+)$/i.test(value)
    || /^mongodb:\/\/localhost:27017\/example\/?$/i.test(value);
}

function containsSensitiveContent(content, filePath) {
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i.test(content)) return true;
  if (filePath === ".env.example") {
    if (/\b(?:sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/.test(content)) return true;
    const sensitiveAssignment = /\b(?:OPENAI_API_KEY|ANTHROPIC_API_KEY|AWS_SECRET_ACCESS_KEY|JWT_SECRET|MONGODB_URI|DATABASE_URL|[A-Z0-9_]*(?:PASSWORD|SECRET|TOKEN|API_KEY)[A-Z0-9_]*)\s*[:=]\s*["']?([^\s"';,#]+)/gi;
    for (const match of content.matchAll(sensitiveAssignment)) {
      if (!isSafeEnvironmentExampleValue(match[1])) return true;
    }
    return false;
  }
  if (/\b(?:OPENAI_API_KEY|ANTHROPIC_API_KEY|AWS_SECRET_ACCESS_KEY|JWT_SECRET|MONGODB_URI|DATABASE_URL)\s*[:=]\s*["']?(?!process\.env\.[A-Z0-9_]+\b)(?!your_[a-z0-9_]*|replace[-_ ]with|<[^>]+>|\$\{)[^\s"';,]+/i.test(content)) return true;
  if (/\b(?:sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16})\b/.test(content)) return true;
  return false;
}

function validateFiles(payload, errors) {
  if (!Array.isArray(payload.files)) return { files: [], paths: new Set(), totalBytes: 0 };

  const paths = new Set();
  const files = [];
  let totalBytes = 0;

  payload.files.forEach((file, index) => {
    const filePath = `files[${index}]`;

    if (!isPlainObject(file)) {
      errors.push(validationError("INVALID_FILE", filePath, "Generated file must be an object."));
      return;
    }

    ["path", "language", "content"].forEach((field) => {
      if (!hasOwn(file, field)) {
        errors.push(validationError("MISSING_FILE_FIELD", `${filePath}.${field}`, `Generated file requires ${field}.`));
      }
    });

    const pathResult = validateGeneratedPath(file.path);
    if (!pathResult.valid) {
      errors.push(validationError(pathResult.error.code, `${filePath}.path`, pathResult.error.message));
    }

    const normalizedPath = pathResult.valid ? pathResult.normalizedPath : null;
    if (normalizedPath && paths.has(normalizedPath)) {
      errors.push(validationError("DUPLICATE_PATH", `${filePath}.path`, "Generated file path is duplicated."));
    }
    if (normalizedPath) paths.add(normalizedPath);

    if (normalizedPath) validateLanguage(file.language, normalizedPath, errors, index);

    if (typeof file.content !== "string") {
      errors.push(validationError("INVALID_FILE_CONTENT", `${filePath}.content`, "Generated file content must be a string."));
    } else {
      if (!file.content.trim()) {
        errors.push(validationError("EMPTY_FILE", `${filePath}.content`, "Generated file content must not be empty."));
      }

      if (file.content.includes("\0")) {
        errors.push(validationError("INVALID_FILE_CONTENT", `${filePath}.content`, "Generated file content must be text without null bytes."));
      }

      const bytes = Buffer.byteLength(file.content, "utf8");
      totalBytes += bytes;
      if (bytes > MAX_FILE_BYTES) {
        errors.push(validationError("FILE_SIZE_EXCEEDED", `${filePath}.content`, `Generated file content may not exceed ${MAX_FILE_BYTES} bytes.`));
      }

      if (containsSensitiveContent(file.content, normalizedPath)) {
        errors.push(validationError("SENSITIVE_CONTENT", `${filePath}.content`, "Generated file contains a prohibited secret or private key."));
      }
    }

    if (normalizedPath && hasSensitiveFileName(normalizedPath)) {
      errors.push(validationError("SENSITIVE_FILE", `${filePath}.path`, "Generated file name is not allowed."));
    }

    if (pathResult.valid && typeof file.language === "string" && typeof file.content === "string") {
      files.push({
        path: normalizedPath,
        language: file.language.trim().toLowerCase(),
        content: file.content,
      });
    }
  });

  if (totalBytes > MAX_TOTAL_BYTES) {
    errors.push(validationError("TOTAL_SIZE_EXCEEDED", "files", `Generated project content may not exceed ${MAX_TOTAL_BYTES} bytes.`));
  }

  return { files, paths, totalBytes };
}

function validateRequiredStructure(payload, files, paths, errors) {
  REQUIRED_FILES.forEach((requiredPath) => {
    if (!paths.has(requiredPath)) {
      errors.push(validationError("MISSING_REQUIRED_FILE", "files", `Required file is missing: ${requiredPath}.`));
    }
  });

  if (paths.has("frontend/src/main.jsx") && paths.has("frontend/src/main.tsx")) {
    errors.push(validationError("DUPLICATE_ENTRYPOINT_VARIANT", "files", "Only one frontend main entrypoint variant may be generated."));
  }

  if (!paths.has("frontend/src/main.jsx") && !paths.has("frontend/src/main.tsx")) {
    errors.push(validationError("MISSING_REQUIRED_FILE", "files", "A frontend/src/main.jsx or frontend/src/main.tsx file is required."));
  }

  if (!paths.has("frontend/src/App.jsx") && !paths.has("frontend/src/App.tsx")) {
    errors.push(validationError("MISSING_REQUIRED_FILE", "files", "A frontend/src/App.jsx or frontend/src/App.tsx file is required."));
  }

  if (!paths.has("backend/src/server.js") && !paths.has("backend/src/server.ts")) {
    errors.push(validationError("MISSING_REQUIRED_FILE", "files", "A backend/src/server.js or backend/src/server.ts file is required."));
  }

  if (!paths.has("backend/src/app.js") && !paths.has("backend/src/app.ts")) {
    errors.push(validationError("MISSING_REQUIRED_FILE", "files", "A backend/src/app.js or backend/src/app.ts file is required."));
  }

  const entrypoints = payload.project?.entrypoints;
  if (isPlainObject(entrypoints)) {
    ["frontend", "backend"].forEach((field) => {
      const entrypoint = entrypoints[field];
      const result = validateGeneratedPath(entrypoint);
      if (!result.valid) {
        errors.push(validationError(result.error.code, `project.entrypoints.${field}`, result.error.message));
      } else if (!paths.has(result.normalizedPath)) {
        errors.push(validationError("MISSING_ENTRYPOINT_FILE", `project.entrypoints.${field}`, "Declared entrypoint does not reference a generated file."));
      }
    });

    if (isNonEmptyString(entrypoints.frontend) && !["frontend/src/main.jsx", "frontend/src/main.tsx"].includes(entrypoints.frontend.trim())) {
      errors.push(validationError("INVALID_ENTRYPOINT", "project.entrypoints.frontend", "Frontend entrypoint must be frontend/src/main.jsx or frontend/src/main.tsx."));
    }

    if (isNonEmptyString(entrypoints.backend) && !["backend/src/server.js", "backend/src/server.ts"].includes(entrypoints.backend.trim())) {
      errors.push(validationError("INVALID_ENTRYPOINT", "project.entrypoints.backend", "Backend entrypoint must be backend/src/server.js or backend/src/server.ts."));
    }
  }
}

function validatePackageFiles(payload, files, errors) {
  files.forEach((file, index) => {
    if (path.posix.basename(file.path) !== "package.json") return;
    const packageErrors = validatePackageJson(file.content, file.path);
    packageErrors.forEach((packageError) => {
      errors.push({
        ...packageError,
        path: packageError.path.replace(file.path, `files[${index}].content.${file.path}`),
      });
    });
  });
}

function validateGeneratedProject(payload) {
  const errors = [];
  if (!validateTopLevel(payload, errors)) return { valid: false, errors, value: null };

  validateProjectMetadata(payload.project, errors);

  const { files, paths } = validateFiles(payload, errors);
  validatePackageFiles(payload, files, errors);
  validateRequiredStructure(payload, files, paths, errors);

  if (errors.length > 0) return { valid: false, errors, value: null };

  return {
    valid: true,
    errors: [],
    value: {
      schemaVersion: 1,
      project: {
        name: payload.project.name.trim(),
        summary: payload.project.summary.trim(),
        stack: normalizeStack(payload.project.stack),
        entrypoints: {
          frontend: payload.project.entrypoints.frontend.trim(),
          backend: payload.project.entrypoints.backend.trim(),
        },
      },
      files,
    },
  };
}

module.exports = {
  MAX_FILES,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
  validateGeneratedProject,
};
