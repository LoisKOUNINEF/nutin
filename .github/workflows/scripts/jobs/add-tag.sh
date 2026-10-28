#!/bin/bash

echo "Updating image tags in new-${SERVICE_NAME}-${STACK_NAME}.yml"

add_tag() {
  local image_name="${IMAGE_LOWER}$1"
  sed -i "s|image: ghcr.io/${image_name}:.*|image: ghcr.io/${image_name}:${GITHUB_SHA}|" new-${SERVICE_NAME}-${STACK_NAME}.yml
}

# COMPONENTS (backend/fullstack): only the components built by this run get the new tag,
# the others keep image-placeholder and get their previous tag on the VPS (replace-placeholders.sh)
if [ -n "$COMPONENTS" ]; then
  IFS=',' read -ra components <<< "$COMPONENTS"

  for component in "${components[@]}"; do
    add_tag "-${component%%:*}"
  done
else
  add_tag ""
fi
