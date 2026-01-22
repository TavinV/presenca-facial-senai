import api from '../services/api';

export const classesSessionsApi = {

    getByClass: (classId) => api.get(`/class-sessions/class/${classId}`),

    create: (sessionData) => api.post('/class-sessions', sessionData),

    update: (id, sessionData) => api.patch(`/class-sessions/${id}`, sessionData),

    delete: (id) => api.delete(`/class-sessions/${id}`),
    
    closeSession: (id) => api.patch(`/class-sessions/${id}/close`),

    getById: (id) => api.get(`/class-sessions/${id}`),

    getByTeacher: (teacherId) => api.get(`/class-sessions/teacher/${teacherId}`),

}