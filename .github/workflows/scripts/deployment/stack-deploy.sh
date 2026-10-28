#!/bin/bash

new_yaml() {
  echo "Replacing $SERVICE_NAME-$STACK_NAME yaml file"

  if [ -f "$SERVICE_NAME"-"$STACK_NAME".yml ]; then
    mv "$SERVICE_NAME"-"$STACK_NAME".yml prev-"$SERVICE_NAME"-"$STACK_NAME".yml
  fi
  mv new-"$SERVICE_NAME"-"$STACK_NAME".yml "$SERVICE_NAME"-"$STACK_NAME".yml
}

restore_yaml() {
  echo "Restoring previous $SERVICE_NAME-$STACK_NAME yaml file" >&2

  mv "$SERVICE_NAME"-"$STACK_NAME".yml new-"$SERVICE_NAME"-"$STACK_NAME".yml
  if [ -f prev-"$SERVICE_NAME"-"$STACK_NAME".yml ]; then
    mv prev-"$SERVICE_NAME"-"$STACK_NAME".yml "$SERVICE_NAME"-"$STACK_NAME".yml
  fi
}

pull_images() {
  if docker compose version > /dev/null 2>&1; then
    docker compose -f "$SERVICE_NAME"-"$STACK_NAME".yml pull
  else
    docker-compose -f "$SERVICE_NAME"-"$STACK_NAME".yml pull
  fi
}

deploy_stack() {
  docker stack deploy --with-registry-auth -c "$SERVICE_NAME"-"$STACK_NAME".yml "$APP_LOWER"-"$STACK_NAME"
}

stack_deploy() {
  local script_dir="$(dirname "$0")"

  new_yaml

  echo "Deploying $SERVICE_NAME-$STACK_NAME..."

  "$script_dir/docker-login.sh"
  "$script_dir/replace-placeholders.sh"

  # don't deploy (and trigger a rollback) when the images can't be pulled
  if ! pull_images; then
    echo "ERROR: Failed to pull $SERVICE_NAME-$STACK_NAME images. Check that DOCKER_AUTH is a classic PAT with read:packages." >&2
    restore_yaml
    "$script_dir/docker-logout.sh"
    exit 1
  fi

  deploy_stack
}

stack_deploy
