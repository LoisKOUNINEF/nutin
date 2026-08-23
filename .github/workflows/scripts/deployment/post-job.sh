#!/bin/bash

yaml_read_only() {
  chmod 400 "$SERVICE_NAME"-"$STACK_NAME".yml
}

post_job() {
  local script_dir="$(dirname "$0")"

  echo "All services are up and healthy!"

  "$script_dir/remove-old-images.sh"
  "$script_dir/docker-logout.sh"

  yaml_read_only

  echo "Listing images:"
  docker image ls | grep "ghcr.io/$REPO_LOWER"
}

post_job