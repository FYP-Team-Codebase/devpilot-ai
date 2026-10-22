const mongoose = require("mongoose");

const assetSelectionSchema = new mongoose.Schema({
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", required: true },
  purpose: { type: String, enum: ["logo", "background", "content-image", "design-reference", "requirements-document", "icon-illustration", "portfolio-gallery", "other"], required: true },
  customPurpose: { type: String, trim: true, maxlength: 160, default: "" },
  placement: { type: String, enum: ["ai", "header", "footer", "hero", "product", "gallery", "section", "other"], default: "ai" },
  placementDetails: { type: String, trim: true, maxlength: 160, default: "" },
  instructions: { type: String, trim: true, maxlength: 1000, default: "" },
  order: { type: Number, min: 0, max: 19, default: 0 },
}, { _id: false });

const requirementsSchema = new mongoose.Schema(
  {
    projectType: {
      type: String,
      trim: true,
      default: "",
    },
    designPreferences: {
      type: [String],
      default: [],
    },
    pages: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    devices: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    assetIds: { type: [mongoose.Schema.Types.ObjectId], ref: "Asset", default: [] },
  },
  {
    _id: false,
  }
);

const inspirationSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      trim: true,
      default: "",
    },
    inspirationId: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: "Asset", default: null },
  },
  {
    _id: false,
  }
);

const projectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    projectName: {
      type: String,
      trim: true,
      default: "Untitled Project",
    },
    prompt: {
      type: String,
      trim: true,
      default: "",
    },
    requirements: {
      type: requirementsSchema,
      default: () => ({}),
    },
    inspirations: {
      type: [inspirationSchema],
      default: [],
    },
    // Project-specific roles let one library asset serve different purposes in different projects.
    assetSelections: { type: [assetSelectionSchema], default: [] },
    generationStatus: {
      type: String,
      enum: ["draft", "ready", "generating", "completed", "failed"],
      default: "draft",
    },
    generationStartedAt: { type: Date, default: null },
    generationRunId: { type: String, default: "", select: false },
    generatedFiles: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    editorDesign: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({}),
    },
    generationError: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
