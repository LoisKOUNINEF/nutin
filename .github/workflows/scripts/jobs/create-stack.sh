#!/bin/bash

# backend/fullstack apps have their own stack file, frontend apps share stack.yml
stack_file=".github/workflows/stacks/${SERVICE_NAME}.yml"
[ -f "$stack_file" ] || stack_file=".github/workflows/stacks/stack.yml"

envsubst < "$stack_file" > new-${SERVICE_NAME}-${STACK_NAME}.yml
