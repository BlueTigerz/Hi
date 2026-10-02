# Deploying with GitHub Actions

The workflow is [.github/workflows/azure-static-web-apps.yml](../.github/workflows/azure-static-web-apps.yml).

## One workflow, two apps

The frontend (React, `dist/`) and the backend (managed Azure Functions, `api/`) are deployed **together in one step**. That isn't a shortcut: managed Functions can only be deployed as part of their Static Web App. Azure routes `https://<app>.azurestaticapps.net/api/*` to the Functions and everything else to the frontend.

## What it does

| Trigger | Result |
| --- | --- |
| Push to `main` | Builds and deploys to **production** |
| PR opened/updated against `main` | Deploys a **preview environment** and comments its URL on the PR |
| PR closed/merged | Deletes that preview environment |
| Manual (**Actions → Run workflow**) | Same as a push to `main` |

Steps in the `build_and_deploy` job:

1. Check out the repo and set up Node 22 (with the npm cache for both lockfiles).
2. **Frontend:** `npm ci` + `npm run build` → `dist/` (which includes `staticwebapp.config.json` from `public/`).
3. **Backend:** `npm ci --omit=dev` in `api/`, so the Functions app ships with only its runtime dependencies.
4. **Deploy** with `Azure/static-web-apps-deploy@v1`, using `skip_app_build` / `skip_api_build`. Azure deploys exactly what was built in steps 2–3 instead of rebuilding with its own build system.

## Required configuration

| Where | Name | Required | Value |
| --- | --- | --- | --- |
| Repo secret | `AZURE_STATIC_WEB_APPS_API_TOKEN` | ✅ | Deployment token from the Static Web App's **Overview → Manage deployment token** |
| Repo variable | `VITE_API_URL` | Optional | Only when the frontend is hosted on a different origin than the API. Leave unset otherwise. |

The API's runtime settings (`TABLES_CONNECTION_STRING`, `ALLOWED_ORIGINS`) are **not** GitHub settings. They live on the Static Web App in Azure. See [azure-setup.md](azure-setup.md), step 4.

## Notes

- **Forked PRs** don't get repository secrets, so their preview deploys fail. This is expected.
- The Free plan allows 3 preview environments at a time. Close stale PRs if deploys start failing with an environment limit error.
- Pinned versions: Node 22 in the workflow matches `"apiRuntime": "node:22"` in [public/staticwebapp.config.json](../public/staticwebapp.config.json). Change both together.
