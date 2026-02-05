import api from '../services/api';

export const classesApi = {
    getAll: () => api.get('/classes'),

    getMyClasses: () => api.get('/classes/my'),

    getById: (id) => api.get(`/classes/${id}`),

    getByName: (name) => api.get(`/classes/name/${name}`),

    getStudents: (id) => api.get(`/classes/${id}/students`),

    create: (classData) => api.post('/classes', classData),

    update: (id, classData) => api.patch(`/classes/${id}`, classData),

    delete: (id) => api.delete(`/classes/${id}`),

    addTeacher: (classId, teacherId) =>
        api.post(`/classes/${classId}/teachers/${teacherId}`),

    removeTeacher: (classId, teacherId) =>
        api.delete(`/classes/${classId}/teachers/${teacherId}`),

    addRoom: (classId, roomId) =>
        api.post(`/classes/${classId}/rooms/${roomId}`),

    removeRoom: (classId, roomId) =>
        api.delete(`/classes/${classId}/rooms/${roomId}`),

    addStudent: (classId, studentId) =>
        api.post(`/classes/${classId}/students/${studentId}`),

    removeStudent: (classId, studentId) =>
        api.delete(`/classes/${classId}/students/${studentId}`),
};