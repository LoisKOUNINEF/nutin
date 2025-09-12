#!/bin/bash

echo "REPO_LOWER=$(echo ${GITHUB_REPOSITORY} | tr '[:upper:]' '[:lower:]' | tr '_' '-')" >> $GITHUB_ENV

echo "PROJECT_LOWER=$(echo ${GITHUB_REPOSITORY##*/} | tr '[:upper:]' '[:lower:]' | tr '_' '-')" >> $GITHUB_ENV
