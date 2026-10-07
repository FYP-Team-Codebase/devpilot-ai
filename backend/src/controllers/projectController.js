const mongoose = require("mongoose");

const Project = require("../models/Project");
const User = require("../models/User");
const { validateGeneratedPath } = require("../generation/validators/pathValidator");
const {
  buildProjectGenerationContext,
  ProjectGenerationContextError,
} = require("../generation/context/projectGenerationContext");
const {
  generateProject,
  ProjectGenerationError,
} = require("../services/projectGenerationService");

const ALLOWED_TOP_LEVEL_FIELDS = [
  "projectName",
  "prompt",
  "inspirations",
  "generationStatus",
];

const ALLOWED_REQUIREMENT_FIELDS = [
  "projectType",
  "designPreferences",
  "pages",
  "features",
  "devices",
  "notes",
];

const isValidProjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const hasOwn = (source, field) =>
  Object.prototype.hasOwnProperty.call(source, field);

const isMongooseValidationError = (error) => {
  return error?.name === "ValidationError" || error?.name === "CastError";
};

const pickProjectUpdates = (body) => {
  const updates = {};

  ALLOWED_TOP_LEVEL_FIELDS.forEach((field) => {
    if (hasOwn(body, field)) {
      updates[field] = body[field];
    }
  });

  return updates;
};

const mergeRequirements = (currentRequirements, incomingRequirements) => {
  const merged = {
    ...(currentRequirements?.toObject ? currentRequirements.toObject() : currentRequirements),
  };

  ALLOWED_REQUIREMENT_FIELDS.forEach((field) => {
    if (hasOwn(incomingRequirements, field)) {
      merged[field] = incomingRequirements[field];
    }
  });

  return merged;
};

const createProject = async (req, res) => {
  try {
    const body = req.body || {};
    const project = await Project.create({
      user: req.userId,
      projectName: body.projectName,
      prompt: body.prompt,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    if (isMongooseValidationError(error)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project data.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating project.",
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.userId }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while loading projects.",
    });
  }
};

const getProject = async (req, res) => {
  try {
    if (!isValidProjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while loading project.",
    });
  }
};

const updateEditor = async (req, res) => {
  try {
    if (!isValidProjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid project ID." });
    const project = await Project.findOne({ _id: req.params.id, user: req.userId });
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    if (project.generationStatus !== "completed") return res.status(409).json({ success: false, message: "Only completed projects can be edited." });
    const body = req.body || {};
    if (Object.keys(body).some((key) => !["editorDesign", "generatedFiles"].includes(key))) {
      return res.status(400).json({ success: false, message: "Unsupported editor update." });
    }
    if (Object.prototype.hasOwnProperty.call(body, "editorDesign")) {
      const design = body.editorDesign;
      const safeProperties = new Set(["fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textAlign", "color", "backgroundColor", "width", "height", "maxWidth", "minHeight", "marginTop", "marginRight", "marginBottom", "marginLeft", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderWidth", "borderStyle", "borderColor", "borderRadius", "opacity", "boxShadow", "objectFit"]);
      const safeSelector = (selector) => typeof selector === "string" && selector.length <= 1200 && /^body(?:>[a-z][a-z0-9-]*:nth-of-type\([1-9]\d*\))+$/i.test(selector);
      const safeStringMap = (value, allowed, maxLength) => value && typeof value === "object" && !Array.isArray(value)
        && Object.keys(value).every((key) => allowed.has(key) && typeof value[key] === "string" && value[key].length <= maxLength);
      const safePagePath = (path) => typeof path === "string" && path.startsWith("/") && !path.startsWith("//")
        && path.length <= 500 && !/[?#\\\u0000-\u001f]/.test(path) && !path.split("/").includes("..");
      const validPage = (page) => page && typeof page === "object" && !Array.isArray(page)
        && Object.keys(page).length === 1 && page.elements && typeof page.elements === "object" && !Array.isArray(page.elements)
        && Object.keys(page.elements).length <= 500
        && Object.entries(page.elements).every(([selector, values]) => safeSelector(selector)
          && values && typeof values === "object" && !Array.isArray(values)
          && Object.keys(values).every((key) => ["content", "styles", "image", "text", "color", "backgroundColor", "fontSize"].includes(key))
          && (values.content === undefined || (typeof values.content === "string" && values.content.length <= 5000))
          && (values.styles === undefined || safeStringMap(values.styles, safeProperties, 200))
          && (values.image === undefined || safeStringMap(values.image, new Set(["src", "alt"]), 2000))
          && ["text", "color", "backgroundColor", "fontSize"].every((key) => values[key] === undefined || (typeof values[key] === "string" && values[key].length <= 500)));
      const validDesign = design && typeof design === "object" && !Array.isArray(design)
        && Object.keys(design).length === 1 && design.pages && typeof design.pages === "object" && !Array.isArray(design.pages)
        && Object.keys(design.pages).length <= 100
        && Object.entries(design.pages).every(([path, page]) => safePagePath(path) && validPage(page));
      if (!validDesign || JSON.stringify(design).length > 500000) {
        return res.status(400).json({ success: false, message: "Invalid design changes." });
      }
      project.editorDesign = design;
    }
    if (Object.prototype.hasOwnProperty.call(body, "generatedFiles")) {
      const user = await User.findById(req.userId).select("userType");
      if (user?.userType !== "technical") return res.status(403).json({ success: false, message: "Code editing is available to technical users only." });
      if (!Array.isArray(body.generatedFiles) || body.generatedFiles.length > 300) return res.status(400).json({ success: false, message: "Invalid generated files." });
      const paths = new Set();
      const files = body.generatedFiles.map((file) => {
        const pathCheck = validateGeneratedPath(file?.path);
        if (!file || !pathCheck.valid || typeof file.content !== "string" || file.content.length > 1000000 || typeof file.language !== "string" || file.language.length > 40) throw new Error("Invalid file path, content, or language.");
        paths.add(pathCheck.normalizedPath);
        return { path: pathCheck.normalizedPath, content: file.content, language: file.language };
      });
      if (paths.size !== files.length) return res.status(400).json({ success: false, message: "Duplicate file paths are not allowed." });
      project.generatedFiles = files;
    }
    await project.save();
    return res.json({ success: true, project });
  } catch (error) {
    if (error.message === "Invalid file path, content, or language.") return res.status(400).json({ success: false, message: error.message });
    console.error("Update editor error:", error);
    return res.status(500).json({ success: false, message: "Could not save editor changes." });
  }
};

const updateProject = async (req, res) => {
  try {
    const body = req.body || {};

    if (!isValidProjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      user: req.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (hasOwn(body, "generationStatus")) {
      if (project.generationStatus === "generating") {
        return res.status(409).json({ success: false, message: "Generation status cannot be changed while generation is in progress." });
      }
      if (body.generationStatus !== "ready") {
        return res.status(400).json({ success: false, message: "Generation status can only be set to ready from project setup." });
      }
    }

    const updates = pickProjectUpdates(body);

    Object.entries(updates).forEach(([field, value]) => {
      project[field] = value;
    });

    if (
      body.requirements &&
      typeof body.requirements === "object" &&
      !Array.isArray(body.requirements)
    ) {
      project.requirements = mergeRequirements(
        project.requirements,
        body.requirements
      );
    }

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);

    if (isMongooseValidationError(error)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project data.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while updating project.",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    if (!isValidProjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      user: req.userId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting project.",
    });
  }
};

const generateProjectForUser = async (req, res) => {
  const { id } = req.params;
  if (!isValidProjectId(id)) {
    return res.status(400).json({ success: false, message: "Invalid project ID." });
  }

  let claimedProject;
  try {
    const project = await Project.findOne({ _id: id, user: req.userId });
    if (!project) return res.status(404).json({ success: false, message: "Project not found." });
    if (project.generationStatus === "generating") {
      return res.status(409).json({ success: false, message: "This project is already generating." });
    }
    if (!project.prompt?.trim()) {
      return res.status(400).json({ success: false, message: "Add a project prompt before generating." });
    }
    const requirements = project.requirements || {};
    const hasRequirements = Boolean(requirements.projectType || requirements.notes || [
      ...(requirements.pages || []), ...(requirements.features || []),
      ...(requirements.devices || []), ...(requirements.designPreferences || []),
    ].length);
    if (!hasRequirements) {
      return res.status(400).json({ success: false, message: "Complete project requirements before generating." });
    }
    if (!Array.isArray(project.inspirations) || !project.inspirations.length) {
      return res.status(400).json({ success: false, message: "Select at least one inspiration before generating." });
    }

    claimedProject = await Project.findOneAndUpdate(
      { _id: id, user: req.userId, generationStatus: { $ne: "generating" } },
      { $set: { generationStatus: "generating", generationError: "" } },
      { new: true }
    );
    if (!claimedProject) {
      return res.status(409).json({ success: false, message: "This project is already generating." });
    }

    const context = await buildProjectGenerationContext(claimedProject);
    const result = await generateProject(context);
    claimedProject.generatedFiles = result.generatedFiles;
    claimedProject.projectName = result.projectName;
    claimedProject.generationStatus = "completed";
    claimedProject.generationError = "";
    await claimedProject.save();

    return res.status(200).json({
      success: true,
      project: claimedProject,
      generation: result.generationMetadata,
    });
  } catch (error) {
    const safeMessage = error instanceof ProjectGenerationError || error instanceof ProjectGenerationContextError
      ? error.message.slice(0, 500)
      : "Project generation failed. Please try again.";
    if (claimedProject) {
      try {
        await Project.updateOne(
          { _id: id, user: req.userId, generationStatus: "generating" },
          { $set: { generationStatus: "failed", generationError: safeMessage } }
        );
      } catch (persistError) {
        console.error("Unable to persist failed project generation status:", persistError.message);
      }
    }
    if (error?.code === "PROVIDER_NOT_CONFIGURED") {
      return res.status(503).json({ success: false, message: "AI generation is not configured on the server." });
    }
    console.error("Project generation failed:", error?.code || error?.name || "unknown error");
    return res.status(502).json({ success: false, message: safeMessage });
  }
};

const exportProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    if (!isValidProjectId(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid project ID." });
    }
    const project = await Project.findOne({ _id: projectId, user: req.userId });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }
    if (project.generationStatus !== "completed" || !Array.isArray(project.generatedFiles) || !project.generatedFiles.length) {
      return res.status(409).json({ success: false, message: "This project has no completed files to export." });
    }

    const entries = [];
    const paths = new Set();
    for (const file of project.generatedFiles) {
      const checked = validateGeneratedPath(file?.path);
      const contentType = typeof file?.content;
      if (!checked.valid || contentType !== "string") {
        const failures = [];
        if (!checked.valid) {
          failures.push(`path validation failed (${checked.error.code}): ${checked.error.message}`);
        }
        if (contentType !== "string") {
          failures.push(`content must be a string (received ${contentType})`);
        }
        return res.status(422).json({ success: false, message: "Project contains an invalid generated file." });
      }
      if (paths.has(checked.normalizedPath)) {
        return res.status(422).json({ success: false, message: "Project contains duplicate generated file paths." });
      }
      paths.add(checked.normalizedPath);
      entries.push({ name: checked.normalizedPath, content: Buffer.from(file.content, "utf8") });
    }

    // Visual editor changes are stored separately from source edits. Carry the
    // saved design into the exported Vite app and apply it to the matching route.
    if (project.editorDesign?.pages && Object.keys(project.editorDesign.pages).length) {
      const designJsonPath = "frontend/public/devpilot-editor-design.json";
      const designScriptPath = "frontend/public/devpilot-editor-design.js";
      if (paths.has(designJsonPath) || paths.has(designScriptPath)) {
        return res.status(422).json({ success: false, message: "Project uses a reserved path needed to export saved visual editor changes." });
      }
      const htmlEntry = entries.find((entry) => entry.name === "frontend/index.html");
      if (htmlEntry) {
        const html = htmlEntry.content.toString("utf8");
        if (!/<\/body\s*>/i.test(html)) {
          return res.status(422).json({ success: false, message: "Project HTML is missing a body element required to export saved visual changes." });
        }
        htmlEntry.content = Buffer.from(html.replace(/<\/body\s*>/i, '<script src="/devpilot-editor-design.js" defer></script></body>'), "utf8");
      }
      entries.push({ name: designJsonPath, content: Buffer.from(JSON.stringify(project.editorDesign), "utf8") });
      entries.push({ name: designScriptPath, content: Buffer.from(`(function(){
var scriptUrl=document.currentScript&&document.currentScript.src;
if(!scriptUrl)return;
fetch(new URL("./devpilot-editor-design.json",scriptUrl)).then(function(response){if(!response.ok)throw new Error("Saved editor data unavailable");return response.json()}).then(function(design){
function apply(){var page=design&&design.pages&&design.pages[window.location.pathname];if(!page||!page.elements)return;Object.keys(page.elements).forEach(function(selector){try{var node=document.querySelector(selector);if(!node)return;var value=page.elements[selector]||{};var styles=value.styles||{};Object.keys(styles).forEach(function(key){node.style[key]=String(styles[key])});if(typeof value.content==="string"&&node.textContent!==value.content)node.textContent=value.content;if(node.tagName==="IMG"&&value.image){if(typeof value.image.src==="string")node.setAttribute("src",value.image.src);if(typeof value.image.alt==="string")node.setAttribute("alt",value.image.alt)}}catch(_){}})}
var queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;apply()})}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});window.addEventListener("popstate",schedule);window.addEventListener("hashchange",schedule);schedule();
}).catch(function(error){console.error("Could not apply saved DevPilot editor changes:",error)})
})();\n`, "utf8") });
    }

    const filename = `${String(project.projectName || "devpilot-project")
      .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^[.-]+|[.-]+$/g, "").slice(0, 80) || "devpilot-project"}.zip`;
    res.status(200);
    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
      "Cache-Control": "no-store",
    });
    const { ZipArchive } = await import("archiver");
    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on("warning", (error) => {
      if (error.code !== "ENOENT") res.destroy(error);
    });
    archive.on("error", (error) => {
      console.error("Project export archive error:", error.message);
      if (!res.headersSent) res.status(500).json({ success: false, message: "Could not create project ZIP." });
      else res.destroy(error);
    });
    archive.pipe(res);
    entries.forEach((entry) => archive.append(entry.content, { name: entry.name }));
    await archive.finalize();
    return undefined;
  } catch (error) {
    console.error("Export project error:", error);
    if (!res.headersSent) return res.status(500).json({ success: false, message: "Could not export project." });
    return res.destroy(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateEditor,
  updateProject,
  deleteProject,
  generateProjectForUser,
  exportProject,
};
