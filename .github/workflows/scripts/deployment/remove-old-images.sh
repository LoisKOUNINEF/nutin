#!/bin/bash

remove_old_images() {
  sed -n 's|.*image:[[:space:]]*\(ghcr\.io/[^:]*\).*|\1|p' "$SERVICE_NAME"-"$STACK_NAME".yml | sort -u |
  while IFS= read -r image; do
    # keep the 3 most recent images, sorted by creation date
    docker image ls "$image" --format "{{.CreatedAt}}\t{{.Repository}}:{{.Tag}}" |
    sort -r |
    tail -n +4 |
    cut -f2 |
    xargs -r docker rmi || true
  done
}

remove_old_images
