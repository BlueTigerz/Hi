# Azure setup (manual, via the Azure Portal)

This sets up everything the app needs in Azure:

| Resource | Purpose | Plan / cost |
| --- | --- | --- |
| Resource group | Container for both resources | Free |
| Storage account | Azure Table Storage for the leaderboard | Pay-as-you-go (pennies/month at this scale) |
| Static Web App | Hosts the React frontend **and** the managed Functions API | Free plan |

Allow about 15 minutes. Do the steps in order.

---

## 1. Create a resource group

1. Sign in to <https://portal.azure.com>.
2. Search for **Resource groups** → **+ Create**.
3. **Subscription:** pick yours.
4. **Resource group:** e.g. `rg-minecraft-tetris`.
5. **Region:** pick one near you (e.g. `East US 2`). Use the same region for everything below where offered.
6. **Review + create** → **Create**.

## 2. Create the storage account (Table Storage)

1. Search for **Storage accounts** → **+ Create**.
2. **Basics** tab:
   - **Resource group:** `rg-minecraft-tetris`
   - **Storage account name:** globally unique, 3–24 lowercase letters/numbers, e.g. `stmctetris<yourinitials>`
   - **Region:** same as the resource group
   - **Primary service** (if shown): *Other (tables and queues)*. If you don't see it, skip it.
   - **Performance:** Standard
   - **Redundancy:** Locally-redundant storage (LRS)
3. **Advanced** tab:
   - **Require secure transfer for REST API operations:** ✅ enabled
   - **Allow enabling anonymous access on individual containers:** ❌ disabled
   - **Enable storage account key access:** ✅ **enabled** (required; the API authenticates with the account's connection string, because managed Functions don't support managed identity)
   - **Minimum TLS version:** Version 1.2
4. **Networking** tab:
   - **Network access:** *Enable public access from all networks*.
     Managed Functions have no fixed outbound IPs and can't join a VNet, so the storage firewall can't be locked down further. The account key is what protects the data.
5. Leave the other tabs at their defaults → **Review + create** → **Create**.
6. When it finishes, open the storage account → **Security + networking** → **Access keys**.
7. Next to **key1**, click **Show** on **Connection string** and copy it. You'll use it in step 4.
   It looks like `DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net`.

> You do **not** need to create tables. The API creates the `scores` and `players` tables on first use.

## 3. Create the Static Web App

1. Search for **Static Web Apps** → **+ Create**.
2. **Basics** tab:
   - **Resource group:** `rg-minecraft-tetris`
   - **Name:** e.g. `swa-minecraft-tetris`
   - **Plan type:** **Free**
   - **Region** for the Functions API and staging environments: same region as before, or the closest available
   - **Deployment details → Source:** **Other**
     (Don't pick GitHub. That makes Azure commit its own workflow file to your repo. This repo already has one at `.github/workflows/azure-static-web-apps.yml`.)
3. **Review + create** → **Create**.
4. When it finishes, open the Static Web App → **Overview**.
   - Note the **URL** (e.g. `https://happy-rock-0a1b2c3d4.azurestaticapps.net`).
   - Click **Manage deployment token** → copy the token. You'll use it in step 5.

## 4. Configure the API settings on the Static Web App

These are the managed Functions' app settings (environment variables).

1. In the Static Web App, go to **Settings** → **Environment variables**.
2. Make sure the **Production** environment is selected, then **+ Add**:

   | Name | Value |
   | --- | --- |
   | `TABLES_CONNECTION_STRING` | the connection string from step 2.7 |
   | `ALLOWED_ORIGINS` | *(optional)* only if the frontend is hosted on a **different** domain. Use a comma-separated list of origins, e.g. `https://tetris.example.com`. Leave it unset for the normal setup. |

3. Click **Apply** and confirm.

> **Pull request previews:** PRs deploy to preview environments. If the environment dropdown lets you set variables per environment and a preview's API returns 500, add `TABLES_CONNECTION_STRING` for that environment too. Previews write to the **same** tables as production unless you point them at a different storage account.

## 5. Connect GitHub

1. In your GitHub repo, go to **Settings** → **Secrets and variables** → **Actions**.
2. **Secrets** tab → **New repository secret**:
   - **Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Secret:** the deployment token from step 3.4
3. *(Optional; only for a separately hosted frontend.)* **Variables** tab → **New repository variable**:
   - **Name:** `VITE_API_URL`
   - **Value:** the Static Web App URL, e.g. `https://happy-rock-0a1b2c3d4.azurestaticapps.net`

## 6. Deploy

Either push to `main`, or go to GitHub → **Actions** → **Deploy to Azure Static Web Apps** → **Run workflow**.

When it goes green, the deploy log should list two functions: `leaderboard` and `scores`.

## 7. Verify

1. Open `https://<your-app>.azurestaticapps.net/api/leaderboard`. You should see `[]` the first time, and no error.
2. Open `https://<your-app>.azurestaticapps.net`, play until game over, and submit a score.
3. The leaderboard should refresh with your score.
4. *(Optional)* In the storage account, open **Storage browser** → **Tables** and check that the `scores` and `players` tables have entities.

---

## Optional extras

- **Logs:** Static Web App → **Settings** → **Application Insights** → enable. Managed Functions only produce logs you can see once this is on.
- **Custom domain:** Static Web App → **Settings** → **Custom domains** → **+ Add**. HTTPS certificates are free and automatic.
- **Rotating the storage key:** Storage account → **Access keys** → **Rotate key** for key1, copy the new connection string, and update `TABLES_CONNECTION_STRING` (step 4). The site uses the new value right away.
- **Rotating the deployment token:** Static Web App → **Overview** → **Manage deployment token** → **Reset token**, then update the GitHub secret (step 5).

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Workflow fails with "deployment token" / unauthorized | `AZURE_STATIC_WEB_APPS_API_TOKEN` secret missing or stale (step 5) |
| `/api/leaderboard` returns **404** | The API didn't deploy. Check the workflow log for the functions list, and check that `staticwebapp.config.json` contains `"apiRuntime": "node:22"`. |
| `/api/leaderboard` returns **500** | `TABLES_CONNECTION_STRING` missing or wrong (step 4), or storage **account key access** is disabled (step 2.3). Turn on Application Insights to see the error. |
| Browser console shows a **CORS** error | Only happens when the frontend is on a different domain. Add that exact origin (scheme + host, no trailing slash) to `ALLOWED_ORIGINS`. |
