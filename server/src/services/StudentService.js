import BaseService from "./BaseService.js";
import Student from "../models/studentModel.js";
import Class from "../models/classModel.js";
import {
    ValidationError,
    NotFoundError,
    ConflictError,
} from "../errors/appError.js";



class StudentService extends BaseService {
    constructor() {
        super(Student);
    }

    /**
     * Criar aluno
     */
    async create(data) {
        // Verificar facialId
        if (!data.facialId) {
            throw new ValidationError("O aluno precisa ter um ID de reconhecimento facial (facialId).");
        }

        // Evitar duplicidade do facialId
        const hasFaceConflict = await this.model.findOne({ facialId: data.facialId });
        if (hasFaceConflict) {
            throw new ConflictError("Este facialId já está registrado para outro aluno.");
        }

        // Validar turma pelo código
        const classExists = await Class.findOne({ code: data.classCode });
        if (!classExists) {
            throw new NotFoundError("A turma informada não existe.");
        }
        data.classes = [data.classCode];
        delete data.classCode;
        return super.create(data);
    }

    /**
     * Buscar alunos por código da classe
     */
    async getByClassCode(id) {
        if (!id) throw new ValidationError("O ID da turma é obrigatório.");

        const foundClass = await Class.findOne({ code: id });
        if (!foundClass) throw new NotFoundError("Turma não encontrada.");

        const classCode = foundClass.code;

        // Agora procura alunos que tenham este código dentro do array "classes"
        const students = await this.model.find({
            classes: classCode   // procura em arrays automaticamente
        });

        if (!students.length) {
            return [];
        }

        return students;
    }


    /**
     * Atualização normal (exceto facialId)
     */
    async update(id, data) {
        // Validar turma se for alterada
        if (data.classCode) {
            const classExists = await Class.findOne({ code: data.classCode });
            if (!classExists) {
                throw new NotFoundError("A turma informada não existe.");
            }
        }

        // Impedir update de facialId por aqui
        if (data.facialId) {
            throw new ValidationError(
                "Use a rota correta para atualizar reconhecimento facial (PATCH /students/:id/facial)."
            );
        }

        return super.update(id, data);
    }

    /**
     * Atualizar apenas o facialId
     */
    async updateFaceData(id, newFacialId) {
        if (!newFacialId) {
            throw new ValidationError("O novo facialId é obrigatório.");
        }

        const conflict = await this.model.findOne({ facialId: newFacialId });
        if (conflict && conflict._id.toString() !== id.toString()) {
            throw new ConflictError("Este facialId já está vinculado a outro aluno.");
        }

        return super.update(id, { facialId: newFacialId });
    }

    /**
     * Adicionar o aluno a uma turma pelo código da turma
     */
    async addClass(studentId, classCode) {
        const student = await this.model.findById(studentId);
        if (!student) throw new NotFoundError("Aluno não encontrado.");

        const classExists = await Class.findOne({ code: classCode });
        if (!classExists) {
            throw new NotFoundError("Turma não encontrada.");
        }

        // evita duplicidade
        if (!student.classes.includes(classCode)) {
            student.classes.push(classCode);
            await student.save();
        }

        return student;
    }

    /**
     * Remover o aluno de uma turma pelo código da turma
     */
    async removeClass(studentId, classCode) {
        const student = await this.model.findById(studentId);
        if (!student) throw new NotFoundError("Aluno não encontrado.");

        classCode = classCode.toUpperCase();
        
        student.classes = student.classes.filter(c => c != classCode);
        await student.save();

        return student;
    }

    /**
 * Retorna os dados de todos os alunos para uso na API de reconhecimento facial
 * Estrutura:
 * [
 *   {
 *     _id: "<id do aluno>",
 *     facial: "<facialId>",
 *     salas: ["<classId1>", "<classId2>", ...]
 *   }
 * ]
 */
    async loadAllFacesData() {
        // Busca apenas alunos ativos com facialId
        const students = await this.model.find(
            { isActive: true, facialId: { $exists: true, $ne: null } },
            "_id facialId classes"
        ).lean();

        /**
         * Cache em memória:
         * {
         *   "I2C": "654fa1b2c3...",
         *   "I3A": "654fa1b2d4..."
         * }
         */
        const knownClassesByCode = {};

        const result = [];

        for (const student of students) {
            const classIds = [];

            for (const classCode of student.classes) {
                const normalizedCode = classCode.toUpperCase();

                // Se já está no cache, reutiliza
                if (knownClassesByCode[normalizedCode]) {
                    classIds.push(knownClassesByCode[normalizedCode]);
                    continue;
                }

                // Busca no banco apenas se não estiver em memória
                const foundClass = await Class.findOne(
                    { code: normalizedCode },
                    "_id"
                ).lean();

                // Se a turma existir, cacheia
                if (foundClass) {
                    const classId = foundClass._id.toString();
                    knownClassesByCode[normalizedCode] = classId;
                    classIds.push(classId);
                }
            }

            // Carregando as salas físicas (rooms) associadas às turmas do aluno
            const roomsSet = new Set();
            for (const classId of classIds) {
                const classData = await Class.findById(classId, "rooms").lean();
                if (classData && classData.rooms) {
                    classData.rooms.forEach(roomId => roomsSet.add(roomId.toString()));
                }
            }
            const rooms = Array.from(roomsSet);

            // Só adiciona se o aluno tiver ao menos uma turma válida
            if (classIds.length > 0) {
                result.push({
                    _id: student._id.toString(),
                    facial: student.facialId,
                    rooms
                });
            }
        }

        return result;
    }
}

export default new StudentService();
