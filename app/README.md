# DishZero frontend

## Local development

Set your local environment variables by copying `.env.example` to an `.env` file. To hit the production backend, set
`REACT_APP_BACKEND_ADDRESS=https://api.dishzero.ca`

Then, install dependencies:

```bash
npm i
```

and run the local server

```bash
npm start
```

## Running tests

1. Install dependencies `cd app && npm install`
2. To run all the tests, `npm run test`
3. To run a single test and re-run it as you work, `npm run test TESTNAME -- --watch`

For example, if you are making changes to `AuthContext.tsx`, you can run `npm run test AuthContext -- --watch`. As you
make changes to the source code, the tests will rerun.
