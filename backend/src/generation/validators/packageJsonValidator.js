const PACKAGE_NAME_PATTERN = /^(?:@[a-z0-9][a-z0-9._~-]*\/[a-z0-9][a-z0-9._~-]*|[a-z0-9][a-z0-9._~-]*)$/;
const PACKAGE_VERSION_PATTERN = /^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[0-9A-Za-z-]*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const DEPENDENCY_VERSION_PATTERN = /^[0-9A-Za-z*^~<>=|().,\-+ ]+$/;
const ALLOWED_SCRIPTS = new Set(["dev", "build", "start", "preview", "lint"]);
const LIFECYCLE_SCRIPTS = new Set(["preinstall", "install", "postinstall", "prepare"]);
const DANGEROUS_SCRIPT_PATTERN = /;|&&|\|\||\||>|<|`|\$\(|\bcurl\b|\bwget\b|\bpowershell\b|\bpwsh\b|\bcmd\.exe\b|\brm\s+-rf\b|\bchmod\b|\bsudo\b/i;
const UNSAFE_DEPENDENCY_PATTERN = /^(?:file:|link:|workspace:|git:|git\+|github:|http:|https:)|(?:^|[\\/])\.\.?(?:[\\/]|$)/i;

function isPlainObject(value) {
  if (value === null || typeof value !== "object") return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function error(code, path, message) {
  return { code, path, message };
}

function isValidPackageName(value) {
  return typeof value === "string" && value === value.trim() && PACKAGE_NAME_PATTERN.test(value);
}

function isValidPackageVersion(value) {
  return typeof value === "string" && value === value.trim() && PACKAGE_VERSION_PATTERN.test(value);
}

function isValidDependencyVersion(value) {
  return typeof value === "string" && value === value.trim() && value.length > 0 && DEPENDENCY_VERSION_PATTERN.test(value);
}

function validateDependencyMap(value, field) {
  const errors = [];

  if (!isPlainObject(value)) {
    return [error("INVALID_DEPENDENCIES", field, `${field} must be an object.`)];
  }

  Object.entries(value).forEach(([name, version]) => {
    if (!isValidPackageName(name)) {
      errors.push(error("INVALID_DEPENDENCY_NAME", `${field}.${name}`, "Dependency name is invalid."));
    }

    if (typeof version !== "string" || !version.trim()) {
      errors.push(error("INVALID_DEPENDENCY_VERSION", `${field}.${name}`, "Dependency version is invalid."));
      return;
    }

    if (UNSAFE_DEPENDENCY_PATTERN.test(version.trim())) {
      errors.push(error("UNSAFE_DEPENDENCY_SOURCE", `${field}.${name}`, "Local, URL, workspace, or Git dependency sources are not allowed."));
      return;
    }

    if (!isValidDependencyVersion(version)) {
      errors.push(error("INVALID_DEPENDENCY_VERSION", `${field}.${name}`, "Dependency version is invalid."));
    }
  });

  return errors;
}

function validatePackageJson(content, filePath = "package.json") {
  const errors = [];
  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch {
    return [error("INVALID_PACKAGE_JSON", filePath, "package.json content must be valid JSON.")];
  }

  if (!isPlainObject(parsed)) {
    return [error("INVALID_PACKAGE_JSON", filePath, "package.json must contain a JSON object.")];
  }

  if (!isValidPackageName(parsed.name)) {
    errors.push(error("INVALID_PACKAGE_NAME", `${filePath}.name`, "package.json requires a valid package name."));
  }

  if (!isValidPackageVersion(parsed.version)) {
    errors.push(error("INVALID_PACKAGE_VERSION", `${filePath}.version`, "package.json requires a valid version string."));
  }

  ["dependencies", "devDependencies", "peerDependencies"].forEach((field) => {
    if (parsed[field] !== undefined) {
      errors.push(...validateDependencyMap(parsed[field], `${filePath}.${field}`));
    }
  });

  if (parsed.scripts !== undefined) {
    if (!isPlainObject(parsed.scripts)) {
      errors.push(error("INVALID_SCRIPTS", `${filePath}.scripts`, "package.json scripts must be an object."));
    } else {
      Object.entries(parsed.scripts).forEach(([scriptName, command]) => {
        if (LIFECYCLE_SCRIPTS.has(scriptName) || !ALLOWED_SCRIPTS.has(scriptName)) {
          errors.push(error("UNSAFE_SCRIPT_NAME", `${filePath}.scripts.${scriptName}`, "This npm script is not allowed."));
        }

        if (typeof command !== "string" || !command.trim()) {
          errors.push(error("INVALID_SCRIPT", `${filePath}.scripts.${scriptName}`, "Npm script command must be a non-empty string."));
        } else if (DANGEROUS_SCRIPT_PATTERN.test(command)) {
          errors.push(error("UNSAFE_SCRIPT_COMMAND", `${filePath}.scripts.${scriptName}`, "Npm script contains a prohibited shell construct."));
        }
      });
    }
  }

  return errors;
}

module.exports = {
  ALLOWED_SCRIPTS,
  validatePackageJson,
};
