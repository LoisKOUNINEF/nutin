# Workflows Docs

## Website

- **Scripts require env variables :** `STACK_NAME`, `DOMAIN_NAME`, `SERVER_PORT`, `CLIENT_PORT`    
            
- **Staging STACK_NAME must be named "staging".** 
- **Production workflow (main branch) needs the staging one**

### Staging workflow (`staging` branch): 

* Build app's docker image
* Push the image to ghcr.io
* Generate YAML file with image tag
* Copy created YAML file to VPS
* Pull app's image
* Deploy ( Docker Swarm / Traefik )

### Production workflow (`main` branch):

* Copy image tags from website-staging.yml file.
* Deploy ( Docker Swarm / Traefik )                                                  

- YAML file generation

 `.github/workflows/jobs/create-stack.sh` generates a new .yaml file with `envsubst` and file `.github/workflows/stacks/stack.yml`.

- *Some scripts use variables set in `format-name.sh` (`REPO_LOWER`, `PROJECT_LOWER`).*

## Deployment scripts (Ubuntu server)

**CD to directory before running scripts.**  

- docker-login.sh

Writes `.docker/config.json` file and logs in to ghcr.io.           
Uses `DOCKER_AUTH` GitHub secret, generated with `echo -n "username:PAT" | base64`. Must be re-generated when `PAT` changes.                   

- replace-placeholders.sh

Replaces `image-placeholder` in new .yml file. 

* For staging : if no new image were created for a service, copies the corresponding image tag from prev-website-staging.yml file.           
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