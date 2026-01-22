import axios from 'axios';

const FACIAL_API_URL = 'http://localhost:8000';

const facialApi = axios.create({
    baseURL: FACIAL_API_URL,
    timeout: 30000, // 30 segundos para processamento de imagem
});

export default facialApi;