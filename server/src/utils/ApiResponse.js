// src/utils/apiResponse.js

/**
 * Classe utilitária para padronizar respostas da API.
 * 
 * Todas as respostas seguem o formato:
 * {
 *   success: boolean,
 *   status: number,
 *   message: string,
 *   data?: any
 * }
 */
export default class ApiResponse {
    constructor(success, status, message, data = null) {
        this.success = success;
        this.status = status;
        this.message = message;
        if (data !== null) this.data = data;
    }

    /**
     * Envia a resposta padronizada via Express Response.
     * @param {Response} res - Objeto de resposta do Express
     * @returns {Response}
     */
    send(res) {
        return res.status(this.status).json(this);
    }

    // -------------------------
    // ✅ MÉTODOS DE SUCESSO
    // -------------------------
    static OK(res, message = "Operação bem-sucedida", data = null) {
        return new ApiResponse(true, 200, message, data).send(res);
    }

    static OK_PAGINATED(res, message = "Operação bem-sucedida", page, limit, totalPages, data = null) {
        return new ApiResponse(true, 200, message, {page, limit, totalPages, data} ).send(res);
    }

    static CREATED(res, message = "Recurso criado com sucesso", data = null) {
        return new ApiResponse(true, 201, message, data).send(res);
    }

    static NO_CONTENT(res, message = "Nenhum conteúdo") {
        return new ApiResponse(true, 204, message).send(res);
    }

    // -------------------------
    // ❌ MÉTODOS DE ERRO
    // -------------------------
    static BADREQUEST(res, message = "Requisição inválida") {
        return new ApiResponse(false, 400, message).send(res);
    }

    static UNAUTHORIZED(res, message = "Não autorizado") {
        return new ApiResponse(false, 401, message).send(res);
    }

    static FORBIDDEN(res, message = "Acesso negado") {
        return new ApiResponse(false, 403, message).send(res);
    }

    static NOTFOUND(res, message = "Recurso não encontrado") {
        return new ApiResponse(false, 404, message).send(res);
    }

    static CONFLICT(res, message = "Conflito de dados") {
        return new ApiResponse(false, 409, message).send(res);
    }

    static ERROR(res, message = "Erro interno do servidor") {
        return new ApiResponse(false, 500, message).send(res);
    }
}
