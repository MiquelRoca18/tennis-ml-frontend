import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_BASE_URL } from '../../utils/constants';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    // 15s: suficiente para cold starts moderados; el enriquecimiento live en backend
    // tiene su propio timeout interno (5s) y el feed ya carga con live=false primero,
    // por lo que un timeout de 45s solo alargaba errores de red.
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error: AxiosError) => {
        const url = typeof error.config?.url === 'string' ? error.config.url : '';
        const isPlayerEndpoint = /players\/\d+/.test(url);
        if (__DEV__ && !isPlayerEndpoint) {
            console.warn('[API]', error.message);
        }

        // Timeout error
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            throw new Error('El servidor está tardando. Intenta de nuevo.');
        }

        // Network error
        if (!error.response) {
            throw new Error('Sin conexión a internet. Verifica tu conexión.');
        }

        // Server errors
        switch (error.response.status) {
            case 400:
                throw new Error('Solicitud inválida. Verifica los datos enviados.');
            case 404:
                throw new Error('Recurso no encontrado.');
            case 500:
                throw new Error('Error del servidor. Intenta de nuevo más tarde.');
            default:
                throw new Error(`Error: ${error.message}`);
        }
    }
);

export default apiClient;
