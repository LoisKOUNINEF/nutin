#!/bin/bash

docker_logout() {
  docker logout ghcr.io
  rm -f ~/.docker/config.json
}

docker_logout
