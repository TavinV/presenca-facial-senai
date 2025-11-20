import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ClassSession",
            required: true,
        },

        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },

        classCode: {
            type: String,
            required: true,
            uppercase: true,
        },

        status: {
            type: String,
            enum: ["presente", "atrasado", "ausente"],
            default: "presente",
        },

        checkInTime: {
            type: Date,
            default: null,
        },

        recordedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        viaFacial: {
            type: Boolean,
            default: true,
        },

        method: {
            type: String,
            enum: ["facial", "manual"],
            required: true,
        }
    },
    { timestamps: true }
);

export default mongoose.model("Attendance", attendanceSchema);
