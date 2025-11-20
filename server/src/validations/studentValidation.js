import Joi from "joi";

const baseSchema = {
    name: Joi.string()
        .min(3)
        .max(100)
        .messages({
            "string.base": "O nome deve ser um texto válido.",
            "string.empty": "O nome não pode estar vazio.",
            "string.min": "O nome deve ter no mínimo {#limit} caracteres.",
            "string.max": "O nome deve ter no máximo {#limit} caracteres."
        }),

    registration: Joi.string()
        .min(3)
        .max(50)
        .messages({
            "string.base": "A matrícula deve ser um texto válido.",
            "string.empty": "A matrícula não pode estar vazia.",
            "string.min": "A matrícula deve ter no mínimo {#limit} caracteres.",
            "string.max": "A matrícula deve ter no máximo {#limit} caracteres."
        }),

    facialId: Joi.string()
        .min(3)
        .max(200)
        .messages({
            "string.base": "O facialId deve ser um texto válido.",
            "string.empty": "O facialId não pode estar vazio.",
            "string.min": "O facialId deve ter no mínimo {#limit} caracteres.",
            "string.max": "O facialId deve ter no máximo {#limit} caracteres."
        }),

    classCode: Joi.string()
        .uppercase()
        .min(2)
        .max(20)
        .messages({
            "string.base": "O código da turma deve ser um texto válido.",
            "string.empty": "O código da turma não pode estar vazio.",
            "string.min": "O código da turma deve ter pelo menos {#limit} caracteres.",
            "string.max": "O código da turma deve ter no máximo {#limit} caracteres.",
            "string.uppercase": "O código da turma deve estar em letras maiúsculas."
        })
};

export const studentSchemas = {
    // Criar aluno
    create: Joi.object({
        name: baseSchema.name.required().messages({
            "any.required": "O nome é obrigatório.",
            "string.empty": "O nome não pode estar vazio."
        }),

        registration: baseSchema.registration.required().messages({
            "any.required": "A matrícula é obrigatória.",
            "string.empty": "A matrícula não pode estar vazia."
        }),

        facialId: baseSchema.facialId.required().messages({
            "any.required": "O facialId é obrigatório.",
            "string.empty": "O facialId não pode estar vazio."
        }),

        classCode: baseSchema.classCode.required().messages({
            "any.required": "O código da turma (classCode) é obrigatório.",
            "string.empty": "O código da turma não pode estar vazio.",
            "string.uppercase": "O código da turma deve estar em letras maiúsculas."
        })
    }).messages({
        "object.base": "Dados de aluno inválidos.",
    }),

    // Atualizar aluno (não pode atualizar matricula nem facialId)
    update: Joi.object({
        name: baseSchema.name.optional(),
        classCode: baseSchema.classCode.optional()
    })
        .min(1)
        .messages({
            "object.min": "Envie pelo menos um campo para atualização."
        }),

    // Atualizar somente o facialId
    updateFacial: Joi.object({
        facialId: baseSchema.facialId.required().messages({
            "any.required": "O novo facialId é obrigatório.",
            "string.empty": "O facialId não pode estar vazio."
        })
    }).messages({
        "object.base": "Dados de atualização facial inválidos."
    })
};
