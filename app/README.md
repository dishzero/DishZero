# DishZero frontend

## Local development

Set your local environment variables by copying `.env.example` to an `.env` file. To hit your local backend, set
`VITE_BACKEND_ADDRESS=http://localhost:8080`

Then, install dependencies:

```bash
pnpm install
```

and run the local server

```bash
pnpm dev
```

The frontend now runs on Vite, so edits hot reload automatically during local development.

## Quality checks

```bash
pnpm run typecheck
pnpm run build
pnpm run test
```

## Running tests

1. To run all tests once, use `pnpm run test`
2. To run Vitest in watch mode while you work, use `pnpm run test:watch`
