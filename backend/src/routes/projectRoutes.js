const express = require("express");

const {
  createProject,
  getProjects,
  getProject,
  updateEditor,
  updateProject,
  deleteProject,
  generateProjectForUser,
  exportProject,
} = require("../controllers/projectController");

const router = express.Router();

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProject);
router.patch("/:id/editor", updateEditor);
router.get("/:id/export", exportProject);
router.post("/:id/generate", generateProjectForUser);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;
