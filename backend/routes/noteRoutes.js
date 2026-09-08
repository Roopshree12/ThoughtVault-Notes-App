const express = require("express");

const {
  createNote,
  getNotes,
  deleteNote,
  updateNote,
} = require("../controllers/noteController");

const router = express.Router();

// POST /notes
router.post("/", createNote);

// GET /notes
router.get("/", getNotes);

// PUT /notes/:id
router.put("/:id", updateNote);

// DELETE /notes/:id
router.delete("/:id", deleteNote);

module.exports = router;