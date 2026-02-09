import express from "express";
import corsMiddleware from "./config/cors.js";
import rateLimit from "express-rate-limit";
import { configDotenv } from "dotenv";
import { connectDB } from "./config/db.js";

const app = express();

// Configurando as variáveis de ambiente
configDotenv()

// Conexão com MongoDB
connectDB();

// Middlewares globais
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true }));
app.use(corsMiddleware);

// Rate limiting 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
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
