#!/bin/bash

envsubst < .github/workflows/stacks/stack.yml > new-${SERVICE_NAME}-${STACK_NAME}.yml