#!/bin/bash

clean_archive() {
  failed_files=$(find failed/failed_"$SERVICE_NAME"-"$STACK_NAME" -maxdepth 1 -type f -name "failed_${SERVICE_NAME}-${STACK_NAME}*" | wc -l)
  
  if [ $failed_files -gt 10 ]; then
    echo "There are $failed_files failed files."
    echo "Removing the oldest 5...."

    oldest=$(find failed/failed_"$SERVICE_NAME"-"$STACK_NAME" -maxdepth 1 -type f -name "failed_${SERVICE_NAME}-${STACK_NAME}_*.yml" -printf '%T@ %p\n' | sort -n | head -5 | cut -d' ' -f2)

    for file in $oldest; do
      echo "Removing $file"
      rm "$file"
    done
  fi
}

archive() {
  mkdir -p failed/failed_"$SERVICE_NAME"-"$STACK_NAME"

  echo "Archiving yaml file in failed/failed_"$SERVICE_NAME"-"$STACK_NAME"." 
  mv "$SERVICE_NAME"-"$STACK_NAME".yml failed/failed_"$SERVICE_NAME"-"$STACK_NAME"/failed_"$SERVICE_NAME"-"$STACK_NAME"_$(date +"%Y-%m-%d_%H-%M-%S").yml

  clean_archive
}

deploy_previous() {
  if [ ! -f prev-"$SERVICE_NAME"-"$STACK_NAME".yml ]; then
    echo "No previous version for "$SERVICE_NAME"-"$STACK_NAME", removing the failed stack..." >&2
    docker stack rm "$APP_LOWER"-"$STACK_NAME"
    return
  fi

  echo "Rolling back to previous version for "$SERVICE_NAME"-"$STACK_NAME"..." >&2

  mv prev-"$SERVICE_NAME"-"$STACK_NAME".yml "$SERVICE_NAME"-"$STACK_NAME".yml

  docker stack deploy --with-registry-auth -c "$SERVICE_NAME"-"$STACK_NAME".yml "$APP_LOWER"-"$STACK_NAME"
}

# DB=postgres: restores the backup deploy.sh made before this deployment (undoes its migrations)
restore_database() {
  local script_dir="$1"
  local marker=".last-backup-$SERVICE_NAME-$STACK_NAME"

  if [ ! -f "$marker" ]; then
    echo "No backup made before this deployment, skipping database restore." >&2
    return
  fi

  if ! BACKUP_FILE="$(cat "$marker")" "$script_dir/../db-backup/restore.sh"; then
    echo "ERROR: Database restore failed! Restore $(cat "$marker") manually." >&2
  fi
}

rollback() {
  local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

  echo "Stack $STACK_NAME failed to become healthy. The "$SERVICE_NAME"-"$STACK_NAME" live version for "$PROJECT_LOWER" will be rolled back to previous stable version." >&2
  echo "WARNING: Failed to deploy new $STACK_NAME version!" >&2

  if [ "$DB" = "postgres" ]; then
    restore_database "$script_dir"
  fi

  archive
  deploy_previous

  echo "Rollback to previous version executed." >&2
  
  "$script_dir/docker-logout.sh"

  exit 1
}

rollback
