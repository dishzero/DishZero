# DishZero frontend

## Local development

Set your local environment variables by copying `.env.example` to an `.env` file. To hit the production backend, set
`VITE_BACKEND_ADDRESS=https://api.dishzero.ca`

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

1. Install dependencies with `cd app && pnpm install`
2. To run all tests once, use `pnpm run test`
3. To run Vitest in watch mode while you work, use `pnpm run test:watch`

The current frontend tests have been ported to Vitest. Some older suites are still lightweight smoke/integration checks rather
than deep behavioral coverage, so use `pnpm run typecheck` and `pnpm run build` alongside tests when validating changes.
