import Joi from "joi";

/**
 * Campos base usados tanto na criação quanto na atualização
 */
const baseSchema = {
    name: Joi.string()
        .min(2)
        .max(100)
        .messages({
            "string.base": "O nome deve ser um texto válido.",
            "string.empty": "O nome não pode estar vazio.",
            "string.min": "O nome deve ter no mínimo {#limit} caracteres.",
            "string.max": "O nome deve ter no máximo {#limit} caracteres.",
            "any.required": "O nome é obrigatório."
        }),

    cpf: Joi.string()
        .pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
        .messages({
            "string.base": "O CPF deve ser um texto válido.",
            "string.empty": "O CPF não pode estar vazio.",
            "string.pattern.base": "O CPF deve estar no formato xxx.xxx.xxx-xx.",
            "any.required": "O CPF é obrigatório."
        }),


    email: Joi.string()
        .email()
        .messages({
            "string.base": "O e-mail deve ser um texto válido.",
            "string.empty": "O e-mail não pode estar vazio.",
            "string.email": "Informe um e-mail válido.",
            "any.required": "O e-mail é obrigatório."
        }),

    password: Joi.string()
        .min(6)
        .max(255)
        .messages({
            "string.base": "A senha deve ser um texto válido.",
            "string.empty": "A senha não pode estar vazia.",
            "string.min": "A senha deve ter no mínimo {#limit} caracteres.",
            "string.max": "A senha deve ter no máximo {#limit} caracteres.",
            "any.required": "A senha é obrigatória."
        }),

    role: Joi.string()
        .valid("professor", "coordenador")
        .messages({
            "any.only": "O cargo deve ser professor ou coordenador.",
            "string.base": "O cargo deve ser um texto válido.",
            "string.empty": "O cargo é obrigatório.",
            "any.required": "O cargo é obrigatório."
        }),

    status: Joi.string()
        .valid("pending", "approved", "rejected")
        .messages({
            "any.only": "O status deve ser pending, approved ou rejected.",
            "string.base": "O status deve ser um texto válido."
        }),
};

/**
 * Schemas específicos para criação e atualização
 */
export const accessRequestSchemas = {
    // Criação de solicitação de acesso
    create: Joi.object({
        name: baseSchema.name.required(),
        cpf: baseSchema.cpf.required(),
        email: baseSchema.email.required(),
        password: baseSchema.password.required(),
        role: baseSchema.role.required(),
    }),

    // Atualização de solicitação de acesso
    update: Joi.object({
        status: baseSchema.status.required(),
    })
        .min(1)
        .messages({
            "any.required": "O status é obrigatório."
        }),
};
