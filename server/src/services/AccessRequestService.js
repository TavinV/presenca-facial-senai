import BaseService from "./BaseService.js";
import AccessRequest from "../models/accessRequestModel.js";
import { NotFoundError } from "../errors/appError.js";

class AccessRequestService extends BaseService {
    constructor() {
        super(AccessRequest);
    }

    #stripSensitiveData(accessRequest) {
        if (!accessRequest) return null;
        const obj = accessRequest.toObject ? accessRequest.toObject() : { ...accessRequest };
        delete obj.password;
        return obj;
    }

    /**
     * Remove dados sensíveis de um array de usuários
     */
    #stripSensitiveArray(requests) {
        return requests.map(r => this.#stripSensitiveData(r));
    }

    async create(data) {
        const created = await super.create(data);
        return this.#stripSensitiveData(created);
    }

    async getById(id) {
        const accessRequest = await super.getById(id);
        if (!accessRequest) {
            throw new NotFoundError("Requisição de acesso não encontrada.");
        }
        return this.#stripSensitiveData(accessRequest);
    }

    async getByIdSensitive(id) {
        const accessRequest = await super.getById(id);
        if (!accessRequest) {
            throw new NotFoundError("Requisição de acesso não encontrada.");
        }
        return accessRequest;
    }

    async getAll() {
        const accessRequests = await super.getAll();
        return this.#stripSensitiveArray(accessRequests);
    }

    /**
     * Busca requisição de acesso por CPF
     */
    async getByCpf(cpf) {
        const accessRequest = await this.model.findOne({ cpf });
        if (!accessRequest) {
            throw new NotFoundError("Requisição de acesso não encontrada.");
        }

        return this.#stripSensitiveData(accessRequest);
    }
}

export default new AccessRequestService();