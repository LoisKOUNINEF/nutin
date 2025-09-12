#!/bin/bash

replace_placeholders() {
  echo "Checking for missing image tags to update"

  if [ "$SERVICE_NAME" = "tutorial" ]; then
    origin="prev-${SERVICE_NAME}-production.yml"
  elif [ "$STACK_NAME" = "staging" ]; then
    origin="prev-${SERVICE_NAME}-staging.yml"
  else
    origin="${SERVICE_NAME}-staging.yml"
  fi

  patterns=$(grep ":image-placeholder" "${SERVICE_NAME}-${STACK_NAME}".yml | sed 's/:image-placeholder.*//')

  while IFS= read -r pattern; do
    echo "Updating missing image tags with latest"
    
    replacement_lines=$(grep "$pattern" "$origin" | sed 's|.*:||')

    if [ -n "$replacement_lines" ]; then
      while IFS= read -r replacement_line; do
        sed -i "s|$pattern:image-placeholder.*|$pattern:$replacement_line|g" "${SERVICE_NAME}-${STACK_NAME}".yml
      done <<< "$replacement_lines"
    fi
  done <<< "$patterns"
}

replace_placeholders