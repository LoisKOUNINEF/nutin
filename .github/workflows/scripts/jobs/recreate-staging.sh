#!/bin/bash

git config user.name github-actions
git config user.email github-actions@github.com

git fetch origin

git push origin --delete staging || true

git checkout -b staging origin/main

git push -f origin staging