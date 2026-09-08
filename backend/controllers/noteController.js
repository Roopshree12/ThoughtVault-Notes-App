const mongoose = require("mongoose");
const Note = require("../models/Note");

// Create a note
const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content ? content.trim() : "",
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("Create note error:", error);

    res.status(500).json({
      message: "Failed to create note",
    });
  }
};

// Get all notes
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find().sort({
      createdAt: -1,
    });

    res.status(200).json(notes);
  } catch (error) {
    console.error("Get notes error:", error);

    res.status(500).json({
      message: "Failed to fetch notes",
    });
  }
};

// Delete a note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete note error:", error);

    res.status(500).json({
      message: "Failed to delete note",
    });
  }
};

const updateNote = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required",
      });
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        content: content || "",
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!note) {
      return res.status(404).json({
        message: "Note not found",
      });
    }

    res.status(200).json(note);
  } catch (error) {
    console.error("Update note error:", error);

    res.status(500).json({
      message: "Failed to update note",
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  deleteNote,
  updateNote,
};
