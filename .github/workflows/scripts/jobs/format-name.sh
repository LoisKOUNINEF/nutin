#!/bin/bash

repo_lower="$(echo ${GITHUB_REPOSITORY} | tr '[:upper:]' '[:lower:]' | tr '_' '-')"
project_lower="$(echo ${GITHUB_REPOSITORY##*/} | tr '[:upper:]' '[:lower:]' | tr '_' '-')"

echo "REPO_LOWER=$repo_lower" >> $GITHUB_ENV
echo "PROJECT_LOWER=$project_lower" >> $GITHUB_ENV

# APP_MODE=solo: the repo is the app, names drop the service ("<repo>" instead of "<repo>-<service>")
if [ "$APP_MODE" = "solo" ]; then
  echo "APP_LOWER=$project_lower" >> $GITHUB_ENV
  echo "IMAGE_LOWER=$repo_lower" >> $GITHUB_ENV
  echo "APP_SNAKE=$project_lower" >> $GITHUB_ENV
else
  echo "APP_LOWER=$project_lower-$SERVICE_NAME" >> $GITHUB_ENV
  echo "IMAGE_LOWER=$repo_lower-$SERVICE_NAME" >> $GITHUB_ENV
  echo "APP_SNAKE=${project_lower}_$SERVICE_NAME" >> $GITHUB_ENV
fi
