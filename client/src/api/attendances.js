import api from '../services/api';

 export const attendancesApi = {

    // Obter presenças por sessão
    getBySession: (sessionId) => api.get(`/attendances/session/${sessionId}`),

    // Criar presença manualmente
    createManual: (attendanceData) => api.post('/attendances/manual', attendanceData),

    // Criar presença via reconhecimento facial
    createFacial: (attendanceData, headers = {}) =>
        api.post('/attendances/facial', attendanceData, { headers }),

    // Atualizar presença
    update: (id, attendanceData) => api.patch(`/attendances/${id}`, attendanceData),

    // Deletar presença
    delete: (id) => api.delete(`/attendances/${id}`),

    // Obter presenças por estudante
    getByStudent: (studentId) => api.get(`/attendances/student/${studentId}`),

    // Obter presenças por turma
    getByClass: (classId) => api.get(`/attendances/class/${classId}`),

    // Relatório completo da sessão
    getFullReportBySession: (sessionId) => api.get(`/attendances/session/${sessionId}/full-report`),

    // Obter presença por id
    getById: (id) => api.get(`/attendances/${id}`),

     getTableByClassAndSubject: (classId, subjectCode) =>
         api.get(
             `/attendances/class/${classId}/subject/${subjectCode}/table`
         ),

     // Presenças de um aluno por turma e disciplina
     getByStudentClassAndSubject: (studentId, classId, subjectCode) =>
         api.get(
             `/attendances/student/${studentId}/class/${classId}/subject/${subjectCode}`
         ),

}

export default attendancesApi;