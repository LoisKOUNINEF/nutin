#!/bin/bash

# DB=postgres: back up the database before deploying, rollback.sh restores this backup
backup_database() {
  local script_dir="$1"
  local marker=".last-backup-$SERVICE_NAME-$STACK_NAME"

  rm -f "$marker"

  # first deployment: no database to back up yet
  if ! docker service ls --format "{{.Name}}" | grep -qx "$APP_LOWER-${STACK_NAME}_postgres"; then
    echo "No $SERVICE_NAME-$STACK_NAME database running, skipping backup"
    return 0
  fi

  # without a fresh backup, a rollback would restore an older one
  if ! "$script_dir/../db-backup/backup.sh"; then
    echo "ERROR: Database backup failed, aborting $SERVICE_NAME-$STACK_NAME deployment." >&2
    return 1
  fi
}

deploy() {
  local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

  if [ "$DB" = "postgres" ]; then
    backup_database "$script_dir" || exit 1
  fi

  "$script_dir/stack-deploy.sh" || exit 1
  "$script_dir/healthcheck.sh" || exit 1
  "$script_dir/post-job.sh"
}

deploy
