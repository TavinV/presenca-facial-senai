import ApiResponse from "../utils/ApiResponse.js";
import UserService from "../services/UserService.js";
import controllerWrapper from "../utils/controllerWrapper.js";
import AccessRequestService from "../services/AccessRequestService.js";

import { userSchemas } from "../validations/userValidation.js";

const userController = {
    create: controllerWrapper(async (req, res) => {
        const requestId = req.body.accessRequestId;

        if (!requestId){
            return ApiResponse.BADREQUEST(res, "O ID da requisição de acesso é obrigatório.");
        }

        const requestInfo = await AccessRequestService.getByIdSensitive(requestId);

        if (!requestInfo){
            return ApiResponse.NOTFOUND(res, "Requisição de acesso não encontrada.");
        }

        const {error, value} = userSchemas.create.validate({
            name: requestInfo.name,
            email: requestInfo.email,
            password: requestInfo.password,
            role: requestInfo.role,
        }, {abortEarly: true, stripUnknown: true});

        if (error){
            return ApiResponse.BADREQUEST(res, `Dados de usuário inválidos: ${error.message}`);
        }

        const newUser = await UserService.create(value);
        
        if (!newUser){
            return ApiResponse.ERROR(res, "Erro ao criar o usuário.");
        }

        AccessRequestService.delete(requestId);
        return ApiResponse.CREATED(res, "Usuário criado com sucesso.", newUser);
    }),

    getAll: controllerWrapper(async (req, res) => {
        const users = await UserService.getAll();
        return ApiResponse.OK(res, "", users);
    }),

    getMe: controllerWrapper(async (req, res) => {
        return ApiResponse.OK(res, "", req.user);
    }),

    getById: controllerWrapper(async (req, res) => {
        const id = req.params.id;
        const user = await UserService.getById(id);
        return ApiResponse.OK(res, "", user);
    }),

    changePassword: controllerWrapper(async (req, res) => {
        const {oldPassword, newPassword, confirmNewPassword} = req.body;
        const id = req.user.id;

        if (!oldPassword || !newPassword || !confirmNewPassword){
            return ApiResponse.BADREQUEST(res, "Todos os campos são obrigatórios.");
        }

        if (confirmNewPassword != newPassword) {
            return ApiResponse.BADREQUEST(res, "As senhas não coincidem.");
        }

        const updatedUser = await UserService.updatePassword(id, oldPassword, newPassword);
        return ApiResponse.OK(res, "Senha atualizada com sucesso.", updatedUser);
    }),

    activateUser: controllerWrapper(async (req, res) =>{
        const id = req.params.id;
        
        const updatedUser = await UserService.update(id, {isActive: true});

        return ApiResponse.OK(res, "Usuário ativado com sucesso.", updatedUser);
    }),

    deactivateUser: controllerWrapper(async (req, res) =>{
        const id = req.params.id;
        
        const updatedUser = await UserService.update(id, {isActive: false});

        return ApiResponse.OK(res, "Usuário desativado com sucesso.", updatedUser);
    }),

    updateUser: controllerWrapper(async (req, res) =>{
        const id = req.params.id;
        const user = req.user.id;

        // Apenas administradores ou o próprio usuário podem atualizar
        if (user !== id && req.user.role !== "coordenador"){
            return ApiResponse.FORBIDDEN(res, "Você não tem permissão para atualizar este usuário.");
        } 
        const updatedUser = await UserService.update(id, req.body);

        return ApiResponse.OK(res, "Usuário atualizado com sucesso.", updatedUser);
    }),

    deleteUser: controllerWrapper(async (req, res) =>{
        const id = req.params.id;

        const deletedUser = await UserService.delete(id);

        return ApiResponse.NO_CONTENT(res, "Usuário deletado com sucesso.")
    }),

};

export default userController;
