import api from '../services/api';

export const attendancesApi = {

    getBySession: (sessionId) => api.get(`/attendances/session/${sessionId}`),

    createManual: (attendanceData) => api.post('/attendances/manual', attendanceData),

    createFacial: (attendanceData, headers = {}) =>
        api.post('/attendances/facial', attendanceData, { headers }),

    update: (id, attendanceData) => api.patch(`/attendances/${id}`, attendanceData),

    delete: (id) => api.delete(`/attendances/${id}`),

    getByStudent: (studentId) => api.get(`/attendances/student/${studentId}`),

    getByClass: (classId) => api.get(`/attendances/class/${classId}`),

    getFullReportBySession: (sessionId) => api.get(`/attendances/session/${sessionId}/full-report`),

}