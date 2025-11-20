import Joi from "joi";

const baseSchema = {
    classId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .messages({
            "string.base": "O ID da turma deve ser um texto válido.",
            "string.empty": "O ID da turma é obrigatório.",
            "string.pattern.base": "O ID da turma deve ser um ObjectId válido.",
            "any.required": "Você deve informar o ID da turma."
        }),

    name: Joi.string()
        .min(3)
        .max(80)
        .messages({
            "string.base": "O nome da sessão deve ser um texto válido.",
            "string.empty": "O nome da sessão é obrigatório.",
            "string.min": "O nome deve ter no mínimo {#limit} caracteres.",
            "string.max": "O nome deve ter no máximo {#limit} caracteres.",
            "any.required": "Você deve informar o nome da sessão."
        }),

    date: Joi.date().messages({
        "date.base": "A data deve ser uma data válida.",
        "any.required": "Você deve informar a data da sessão."
    }),

    status: Joi.string()
        .valid("open", "closed")
        .messages({
            "any.only": "O status da sessão deve ser 'open' ou 'closed'."
        })
};

export const classSessionSchemas = {
    // 🔹 Criar sessão
    // teacherId NÃO vem mais no body — vem do JWT
    create: Joi.object({
        classId: baseSchema.classId.required(),
        name: baseSchema.name.required(),
        date: baseSchema.date.required()
    }).messages({
        "any.required": "Campo obrigatório ausente no corpo da requisição."
    }),

    // 🔹 Atualizar sessão
    update: Joi.object({
        name: baseSchema.name.optional(),
        date: baseSchema.date.optional()
    })
        .min(1)
        .messages({
            "object.min": "Envie pelo menos um campo para atualização da sessão.",
            "any.required": "Você deve enviar ao menos um dado para atualizar."
        }),

    // 🔹 Fechar sessão
    close: Joi.object({
        status: baseSchema.status.required().valid("closed").messages({
            "any.only": "Status inválido. Para fechar a sessão, use 'closed'.",
            "any.required": "O campo status é obrigatório ao fechar a sessão."
        })
    }),

    // 🔹 Reset (sem body)
    reset: Joi.object({})
};
