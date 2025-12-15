import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Para obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir pasta de upload
const uploadDir = path.join(__dirname, '../imgs');

// ✅ CRIAR PASTA SE NÃO EXISTIR
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('📁 Pasta de upload criada:', uploadDir);
}

// Configuração do storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Garantir que a pasta existe (redundância por segurança)
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `image-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Filtro de arquivos (apenas imagens)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas (jpg, jpeg, png)'));
    }
};

// Configuração do upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

export default upload;