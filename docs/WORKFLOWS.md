# Workflows Docs

- **`DOCKER_AUTH` GitHub Actions secret must be regenerated & updated when PAT changes** 
    - generate with `echo -n "username:PAT" | base64`.
    - *note : generate PAT* : Profile Pic -> Settings -> Left sidebar : Developer Settings -> Personal Access Tokens.

- `.github/workflows/jobs/create-stack.sh` generates a new .yaml file with `envsubst` from file `.github/workflows/stacks/stack.yml` and ENV variables :
    - ENV variables : `STACK_NAME`, `DOMAIN_NAME`, `SERVER_PORT`, `CLIENT_PORT`. (*`REPO_LOWER` and `PROJECT_LOWER`* are set by `format-name.sh`).

- **Production workflow (main branch)**
    - A `staging` workflow must have been completed beforehand.
    - Removes old images (keep newest 3) from ghcr.io (website / tutorial).
    - Stops staging instance (website).

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

## Deployment scripts (Ubuntu server)

**CD to directory before running scripts.**  

- docker-login.sh

Writes `.docker/config.json` file and logs in to ghcr.io.           
Uses `DOCKER_AUTH` GitHub secret, generated with `echo -n "username:PAT" | base64`. Must be re-generated when `PAT` changes.

- replace-placeholders.sh

Replaces `image-placeholder` in new .yml file. 

* For staging : if image tag is default `:image-placeholder`, copies the corresponding image tag from prev-website-staging.yml file.           
* For production: copies the image tags for all services from website-staging.yml file.

- check-services-health.sh

Loops through services (`$STACK_NAME`) and checks if they're healthy.                      
Calls `rollback.sh` if health checks are unsuccessful after 5 minutes.

- rollback.sh

Called by `check-service-health.sh`.                  
Archives .yml file associated with failed deployment in `failed/` folder, with timestamps. Removes the oldest archived files.             
Renames `prev-"$STACK_NAME".yml` to `"$STACK_NAME".yml`. Deploys the previous version with it.                  
Calls `docker-logout.sh`.

- post-job.sh

Makes new .yml file read-only.                                            
Cleans up (`remove-old-images.sh`, `docker-logout.sh`).                  
Logs available images.                    

- remove-old-images.sh

Keeps only the most recent (3) images.

## nutin

**`main` branch workflow**

- Publish `@nutin/cli` to NPM.
