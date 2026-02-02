// Configuração centralizada de todas as rotas do sistema
// Altere aqui para refletir em todo o sistema

export const                ROUTES = {
    // Rotas públicas
    PUBLIC: {
        LOGIN: '/login',
        REQUEST_ACCESS: '/request-access',
        
        // Adicione outras rotas públicas aqui
        TOTEM: '/totem'
    },

    // Rotas privadas
    PRIVATE: {
        DASHBOARD: '/',
        CLASSES: {
            LIST: '/classes',
            DETAIL: '/classes/:id',
            CREATE: '/classes/new',
            EDIT: '/classes/:id/edit',
            OVERVIEW: '/classes/:id/students',
        },
        STUDENTS: {
            LIST: '/students',
            DETAIL: '/students/:id',
            CREATE: '/students/new',
            EDIT: '/students/:id/edit',
        },
        TEACHERS: {
            LIST: '/teachers',
            DETAIL: '/teachers/:id',
            CREATE: '/teachers/new',
            EDIT: '/teachers/:id/edit',
        },
        SESSIONS: {
            BY_CLASS: '/class-sessions/class/:id',
            BY_TEACHER: '/class-sessions/teacher/:id',
            LIST: '/class-sessions/list',
            CREATE: '/class-sessions/',
            EDIT: '/class-sessions/:id',
        },
        ATTENDANCE: {
            MANUAL: '/attendance/manual',
            HISTORY: '/attendance/history',
            CLASS_SESSION_ATTENDANCES: '/attendances/session/:id',
            CLASS_ATTENDANCE: '/attendances/session/:id/full-report',
        },
        ROOMS: {
            LIST: '/rooms',
            CREATE: '/rooms/new',
            EDIT: '/rooms/:id/edit',
        },
        TOTEMS: {
            LIST: '/totems',
            CREATE: '/totems/new',
            DETAIL: '/totems/:id',
            EDIT: '/totems/:id/edit',
        },
        REPORTS: {
            MAIN: '/reports',
            CLASS: '/reports/class/:id',
            CLASS_SESSION: '/reports/class-session/:id',
            STUDENT: '/reports/student/:id',
            SUBJECT: '/reports/:classid/:subjectCode',
            DATE_RANGE: '/reports/date-range',
        },
        PROFILE: '/profile',
        SETTINGS: '/settings',
        ACCESS_REQUESTS: '/access-requests',
    },

    // Utilitários para construir URLs dinâmicas
    build: {
        classDetail: (id) => `/classes/${id}`,
        classEdit: (id) => `/classes/${id}/edit`,
        studentDetail: (id) => `/students/${id}`,
        studentEdit: (id) => `/students/${id}/edit`,
        teacherDetail: (id) => `/teachers/${id}`,
        teacherEdit: (id) => `/teachers/${id}/edit`,
        sessionActive: (id) => `/sessions/${id}/active`,
        sessionReport: (id) => `/sessions/${id}/report`,
        roomEdit: (id) => `/rooms/${id}/edit`,
        totemDetail: (id) => `/totems/${id}`,
        classReport: (id) => `/reports/class/${id}`,
        studentReport: (id) => `/reports/student/${id}`,
    },

    // Verificar se uma rota requer autenticação
    requiresAuth: (path) => {
        // Se for uma rota pública, retorna false
        const publicRoutes = Object.values(ROUTES.PUBLIC);
        if (publicRoutes.includes(path)) return false;

        // Se começar com /login, é pública
        if (path.startsWith('/login')) return false;

        // Todas as outras rotas requerem autenticação
        return true;
    },

    // Verificar se uma rota é apenas para coordenador
    requiresCoordinator: (path) => {
        const coordinatorOnlyPaths = [
            ROUTES.PRIVATE.TEACHERS.LIST,
            ROUTES.PRIVATE.TEACHERS.CREATE,
            ROUTES.PRIVATE.TEACHERS.DETAIL,
            ROUTES.PRIVATE.TEACHERS.EDIT,
            ROUTES.PRIVATE.ROOMS.LIST,
            ROUTES.PRIVATE.ROOMS.CREATE,
            ROUTES.PRIVATE.ROOMS.EDIT,
            ROUTES.PRIVATE.TOTEMS.LIST,
            ROUTES.PRIVATE.TOTEMS.CREATE,
            ROUTES.PRIVATE.TOTEMS.DETAIL,
        ];

        // Verifica se o path está nas rotas de coordenador
        return coordinatorOnlyPaths.some(route =>
            path.startsWith(route.replace(/:\w+/g, ''))
        );
    }
};

// Exportar constantes individuais para facilitar o uso
export const LOGIN = ROUTES.PUBLIC.LOGIN;
export const DASHBOARD = ROUTES.PRIVATE.DASHBOARD;
export const CLASSES_LIST = ROUTES.PRIVATE.CLASSES.LIST;
export const CLASSES_CREATE = ROUTES.PRIVATE.CLASSES.CREATE;
export const STUDENTS_LIST = ROUTES.PRIVATE.STUDENTS.LIST;
export const STUDENTS_CREATE = ROUTES.PRIVATE.STUDENTS.CREATE;
export const SESSIONS_LIST = ROUTES.PRIVATE.SESSIONS.LIST;
export const SESSIONS_CREATE = ROUTES.PRIVATE.SESSIONS.CREATE;