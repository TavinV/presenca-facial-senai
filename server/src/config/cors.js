import cors from "cors";

const environment = process.env.NODE_ENV || "development";

// Origens permitidas em produção
const productionOrigins = [
    "https://presenca-facial-senai.vercel.app",
    "https://admin.presenca-facial-senai.vercel.app",
];

// Configuração do CORS
const corsOptions = {
    origin: environment === "production" ? productionOrigins : "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-facial-api-key", "x-totem-api-key"],
    credentials: environment === "production",
};

// Exportar middleware configurado
const corsMiddleware = cors(corsOptions);

export default corsMiddleware;