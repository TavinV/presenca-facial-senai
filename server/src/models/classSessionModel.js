import mongoose from "mongoose";

const classSessionSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true
    },

    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    subjectCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80
    },

    // Data da aula (dia)
    date: {
      type: Date,
      required: true,
      index: true
    },

    // Quando realmente foi iniciada
    startedAt: {
      type: Date,
      default: Date.now,
      index: true
    },

    // Quando deve terminar
    endsAt: {
      type: Date,
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
      index: true
    },

    closedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model("ClassSession", classSessionSchema);
