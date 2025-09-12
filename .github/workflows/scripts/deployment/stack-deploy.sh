#!/bin/bash

new_yaml() {
  echo "Replacing $SERVICE_NAME-$STACK_NAME yaml file"

  mv "$SERVICE_NAME"-"$STACK_NAME".yml prev-"$SERVICE_NAME"-"$STACK_NAME".yml
  mv new-"$SERVICE_NAME"-"$STACK_NAME".yml "$SERVICE_NAME"-"$STACK_NAME".yml
}

pull_images() {
  docker-compose -f "$SERVICE_NAME"-"$STACK_NAME".yml pull
}

deploy_stack() {
  docker stack deploy -c "$SERVICE_NAME"-"$STACK_NAME".yml "$PROJECT_LOWER"-"$SERVICE_NAME"-"$STACK_NAME"
}

stack_deploy() {
  local script_dir="$(dirname "$0")"

  new_yaml

  echo "Deploying $SERVICE_NAME-$STACK_NAME..."

  "$script_dir/docker-login.sh"
  "$script_dir/replace-placeholders.sh"

  pull_images
  deploy_stack
}

stack_deploy
