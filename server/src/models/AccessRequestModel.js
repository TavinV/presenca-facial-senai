import mongoose from "mongoose";

const AccessRequest = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    cpf: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["professor", "coordenador"],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
}, { timestamps: true });  

AccessRequest.index(
    { cpf: 1 },
    { unique: true }
);

export default mongoose.model("AccessRequest", AccessRequest);
