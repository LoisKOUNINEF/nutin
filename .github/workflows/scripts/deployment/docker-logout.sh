#!/bin/bash

docker_logout() {
  docker logout ghcr.io
  rm ~/.docker/config.json
}

docker_logout