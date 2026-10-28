#!/bin/bash

yaml_read_only() {
  chmod 400 "$SERVICE_NAME"-"$STACK_NAME".yml
}

post_job() {
  local script_dir="$(dirname "$0")"

  echo "All services are up and healthy!"

  "$script_dir/remove-old-images.sh"
  "$script_dir/docker-logout.sh"

  if [ "${SERVER_REPLICAS:-1}" -gt 1 ]; then
    "$script_dir/scale-backend.sh"
  fi

  yaml_read_only

  echo "Listing images:"
  docker image ls --filter "reference=ghcr.io/$IMAGE_LOWER*" --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedSince}}" || true
}

post_job
