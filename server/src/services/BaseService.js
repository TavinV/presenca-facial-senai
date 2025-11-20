import {
    ValidationError,
    NotFoundError,
    ConflictError,
    AppError,
} from "../errors/appError.js";
import classModel from "../models/classModel.js";

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

    async getById(id) {
        if (!id) throw new ValidationError("ID é obrigatório");
        try {
            const item = await this.model.findById(id);
            if (!item) throw new NotFoundError("Registro não encontrado");
            return item;
        } catch (err) {
            if (err.name === "CastError") throw new ValidationError("ID inválido");
            throw err;
        }
    }

    async create(data) {
        if (!data) throw new ValidationError("Dados obrigatórios ausentes");
        try {
            const newItem = new this.model(data);
            return await newItem.save();
        } catch (err) {
            if (err.code === 11000)
                throw new ConflictError("Registro duplicado (campo único já existe)");
            throw new AppError("Erro ao criar registro");
        }
    }

    async update(id, data) {
        if (!id) throw new ValidationError("ID é obrigatório");
        try {
            const updated = await this.model.findByIdAndUpdate(id, data, { new: true });
            if (!updated) throw new NotFoundError("Registro não encontrado");
            return updated;
        } catch (err) {
            if (err.name === "CastError") throw new ValidationError("ID inválido");
            throw new AppError("Erro ao atualizar registro");
        }
    }

    async delete(id) {
        if (!id) throw new ValidationError("ID é obrigatório");
        const found = this.model.findById(id);
        if (!found) throw new ValidationError("Registro não encontrado.");

        try {
            const deleted = await this.model.findByIdAndDelete(id);
            if (!deleted) throw new NotFoundError("Registro não encontrado");
            return deleted;
        } catch (err) {
            if (err.name === "CastError") throw new ValidationError("ID inválido");
            throw new AppError("Erro ao deletar registro");
        }
    }
    
}
