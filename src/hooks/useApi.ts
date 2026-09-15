import { useState, useCallback, useEffect } from 'react';
import axios, { AxiosError, AxiosInstance } from 'axios';

interface UseApiOptions {
  baseURL?: string;
  headers?: Record<string, string>;
}

interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

// 1. Definimos de forma estricta dónde vive tu backend y su versión
const DEFAULT_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api/v1';

// Instancia de Axios reutilizable con interceptores
let axiosInstance: AxiosInstance | null = null;

/**
 * Configura los interceptores globales de Axios para manejar:
 * - Errores 401 (token expirado)
 * - Limpieza de tokens
 * - Redirección a login
 */
const setupAxiosInterceptors = () => {
  if (axiosInstance) {
    return; // Ya está configurado
  }

  axiosInstance = axios.create();

  // Interceptor de respuesta para manejar errores 401
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const status = error.response?.status;

      // 🔴 Manejo de token expirado o inválido (401)
      if (status === 401) {
        console.warn('⚠️ Token expirado o inválido. Redirigiendo a login...');

        // Limpiar tokens del almacenamiento
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');

        // Redirigir al usuario al login
        // Opción 1: Usar window.location (fuerza recarga completa)
        window.location.href = '/login';

        // Opción 2: Si usas React Router, podrías usar:
        // navigator.push('/login'); // (requeriría acceso a useNavigate)
      }

      return Promise.reject(error);
    }
  );
};

export const useApi = (options: UseApiOptions = {}) => {
  // Usar valores por defecto para evitar que options cambie
  const baseURL = options.baseURL || DEFAULT_BASE_URL;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Configurar interceptores una sola vez cuando el hook se monta
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  const request = useCallback(
    async <T = any,>(
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      url: string,
      data?: any
    ): Promise<ApiResponse<T> | null> => {
      setLoading(true);
      setError(null);

      try {
        // 2. Parche dinámico: Limpiamos la ruta que envían los componentes
        // Aseguramos que empiece con "/"
        let cleanUrl = url.startsWith('/') ? url : `/${url}`;
        // Si el componente mandó "/api/drivers", lo dejamos solo como "/drivers" 
        // porque la baseURL ya incluye "/api/v1"
        cleanUrl = cleanUrl.replace(/^\/api\//, '/');

        // Recuperar el token de localStorage e inyectarlo en los headers
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = {
          ...options.headers,
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
          method,
          // 3. Usamos la propiedad nativa baseURL de Axios
          baseURL: baseURL,
          url: cleanUrl,
          headers,
          ...(data && { data }),
        };

        // Usar la instancia de Axios con interceptores configurados
        const response = await (axiosInstance || axios)(config);
        // Aseguramos que siempre devolvemos un objeto con estructura ApiResponse
        const responseData = response.data?.data || response.data;
        return {
          data: responseData,
          message: response.data?.message,
          success: true,
        } as ApiResponse<T>;
      } catch (err) {
        const axiosError = err as AxiosError<any>;
        const status = axiosError.response?.status;
        const errorMessage =
          axiosError.response?.data?.message ||
          axiosError.message ||
          'Error desconocido';

        const apiError: ApiError = {
          message: errorMessage,
          status: status,
          data: axiosError.response?.data,
        };

        // 🔴 Si es error 401, el interceptor ya lo manejó
        // pero guardamos el error en estado por si lo necesita el componente
        if (status !== 401) {
          setError(apiError);
        }

        console.error('API Error:', apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [options.baseURL, options.headers]
  );

  const get = useCallback(
    async <T = any,>(url: string): Promise<ApiResponse<T> | null> => {
      return request<T>('GET', url);
    },
    [request]
  );

  const post = useCallback(
    async <T = any,>(url: string, data: any): Promise<ApiResponse<T> | null> => {
      return request<T>('POST', url, data);
    },
    [request]
  );

  const put = useCallback(
    async <T = any,>(url: string, data: any): Promise<ApiResponse<T> | null> => {
      return request<T>('PUT', url, data);
    },
    [request]
  );

  const patch = useCallback(
    async <T = any,>(url: string, data: any): Promise<ApiResponse<T> | null> => {
      return request<T>('PATCH', url, data);
    },
    [request]
  );

  const del = useCallback(
    async <T = any,>(url: string): Promise<ApiResponse<T> | null> => {
      return request<T>('DELETE', url);
    },
    [request]
  );

  return {
    loading,
    error,
    get,
    post,
    put,
    patch,
    delete: del,
    clearError: () => setError(null),
  };
};