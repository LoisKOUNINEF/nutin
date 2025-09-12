#!/bin/bash

remove-staging-stack() {
	docker stack rm $PROJECT_LOWER-$SERVICE_NAME-staging
}

remove-staging-stack