import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { configDotenv } from "dotenv";
import { connectDB } from "./config/db.js";

const app = express();

// Configurando as variáveis de ambiente
configDotenv()

// Conexão com MongoDB
connectDB();

// Middlewares globais
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Configuração de CORS para permitir requisições de qualquer origem
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

// Rate limiting (exemplo: máx. 100 reqs por 15 min)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Muitas requisições deste IP, tente novamente mais tarde."
});
app.use(limiter);

// Usando as rotas

import healthRoutes from './routes/healthRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import classRoutes from './routes/classRoutes.js'
import studentRoutes from './routes/studentRoutes.js';
import classSessionRoutes from './routes/classSessionRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import roomRoutes from './routes/roomRoutes.js';    
import totemRoutes from './routes/totemRoutes.js';
import accessRequestRoutes from './routes/accessRequestRoutes.js';

app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/class-sessions', classSessionRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/totems', totemRoutes);
app.use('/api/access-requests', accessRequestRoutes);

export default app;
