import axios, { AxiosError, AxiosInstance } from 'axios';
import { supabase } from '../../lib/supabase';
import { API_BASE_URL } from '../../utils/constants';
import { mensajeNoAutorizado, type EstadoAuth } from './authErrors';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    // 30s de margen (el backend propio responde en <1s; timeout holgado para consultas live
    // pesadas). El feed carga con live=false primero (rápido) y el enrichment live tiene su
    // propio timeout interno de 5s.
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor: adjunta el access token de Supabase como Bearer.
// El backend lo valida cuando AUTH_ENABLED=true; mientras esté en false es inofensivo.
apiClient.interceptors.request.use(
    async (config) => {
        // Se anota POR QUÉ no hay token para que un 401 posterior pueda explicarse bien:
        // no es lo mismo "tu sesión expiró" que "el proveedor de auth no existe".
        const estado = config as typeof config & EstadoAuth;
        try {
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else {
                estado.sinSesion = true;
            }
        } catch {
            // getSession falla al refrescar contra un proyecto pausado o sin red.
            estado.authNoAlcanzable = true;
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
            case 401:
                throw new Error(mensajeNoAutorizado((error.config ?? {}) as EstadoAuth));
            case 403:
                throw new Error('No tienes acceso a este recurso.');
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
