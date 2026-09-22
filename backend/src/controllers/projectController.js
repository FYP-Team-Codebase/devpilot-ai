const mongoose = require("mongoose");

const Project = require("../models/Project");

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

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
