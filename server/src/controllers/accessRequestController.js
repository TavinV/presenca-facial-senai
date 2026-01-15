import AccessRequestService from "../services/AccessRequestService.js";
import ApiResponse from "../utils/ApiResponse.js";
import controllerWrapper from "../utils/controllerWrapper.js";
import bcrypt from "bcrypt";

const AccessRequestController = {
    /**
     * Busca requisição de acesso por CPF
     */
    getByCpf: controllerWrapper(async (req, res) => {
        const { cpf } = req.params;
        const accessRequest = await AccessRequestService.getByCpf(cpf);
        return ApiResponse.OK(res, "", accessRequest);
    }),

    /**
     * Busca todas as requisições de acesso
     */
    getAll: controllerWrapper(async (req, res) => {
        const accessRequests = await AccessRequestService.getAll();
        return ApiResponse.OK(res, "", accessRequests);
    }),

    /**
     * Busca requisição de acesso por ID
     */
    getById: controllerWrapper(async (req, res) => {
        const { id } = req.params;
        const accessRequest = await AccessRequestService.getById(id);
        return ApiResponse.OK(res, "", accessRequest);
    }),

    /**
     * Cria uma nova requisição de acesso
     */
    create: controllerWrapper(async (req, res) => {
        const accessRequestData = req.body;
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
        accessRequestData.password = await bcrypt.hash(accessRequestData.password, saltRounds);
        
        const newAccessRequest = await AccessRequestService.create(accessRequestData);
        return ApiResponse.CREATED(res, "Requisição de acesso criada com sucesso.", newAccessRequest);
    }),

    /**
     * Atualiza o status da requisição de acesso
     * */
    updateStatus: controllerWrapper(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        const updatedAccessRequest = await AccessRequestService.updateStatus(id, status);
        return ApiResponse.OK(res, "Status da requisição de acesso atualizado com sucesso.", updatedAccessRequest);
    }),

    /*
    * Deleta uma requisição de acesso
    */
    delete: controllerWrapper(async (req, res) => {
        const { id } = req.params;
        await AccessRequestService.delete(id);
        return ApiResponse.NO_CONTENT(res, "Requisição de acesso deletada com sucesso.");
    }
    ),
};

export default AccessRequestController;
