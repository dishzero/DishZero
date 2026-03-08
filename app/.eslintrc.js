module.exports = {
    env: {
        browser: true,
        node: true,
        es2021: true,
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ['@typescript-eslint', 'prettier'],
    ignorePatterns: ['build', 'dist'],
    overrides: [
        {
            files: ['src/**/__tests__/**/*.{ts,tsx}', 'vite.config.ts'],
            globals: {
                afterAll: 'readonly',
                afterEach: 'readonly',
                beforeAll: 'readonly',
                beforeEach: 'readonly',
                describe: 'readonly',
                expect: 'readonly',
                it: 'readonly',
                test: 'readonly',
                vi: 'readonly',
            },
        },
    ],
    rules: {
        'no-console': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
        'prettier/prettier': 'warn',
    },
};
