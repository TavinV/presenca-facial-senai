import ApiResponse from "../utils/ApiResponse.js";

export default function facialApiAuth(req, res, next) {
    const key = req.headers["facial-api-key"];

    // Se não enviar a chave
    if (!key) {
        return ApiResponse.FORBIDDEN(res, "Acesso negado. Header 'facial-api-key' ausente.");
    }

    // Se a chave for inválida
    if (key !== process.env.FACIAL_API_KEY) {
        return ApiResponse.FORBIDDEN(res, "Acesso negado. Chave facial-api-key inválida.");
    }

    // Tudo certo
    next();
}
