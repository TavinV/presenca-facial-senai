import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, { dbName: "presenca_facial_senai"});
        console.log(`✅ MongoDB conectado`);
    } catch (error) {
        console.error("❌ Erro ao conectar ao MongoDB:", error.message);
        process.exit(1);
    }
};
