import mongoose from "mongoose";

const facialEmbeddingSchema = new mongoose.Schema(
    {
        embedding: {
            type: String,
            required: true,
            select: false 
        },
        
        photos_processed: {
            type: Number,
            required: true,
            default: 3,
        },

        nonce: {
            type: String,
            required: true,
            select: false
        },
        alg: {
            type: String,
            default: "AES-256-GCM"
        },
        version: {
            type: Number,
            default: 1
        }
    },
    { _id: false }
);

const studentSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },

        registration: {
            type: String,
            required: true,
            unique: true
        },

        facialEmbedding: {
            type: facialEmbeddingSchema,
            required: false // aluno pode existir sem rosto cadastrado
        },

        classes: [
            {
                type: String,
                uppercase: true,
                trim: true
            }
        ],

        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
