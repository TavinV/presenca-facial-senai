import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import xss from "xss-clean";
import { configDotenv } from "dotenv";
import { connectDB } from "./config/db.js";

const app = express();

// Configurando as variáveis de ambiente
configDotenv()

// Conexão com MongoDB
connectDB();

// Middlewares globais
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
// app.use(helmet());

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

app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/class-sessions', classSessionRoutes);
app.use('/api/attendances', attendanceRoutes)

export default app;
