# Test scripts

## Setup

Install the requirements.

```
pip install -r requirements.txt
```

Run the backend server from the `backend` directory before running these scripts, for example:

```bash
pnpm dev
```

Make the script executable with `chmod +x` before running it.

## Environment

Create a `.env` file in the scripts directory with the following variables.

```
export API_KEY="api_key"
export ADMIN_ID="admin id"
```
`API_KEY` is the web API key of the Firebase app and can be found in project settings in the Firebase console. `ADMIN_ID`
is the ID of an admin user in Firestore.

You will also need a `credentials.json` file in the same directory.

Once you run `get_tokens.py`, `.id_token` and `.session_token` will be created, allowing you to use the other scripts
that require tokens as environment variables.

## Running a script

Run `source .env` and then `get_tokens.py` before running any scripts that require ID and session tokens. To run a script,
use `./<filename>`. The scripts currently print the backend response directly.