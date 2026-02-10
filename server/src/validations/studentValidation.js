import Joi from "joi";

/**
 * Subschema do embedding facial (opcional, mas rígido)
 */
const facialEmbeddingSchema = Joi.object({
    embedding: Joi.string()
        .base64()
        .required()
        .messages({
            "string.base": "O embedding criptografado deve ser um texto válido.",
            "string.base64": "O embedding deve estar em Base64.",
            "any.required": "O embedding criptografado é obrigatório.",
        }),

    nonce: Joi.string()
        .base64()
        .required()
        .messages({
            "string.base": "O nonce deve ser um texto válido.",
            "string.base64": "O nonce deve estar em Base64.",
            "any.required": "O nonce é obrigatório.",
        }),

    photos_processed: Joi.number()
    .required()
    .messages({
        "any.required": "A quantidade de fotos processadas é obrigatória",
    })
})


/**
 * Campos base do aluno
 */
const baseSchema = {
    name: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            "any.required": "O nome é obrigatório.",
            "string.empty": "O nome não pode estar vazio.",
        }),

    registration: Joi.string()
        .min(3)
        .max(50)
        .required()
        .messages({
            "any.required": "A matrícula é obrigatória.",
            "string.empty": "A matrícula não pode estar vazia.",
        }),

    classes: Joi.array()
        .items(
            Joi.string()
                .uppercase()
                .trim()
                .min(2)
                .max(20)
        )
        .min(1)
        .required()
        .messages({
            "any.required": "Informe ao menos uma turma.",
            "array.min": "Informe ao menos uma turma.",
        }),
};

/**
 * Schema de criação
 */
const studentCreateSchema = Joi.object({
    name: baseSchema.name,
    registration: baseSchema.registration,
    classes: baseSchema.classes,

    // opcional, mas validado se existir
    facialEmbedding: facialEmbeddingSchema.optional(),

})
    .messages({
        "object.unknown": "Campo não permitido no cadastro do aluno.",
    });

const updateSchema = Joi.object({
    name: baseSchema.name.optional(),
    registration: baseSchema.registration.optional(),
    classes: baseSchema.classes.optional(),
    facialEmbedding: facialEmbeddingSchema.optional(),
})
    .min(1)
    .messages({
        "object.min": "Envie ao menos um campo para atualização.",
        "object.unknown": "Campo não permitido na atualização do aluno.",
    });

export const studentSchemas = {
    // 🔹 Criação de aluno
    create: studentCreateSchema,
    update: updateSchema,
    updateFacial: facialEmbeddingSchema,
}