import BaseService from "./BaseService.js";
import Room from "../models/roomModel.js";
import { ConflictError, NotFoundError } from "../errors/appError.js";

class RoomService extends BaseService {
    constructor() {
        super(Room);
    }

    /**
     * Criar nova sala
     */
    async create(data) {
        const code = data.code.toUpperCase();

        const exists = await Room.findOne({ code });
        if (exists) {
            throw new ConflictError("Já existe uma sala com este código.");
        }

        return super.create({
            ...data,
            code
        });
    }

    /**
     * Buscar sala por código
     */
    async getByCode(code) {
        const room = await Room.findOne({
            code: code.toUpperCase()
        });

        if (!room) {
            throw new NotFoundError("Sala não encontrada.");
        }

        return room;
    }

    /**
     * Atualizar sala
     */
    async update(id, data) {
        if (data.code) {
            data.code = data.code.toUpperCase();

            const exists = await Room.findOne({
                code: data.code,
                _id: { $ne: id }
            });


            if (exists) {
                throw new ConflictError("Já existe uma sala com este código.");
            }
        }

        const updated = await this.model.findByIdAndUpdate(
            id,
            data,
            { new: true }
        );

        if (!updated) {
            throw new NotFoundError("Sala não encontrada.");
        }

        return updated;
    }

    /**
     * Ativar / desativar sala
     */
    async setActive(id, isActive) {
        const room = await Room.findById(id);
        if (!room) {
            throw new NotFoundError("Sala não encontrada.");
        }

        room.isActive = isActive;
        return room.save();
    }

    /**
     * Listar apenas salas ativas
     */
    async getActiveRooms() {
        return Room.find({ isActive: true }).sort({ code: 1 });
    }
}

export default new RoomService();
