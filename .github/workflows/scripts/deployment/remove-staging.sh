#!/bin/bash

remove_staging_stack() {
  docker stack rm "$APP_LOWER-staging"
}

remove_staging_stack
