#!/bin/bash

docker_login() {
  # strip newlines/spaces from the secret (e.g. trailing \n or base64 line wrapping), they break the JSON
  local auth="$(printf '%s' "$DOCKER_AUTH" | tr -d '\r\n ')"

  mkdir -p ~/.docker
  printf '{\n  "auths": {\n    "ghcr.io": {\n      "auth": "%s"\n    }\n  }\n}\n' "$auth" > ~/.docker/config.json

  docker login ghcr.io || exit 1
}

docker_login
