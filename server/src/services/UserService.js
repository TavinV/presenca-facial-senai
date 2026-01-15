import BaseService from "./BaseService.js";
import User from "../models/userModel.js";
import { userSchemas } from "../validations/userValidation.js";
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "../errors/appError.js";
import AccessRequestService from "./AccessRequestService.js";
import bcrypt from "bcrypt";

class UserService extends BaseService {
    constructor() {
        super(User);
    }

    /**
     * Remove dados sensíveis de um objeto de usuário.
     * Funciona tanto para Document quanto para objeto literal.
     */
    #stripSensitiveData(user) {
        if (!user) return null;

        const obj = user.toObject ? user.toObject() : { ...user };
        delete obj.password;
        return obj;
    }

    /**
     * Remove dados sensíveis de um array de usuários
     */
    #stripSensitiveArray(users) {
        return users.map(u => this.#stripSensitiveData(u));
    }

    /**
     * Criação de usuário com hash de senha
     */
    async create(userData) {
        const created = await super.create(userData);
        return this.#stripSensitiveData(created);
    }

    /**
     * Buscar por e-mail
     */
    async getByEmail(email) {
        const user = await this.model.findOne({ email });
        if (!user) throw new NotFoundError("Usuário não encontrado");
        return user;
    }

    /**
     * Buscar todos com senha removida
     */
    async getAll() {
        const users = await super.getAll();
        return this.#stripSensitiveArray(users);
    }

    /**
     * Buscar por ID com senha removida
     */
    async getById(id, stripData = true) {
        const user = await super.getById(id);
        let data = user;

        if (stripData){
            data = this.#stripSensitiveData(user);
        }

        return data;
    }

    async update(id, data){
        return this.#stripSensitiveData(await super.update(id, data))
    }

    /**
     * Procura um e-mail e valida a senha
     */
    async matchUserLogin(email, password){
        const userByEmail = await this.getByEmail(email);
        const isMatch = await bcrypt.compare(password, userByEmail.password);
        if (!isMatch){
            throw new ValidationError("Credenciais inválidas")
        }

        return this.#stripSensitiveData(userByEmail)
    }

    /**
     * Altera a senha do usuário
     */
    async updatePassword(id, oldPassword, newPassword) {
        const userById = await this.getById(id, false);
        if (!userById) throw new NotFoundError("Usuário não encontrado.");

        const isMatch = await bcrypt.compare(oldPassword, userById.password);
        
        if (!isMatch) throw new UnauthorizedError("Senha incorreta.");

        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const updatedUser = await super.update(id, {password: hashedPassword});

        return this.#stripSensitiveData(updatedUser);
    }
}

export default new UserService();
