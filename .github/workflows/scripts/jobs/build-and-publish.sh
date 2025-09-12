#!/bin/bash

docker build --platform linux/amd64 -t ghcr.io/${REPO_LOWER}-${SERVICE_NAME}:${GITHUB_SHA} -f ./apps/${SERVICE_NAME}/Dockerfile .
docker push ghcr.io/${REPO_LOWER}-${SERVICE_NAME}:${GITHUB_SHA}