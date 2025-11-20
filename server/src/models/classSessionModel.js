import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        classId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Class",
            required: true
        },

        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        name: {   // ← NOVO CAMPO OBRIGATÓRIO
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 80
        },

        date: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["open", "closed"],
            default: "open"
        }
    },
    { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
