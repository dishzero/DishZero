/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_BACKEND_ADDRESS?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
