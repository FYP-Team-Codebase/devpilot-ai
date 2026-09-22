const mongoose = require("mongoose");

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
    generationStatus: {
      type: String,
      enum: ["draft", "ready", "generating", "completed", "failed"],
      default: "draft",
    },
    generatedFiles: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);
