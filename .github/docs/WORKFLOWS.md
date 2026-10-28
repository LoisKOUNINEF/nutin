# Workflows Docs

- **`DOCKER_AUTH` GitHub Actions secret must be regenerated & updated when PAT changes** 
    - generate with `printf '%s' 'username:PAT' | base64 | tr -d '\n'`.
    - **must be a classic PAT with only the `read:packages` scope**: GHCR rejects pulls with a fine-grained PAT (`docker login` succeeds, every pull returns `denied`).
    - *note : generate PAT* : Profile Pic -> Settings -> Left sidebar : Developer Settings -> Personal Access Tokens.

- Other secrets used across the deployment workflows: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_PASS`, `SSH_PORT` (VPS access for `scp`/`ssh` steps).
    - `SSH_FINGERPRINT`: the VPS host key, so the `scp`/`ssh` steps refuse another host answering at `SSH_HOST` (it would get `DOCKER_AUTH` and `ENCRYPTION_PASSWORD`). The `SHA256:…` printed by `ssh-keyscan -t ed25519 -p <port> <host> | ssh-keygen -lf -`, checked from a trusted network. Without it, the host isn't verified.

- `ENCRYPTION_PASSWORD` secret (apps with a database): encrypts/decrypts the database backups. Changing it makes older backups unreadable.

- `.github/workflows/scripts/jobs/create-stack.sh` generates a new .yaml file with `envsubst` from `.github/workflows/stacks/<service>.yml` (backend/fullstack apps) or the shared `.github/workflows/stacks/stack.yml` (frontend apps), and ENV variables :
    - ENV variables : `APP_LOWER`, `IMAGE_LOWER`, `APP_SNAKE`, `PROJECT_LOWER`, `REPO_LOWER`, `SERVICE_NAME`, `STACK_NAME`, `DOMAIN_NAME`, `CLIENT_PORT`, `SERVER_PORT`. (*`APP_LOWER`, `IMAGE_LOWER`, `APP_SNAKE`, `REPO_LOWER` and `PROJECT_LOWER`* are set by `format-name.sh`, see "Naming").
    - Any other `$NAME` / `${NAME}` in a stack file is replaced too (by an empty string if unset), even after `$$`. Only `$` not followed by a name survives, e.g. docker stack's `$$(…)` and `$${1}` escapes.

- VPS prerequisites: Docker Swarm initialised, Traefik running on the external `traefik-public` overlay network with a `letsencrypt` cert resolver and a `websecure` entrypoint. Each app's container must answer `GET /health` on its port (Swarm healthcheck, `wget` inside the container). `flock` (util-linux, installed on Ubuntu).

- Deploys are queued: one at a time per app and stack (`concurrency` group, a newer push replaces a pending one), and one at a time on the VPS across all apps and repos (`flock ~/.deploy.lock` around `deploy.sh`, as they share `~/.docker/config.json`).

## Naming

`format-name.sh` derives the names from the repo (lowercased, `_` → `-`) and, in monorepos, the service:

| | solo | monorepo |
|---|---|---|
| `APP_LOWER` (stack `<APP_LOWER>-<stack>`, ghcr.io package) | `<repo>` | `<repo>-<service>` |
| `IMAGE_LOWER` (image `ghcr.io/<IMAGE_LOWER>[-client\|-server]`) | `<owner>/<repo>` | `<owner>/<repo>-<service>` |
| `APP_SNAKE` (DB secrets `<APP_SNAKE>_<stack>_db_*`) | `<repo>` | `<repo>_<service>` |

`SERVICE_NAME` still names the stack files on the VPS (`<service>-<stack>.yml`, in `~/<repo>`).

## App types

- **frontend** — one container per stack, routed at `/` (shared `stacks/stack.yml`).
- **backend** — `<APP_LOWER>-<stack>-server`, routed at `/` (`stacks/<service>.yml`).
- **fullstack** — `-client` routed at `/` and `-server` routed at its path prefixes (e.g. `/api`), in one stack (`stacks/<service>.yml`). Images: `ghcr.io/<IMAGE_LOWER>-client|server`.
- Backend/fullstack options:
    - **Database** (`DB=postgres`): `postgres` service, its data in the `<APP_LOWER>-<stack>-pgdata` volume. Credentials are external Docker secrets, to create on the VPS for each stack:
      `echo "..." | docker secret create <APP_SNAKE>_<stack>_db_user -` (same for `_db_password`, `_db_name`). The server gets `DB_HOST`, `DB_PORT`, `DB_USER_FILE`, `DB_PASSWORD_FILE`, `DB_NAME_FILE`.
    - **Migrations**: `-migrations` service running once per deployment in the server image (`sh -c <cmd>`), excluded from the healthcheck.
    - **Server replicas** (`SERVER_REPLICAS`): the server is deployed with 1 replica, then scaled up once the stack is healthy.
- App-specific env variables and secrets go in `stacks/<service>.yml`.

- Each app uses one of two pipelines:
    - **staging** — `staging` branch builds & deploys to the staging stack; `main` promotes the staging image tags to production (no rebuild).
    - **direct** — `main` builds & deploys straight to production.

- **Production workflow (main branch, staging pipeline)**
    - **Pull requests to `main` must come from `staging`** (`restrict-main-pr.yml`)
    - A `staging` workflow must have been completed beforehand.

## Generated scripts

Shared scripts and stacks only exist while one of the repo's apps needs them; re-running the generator removes the ones no app uses anymore:

| Files | Present when an app… |
|---|---|
| `scripts/deployment/remove-staging.sh`, `scripts/jobs/recreate-staging.sh`, `recreate-staging.yml`, `restrict-main-pr.yml` | uses the staging pipeline |
| `scripts/jobs/get-changed-components.sh` | is fullstack with the staging pipeline |
| `scripts/deployment/scale-backend.sh`, `stacks/<service>.yml` | is backend/fullstack |
| `scripts/db-backup/*.sh` | has a database (`DB=postgres`) |
| `stacks/stack.yml` | is frontend |

## Staging workflow (`staging` branch): 

* **Staging STACK_NAME must be named "staging".** 
* Fullstack apps: pick the images to rebuild (`get-changed-components.sh`)
* Build app's docker image(s)
* Push the image to ghcr.io
* Generate YAML file with image tag
* Copy generated YAML file to VPS
* Pull app's image
* Deploy ( Docker Swarm / Traefik )

## Production workflow (`main` branch, staging pipeline):

Uploads only the stack file: it runs the deployment scripts uploaded by the last staging run.

* Copy image tags from `<service>-staging.yml` file.
    * *Known limitation*: these are the images **currently deployed on staging**, not necessarily the ones built from the merged commit (e.g. after a staging rollback, or a push to `staging` after the merge). Check the staging deployment before merging.
* Deploy ( Docker Swarm / Traefik )
* Removes old images of the service (keep newest N) from ghcr.io.
* Stop staging instance, only if the production deploy succeeded

`recreate-staging.yml` — a **separate** workflow, not a step of the production workflow above — resets the `staging` branch to `main`. It's triggered via `workflow_run` once one of the listed `"CI/CD <Service> production"` workflows **succeeds** on `main`. It fast-forwards `staging` (merge commits), or resets it when it has the same content as `main` (squash/rebase merges). It fails and leaves `staging` alone when it has changes `main` doesn't have, e.g. commits pushed after the merge.

## Direct workflow (`main` branch):

* Build app's docker image(s) (always all of them)
* Push the image to ghcr.io
* Generate YAML file with image tag
* Copy generated YAML file to VPS
* Pull app's image
* Deploy ( Docker Swarm / Traefik )
* Removes old images of the service (keep newest N) from ghcr.io.

## Deployment scripts (Ubuntu server)

**CD to directory before running scripts.**  

- deploy.sh

Top-level orchestrator: calls `stack-deploy.sh`, then `healthcheck.sh`, then `post-job.sh` in sequence. Exits 1 (failing the job) if `stack-deploy.sh` or `healthcheck.sh` fails.                  
With `DB=postgres`, first backs up the database (`db-backup/backup.sh`) if its `postgres` service is running (skipped on a first deployment). A failed backup aborts the deployment, as a rollback would otherwise restore an older backup.

- docker-login.sh

Writes `.docker/config.json` file and logs in to ghcr.io.           
Uses `DOCKER_AUTH` GitHub secret (see top of this file). Strips CR/LF/spaces from it before writing the JSON.

- docker-logout.sh

Logs out of ghcr.io, called by `post-job.sh`, `rollback.sh`, and `stack-deploy.sh` when the pull fails.

- stack-deploy.sh

Moves the current .yml to `prev-<service>-<stack>.yml` (if any) and the new one in place, then pulls the images and deploys the stack YAML (Docker Swarm, `--with-registry-auth`).                  
If the pull fails, restores the previous .yml files, logs out and exits 1 **before** deploying (no rollback).

- replace-placeholders.sh

Replaces `image-placeholder` in new .yml file. 

* For staging : if image tag is default `:image-placeholder`, copies the corresponding image tag from `prev-<service>-staging.yml`.
* For production (staging pipeline): copies the image tags from `<service>-staging.yml`.
* For production (direct pipeline, `PIPELINE=direct`): copies the image tag from `prev-<service>-production.yml`.
* Does nothing if there's no placeholder or no origin file (first deployment); the pull then fails on the placeholder tag.

- healthcheck.sh

Polls every service of the stack (`$APP_LOWER-${STACK_NAME}_*`) every 10s. A service is healthy when all its replicas run its **new** image: tasks of the previous version still running during the update don't count. The `-migrations` service must have completed.                      
Prints the last 3 tasks of an unhealthy service (`docker service ps --no-trunc`), as tasks that never started have no logs.                  
Calls `rollback.sh` and exits 1 when the migrations failed or an update is paused / rolled back by Swarm (right away), or when not all services are healthy after `HEALTHCHECK_TIMEOUT` seconds (**90** by default, 150 for backend/fullstack apps).

- rollback.sh

Called by `healthcheck.sh`.                  
With `DB=postgres`, restores the backup made by `deploy.sh` for this deployment (path in `.last-backup-<service>-<stack>`), undoing its migrations. A failed restore is logged and the rollback continues.                  
Archives .yml file associated with failed deployment in `failed/` folder, with timestamps. Removes the oldest archived files.             
Renames `prev-"$SERVICE_NAME"-"$STACK_NAME".yml` to `"$SERVICE_NAME"-"$STACK_NAME".yml`. Deploys the previous version with it.                  
On a first deployment (no `prev-` file), removes the failed stack instead.                  
Calls `docker-logout.sh`.

- post-job.sh

Makes new .yml file read-only.                                            
Cleans up (`remove-old-images.sh`, `docker-logout.sh`).                  
Scales the server to `SERVER_REPLICAS` (`scale-backend.sh`) when it's above 1.                  
Logs available images.                    

- remove-old-images.sh

Prunes old ghcr.io images of the stack from local Docker (sorted by creation date, keeping the most recent 3 per image), separately from the GH-Action-based `delete-package-versions` cleanup on ghcr.io (keeps the newest `--keep-images`, default 3).

- remove-staging.sh *(staging pipeline)*

Removes the staging Docker Swarm stack (its database volume is kept).

- scale-backend.sh *(backend/fullstack)*

Scales the `-server` service to `SERVER_REPLICAS`.

### Database backup scripts (Ubuntu server, `scripts/db-backup/`, apps with a database)

- backup.sh

`pg_dump` of the stack's database, gzipped and encrypted with `ENCRYPTION_PASSWORD` (AES-256-CBC, PBKDF2) into `$BACKUP_DIR` (default `/backups`, must be writable by the SSH user), as `<APP_SNAKE>_<stack>_backup_<timestamp>.sql.gz.enc`. Backups of the stack older than 7 days are deleted (backups named `<db name>_backup_*`, by older versions of the kit, are left: delete them manually). The passwords are passed through the environment, never as command arguments (visible in `ps`). Writes the backup path to `.last-backup-<service>-<stack>`.

- restore.sh

Restores `BACKUP_FILE` (default: the stack's most recent backup) into the stack's running database. Manual use: `cd <project> && APP_LOWER=… APP_SNAKE=… SERVICE_NAME=… STACK_NAME=… ENCRYPTION_PASSWORD=… BACKUP_FILE=… ./scripts/db-backup/restore.sh`.

### Jobs scripts (run inside GitHub Actions, not on the VPS)

- `format-name.sh` — derives `PROJECT_LOWER`/`REPO_LOWER` from the repo name, and `APP_LOWER`/`IMAGE_LOWER`/`APP_SNAKE` from it, `SERVICE_NAME` and `APP_MODE` (`solo|monorepo`, see "Naming").
- `create-stack.sh` — see above.
- `add-tag.sh` — sets the new tag on the built image(s) in the stack file; other images keep `image-placeholder`.
- `build-and-publish.sh` — builds (context = repo root) and publishes the Docker image to ghcr.io: from `DOCKERFILE` (frontend) or one image per `COMPONENTS` entry (`name:dockerfile`, backend/fullstack).
- `get-changed-components.sh` *(fullstack staging)* — fullstack staging builds: keeps the components whose directory changed since `origin/main`, all of them when a shared path (`SHARED_PATHS`) changed, nothing matched (first deployment, workflow-only change) or there's no `origin/main`. Unchanged images reuse their previous tag (`replace-placeholders.sh`).
- `recreate-staging.sh` *(staging pipeline)* — the script backing the `recreate-staging.yml` workflow described above (fast-forward, same-content reset with `--force-with-lease`, or refusal).
