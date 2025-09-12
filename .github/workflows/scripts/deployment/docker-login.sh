#!/bin/bash

docker_login() {
  echo '{
    "auths": {
      "ghcr.io": {
        "auth": "'"$DOCKER_AUTH"'"
      }
    }
  }' > ~/.docker/config.json

  docker login ghcr.io || exit 1
}

docker_login