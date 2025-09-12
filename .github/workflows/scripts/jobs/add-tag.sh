#!/bin/bash

echo "Updating image tags in new-${SERVICE_NAME}-${STACK_NAME}.yml"

image_name="${REPO_LOWER}-${SERVICE_NAME}"
sed -i "s|image: ghcr.io/${image_name}:.*|image: ghcr.io/${image_name}:${GITHUB_SHA}|" new-${SERVICE_NAME}-${STACK_NAME}.yml
