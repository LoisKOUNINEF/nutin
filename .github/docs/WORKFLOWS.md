# Workflows Docs

- **`DOCKER_AUTH` GitHub Actions secret must be regenerated & updated when PAT changes** 
    - generate with `echo -n "username:PAT" | base64`.
    - *note : generate PAT* : Profile Pic -> Settings -> Left sidebar : Developer Settings -> Personal Access Tokens.

- Other secrets used across the deployment workflows: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_PASS`, `SSH_PORT` (VPS access for `scp`/`ssh` steps).

- `.github/workflows/scripts/jobs/create-stack.sh` generates a new .yaml file with `envsubst` from file `.github/workflows/stacks/stack.yml` and ENV variables :
    - ENV variables : `PROJECT_LOWER`, `SERVICE_NAME`, `STACK_NAME`, `REPO_LOWER`, `DOMAIN_NAME`, `CLIENT_PORT`. (*`REPO_LOWER` and `PROJECT_LOWER`* are set by `format-name.sh`).

- **Production workflow (main branch)**
    - **Pull requests to `main` must come from `staging`**
    - A `staging` workflow must have been completed beforehand.

## Staging workflow (`staging` branch): 

* **Staging STACK_NAME must be named "staging".** 
* Build app's docker image
* Push the image to ghcr.io
* Generate YAML file with image tag
* Copy generated YAML file to VPS
* Pull app's image
* Deploy ( Docker Swarm / Traefik )
* *Note : Staging STACK_NAME must be named "staging".* 

## Production workflow (`main` branch):

* Copy image tags from website-staging.yml file.
* Deploy ( Docker Swarm / Traefik )
* Removes old images (keep newest 3) from ghcr.io (website / tutorial).
* Stop staging instance (website)

`recreate-staging.yml` — a **separate** workflow, not a step of the production workflow above — deletes and recreates the `staging` branch. It's triggered via `workflow_run` once the `"CI/CD Website production"` workflow completes on `main`.

## Deployment scripts (Ubuntu server)

**CD to directory before running scripts.**  

- deploy.sh

Top-level orchestrator: calls `stack-deploy.sh`, then `healthcheck.sh`, then `post-job.sh` in sequence.

- docker-login.sh

Writes `.docker/config.json` file and logs in to ghcr.io.           
Uses `DOCKER_AUTH` GitHub secret, generated with `echo -n "username:PAT" | base64`. Must be re-generated when `PAT` changes.

- docker-logout.sh

Logs out of ghcr.io, called as part of `post-job.sh`.

- stack-deploy.sh

Deploys the generated stack YAML (Docker Swarm).

- replace-placeholders.sh

Replaces `image-placeholder` in new .yml file. 

* For staging : if image tag is default `:image-placeholder`, copies the corresponding image tag from `prev-<service>-staging.yml`.
* For production: copies the image tags from `<service>-staging.yml`.

- healthcheck.sh

Polls Docker Swarm service replica counts (`$PROJECT_LOWER-$SERVICE_NAME-$STACK_NAME`) every 10s.                      
Calls `rollback.sh` if not all replicas are healthy after **90 seconds**.

- rollback.sh

Called by `healthcheck.sh`.                  
Archives .yml file associated with failed deployment in `failed/` folder, with timestamps. Removes the oldest archived files.             
Renames `prev-"$SERVICE_NAME"-"$STACK_NAME".yml` to `"$SERVICE_NAME"-"$STACK_NAME".yml`. Deploys the previous version with it.                  
Calls `docker-logout.sh`.

- post-job.sh

Makes new .yml file read-only.                                            
Cleans up (`remove-old-images.sh`, `docker-logout.sh`).                  
Logs available images.                    

- remove-old-images.sh

Prunes old images for the deployed service from local Docker (`docker image ls` sorted, keeping the most recent 3), separately from the GH-Action-based `delete-package-versions` cleanup on ghcr.io (which is configured to keep the newest 3).

- remove-staging.sh

Removes the staging Docker Swarm stack.

### Jobs scripts (run inside GitHub Actions, not on the VPS)

- `format-name.sh` — derives `PROJECT_LOWER`/`REPO_LOWER` from the repo name.
- `create-stack.sh` — see above.
- `add-tag.sh` — tags/pushes the built image.
- `build-and-publish.sh` — builds and publishes the Docker image to ghcr.io.
- `recreate-staging.sh` — the script backing the `recreate-staging.yml` workflow described above.

## @nutin/cli

**`main` branch workflow**

Publishing `@nutin/cli` to NPM is currently **manual**. The automated workflow (`publish-nutin.yml.commented`) is disabled — its filename doesn't end in `.yml` so GitHub Actions never picks it up, and its body is fully commented out, with the note: *"Workflow disabled because of publishing issue. Couldn't identify the cause so far; will publish manually for the time being."* It would use the `NPM_TOKEN` secret once re-enabled.
