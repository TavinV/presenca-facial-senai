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
        .pattern(/^\d{11}$/)
        .messages({
            "string.base": "O CPF deve ser um texto válido.",
            "string.empty": "O CPF não pode estar vazio.",
            "string.pattern.base": "O CPF deve conter exatamente 11 números.",
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
            "any.only": "O papel deve ser professor ou coordenador.",
            "string.base": "O papel deve ser um texto válido.",
            "string.empty": "O papel é obrigatório.",
            "any.required": "O papel é obrigatório."
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
        name: baseSchema.name.optional(),
        email: baseSchema.email.optional(),
        password: baseSchema.password.optional(),
        role: baseSchema.role.optional(),
        status: baseSchema.status.optional(),
    })
        .min(1)
        .messages({
            "object.min": "Envie pelo menos um campo para atualização."
        }),
};
