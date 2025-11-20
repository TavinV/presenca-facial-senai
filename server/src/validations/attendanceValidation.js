import Joi from "joi";

const objectId = Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
        "string.base": "O campo deve ser um texto válido.",
        "string.empty": "O campo não pode ser vazio.",
        "string.pattern.base": "O valor informado deve ser um ObjectId válido."
    });

export const attendanceSchemas = {

    // Presença via reconhecimento facial
    markByFace: Joi.object({
        facialId: Joi.string()
            .min(3)
            .required()
            .messages({
                "string.base": "O facialId deve ser um texto.",
                "string.empty": "O facialId é obrigatório.",
                "string.min": "O facialId deve ter no mínimo {#limit} caracteres."
            }),

        sessionId: objectId.required().messages({
            "any.required": "O ID da sessão é obrigatório para registrar presença."
        })
    }),

    // Presença manual
    manual: Joi.object({
        sessionId: objectId.required().messages({
            "any.required": "O ID da sessão é obrigatório."
        }),

        studentId: objectId.required().messages({
            "any.required": "O ID do aluno é obrigatório."
        }),

        status: Joi.string()
            .valid("presente", "atrasado", "ausente")
            .required()
            .messages({
                "any.only": "O status deve ser 'presente', 'atrasado' ou 'ausente'.",
                "string.base": "O status deve ser um texto válido.",
                "any.required": "O status é obrigatório."
            })
    }),
};
