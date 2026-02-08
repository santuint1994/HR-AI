import { accessLogger } from '@config/logger';
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ✅ Request Interceptor (fixed typing)
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = process.env.AUTH_TOKEN;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    // ✅ Response Interceptor
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        accessLogger.info(`[Response] ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        if (error.response) {
          const { status, data, config } = error.response;
          accessLogger.error(`[Error] ${status} ${config?.url} - ${JSON.stringify(data)}`);
          return Promise.reject({
            status,
            message: data?.error || data?.message || `Request failed with status code ${status}`,
            stack: error.stack,
          });
        } else if (error.request) {
          accessLogger.error(`[Network Error] No response from server`);
          return Promise.reject({
            status: 0,
            message: 'noResponseFromServer',
            stack: error.stack,
          });
        } else {
          accessLogger.error(`[Axios Error] ${error.message}`);
          return Promise.reject({
            status: 0,
            message: error.message || 'unexpectedError',
            stack: error.stack,
          });
        }
      },
    );
  }

  getInstance(): AxiosInstance {
    return this.instance;
  }
}

export default HttpClient;
