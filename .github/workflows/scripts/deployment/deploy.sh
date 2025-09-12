#!/bin/bash

deploy() {
  local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

  "$script_dir/stack-deploy.sh"
  "$script_dir/healthcheck.sh"
  "$script_dir/post-job.sh"
}

deploy