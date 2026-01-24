import {
    ValidationError,
    NotFoundError,
    ConflictError,
    AppError,
} from "../errors/appError.js";

import logger from "../utils/logger.js";

export default class BaseService {
    constructor(model) {
        if (!model) throw new AppError("Model não fornecido para o serviço");
        this.model = model;
    }

    async getAll(filter = {}) {
        try {
            const items = await this.model.find(filter);
            return items;
        } catch (err) {
            throw new AppError("Erro ao buscar registros");
        }
    }

    async getAllPaginated({page = 1, limit = 10, filter = {}}) {
        try {
            const skip = (page - 1) * limit;
            const [items, total] = await Promise.all([
                this.model.find(filter).skip(skip).limit(limit),
                this.model.countDocuments(filter)
            ]);
            const totalPages = Math.ceil(total / limit);

            return { items, total, page, limit, totalPages };
        } catch (error) {
            throw new AppError(`Erro ao buscar registros de ${this.model.modelName} paginados`);
        }
    }

    async getById(id) {
        if (!id) throw new ValidationError("ID é obrigatório");
        try {
            const item = await this.model.findById(id);
            // retornando "esse {modelo} não foi encontrado" como NotFoundError
            if (!item) throw new NotFoundError(this.model.modelName + " não encontrado");
            return item;
        } catch (err) {
            if (err.name === "CastError") throw new ValidationError("ID inválido");
            throw err;
        }
    }

    async bulkCreate(attList) {
        logger.info(`Criando múltiplos ${this.model.modelName}s em bulk: ${attList.length} itens`);
        return this.model.insertMany(attList);
    }


    async create(data) {
        if (!data) throw new ValidationError("Dados obrigatórios ausentes");
        try {
            logger.info(`Criando novo ${this.model.modelName}`);
            return await this.model.create(data);
        } catch (err) {

            // erro de índice único → duplicidade
            if (err.code === 11000){
                console.error("⚠️ ERRO DE DUPLICIDADE:", err.keyValue);
                const field = Object.keys(err.keyValue)[0];
                throw new ConflictError("Registro duplicado, já existe um registro com o mesmo " + field + ".");
            }

            // erro de validação mongoose
            if (err.name === "ValidationError")
                throw new ValidationError(err.message);

            // erro de cast (ObjectId inválido)
            if (err.name === "CastError")
                throw new ValidationError(`ID inválido: ${err.value}`);

            // Se estamos rodando testes, mostrar erro completo
            if (process.env.NODE_ENV === "test") {
                console.error("⚠️ ERRO DETALHADO:", err);
                throw err; // <-- joga o erro original
            }

            throw new AppError("Erro ao criar registro");
        }

    }

    async update(id, data) {
        if (!id) throw new ValidationError("ID é obrigatório");
        try {
            logger.info(`Atualizando ${this.model.modelName} com ID: ${id}`);
            const updated = await this.model.findByIdAndUpdate(id, data, { new: true });
            if (!updated) throw new NotFoundError("Registro não encontrado");
            return updated;
        } catch (err) {
            if (err.name === "CastError") throw new ValidationError("ID inválido");
            if (err.name == "NotFoundError") throw new NotFoundError("Registro não encontrado");
            throw new AppError("Erro ao atualizar registro");
        }
    }

    async delete(id) {
        if (!id) throw new ValidationError("ID é obrigatório");
        const found = this.model.findById(id);
        if (!found) throw new ValidationError("Registro não encontrado.");

        try {
            logger.info(`Deletando ${this.model.modelName} com ID: ${id}`);
            const deleted = await this.model.findByIdAndDelete(id);
            if (!deleted) throw new NotFoundError("Registro não encontrado");
            return deleted;
        } catch (err) {
            if (err.name === "CastError") throw new ValidationError("ID inválido");
            throw new AppError("Erro ao deletar registro");
        }
    }
    
}
