const defaultBackendAddress = 'http://localhost:8080';

export const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS ?? defaultBackendAddress;
