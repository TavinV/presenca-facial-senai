import BaseService from "./BaseService.js";
import AccessRequest from "../models/AccessRequestModel.js";
import { NotFoundError } from "../errors/appError.js";

class AccessRequestService extends BaseService {
    constructor() {
        super(AccessRequest);
    }

    /**
     * Busca requisição de acesso por CPF
     */
    async getByCpf(cpf) {
        const accessRequest = await this.model.findOne({ cpf });
        if (!accessRequest) {
            throw new NotFoundError("Requisição de acesso não encontrada.");
        }
        return accessRequest;
    }
}

export default new AccessRequestService();