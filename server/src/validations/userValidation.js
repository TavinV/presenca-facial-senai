import Joi from "joi";

/**
 * Schema base — campos e tipos comuns a todas as operações
 */
const baseSchema = {
    name: Joi.string()
        .min(3)
        .max(100)
        .messages({
            "string.base": "O nome deve ser um texto válido.",
            "string.empty": "O nome não pode estar vazio.",
            "string.min": "O nome deve ter no mínimo {#limit} caracteres.",
            "string.max": "O nome deve ter no máximo {#limit} caracteres.",
        }),

    email: Joi.string()
        .email()
        .messages({
            "string.base": "O e-mail deve ser um texto válido.",
            "string.email": "O e-mail informado não é válido.",
            "string.empty": "O e-mail é obrigatório.",
        }),

    password: Joi.string()
        .min(6)
        .max(200)
        .messages({
            "string.base": "A senha deve ser um texto válido.",
            "string.empty": "A senha é obrigatória.",
            "string.min": "A senha deve ter no mínimo {#limit} caracteres.",
            "string.max": "A senha deve ter no máximo {#limit} caracteres.",
        }),

    role: Joi.string()
        .valid("professor", "coordenador")
        .messages({
            "any.only": "O tipo de usuário deve ser 'professor' ou 'coordenador'.",
            "string.base": "O tipo de usuário deve ser um texto válido.",
            "string.empty": "O tipo de usuário é obrigatório.",
        }),
};

/**
 * Schemas específicos para criação e atualização
 */
export const userSchemas = {
    // 🔹 Criação de usuário
    create: Joi.object({
        name: baseSchema.name.required().messages({
            "any.required": "O nome é obrigatório.",
        }),
        email: baseSchema.email.required().messages({
            "any.required": "O e-mail é obrigatório.",
        }),
        password: baseSchema.password.required().messages({
            "any.required": "A senha é obrigatória.",
        }),
        role: baseSchema.role.required().messages({
            "any.required": "O tipo de usuário é obrigatório.",
        }),
    }),

    // 🔹 Atualização de usuário
    update: Joi.object({
        name: baseSchema.name,
        email: baseSchema.email,

        // Impede totalmente o envio de password
        password: Joi.forbidden().messages({
            "any.unknown": "A senha não pode ser atualizada por esta rota.",
            "any.forbidden": "A senha não pode ser atualizada por esta rota.",
        }),
        
        // Impede totalmente o envio de isActive
        isActive: Joi.forbidden().messages({
            "any.unknown": "O estado de atividade não pode ser atualizado por esta rota.",
            "any.forbidden": "O estado de atividade não pode ser atualizado por esta rota.",
        }),
    })
        .min(1)
        .messages({
            "object.min": "Envie pelo menos um campo para atualização.",
        })
};
