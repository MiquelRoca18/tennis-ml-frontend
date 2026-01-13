import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_BASE_URL } from '../../utils/constants';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Log requests in development
        if (__DEV__) {
            console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
apiClient.interceptors.response.use(
    (response) => {
        // Log responses in development
        if (__DEV__) {
            console.log(`[API Response] ${response.config.url}`, response.status);
        }
        return response;
    },
    (error: AxiosError) => {
        // Handle errors globally
        if (__DEV__) {
            console.error('[API Error]', error.message);
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
