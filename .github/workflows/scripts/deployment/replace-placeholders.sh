#!/bin/bash

replace_placeholders() {
  echo "Checking for missing image tags to update"

  if [ "$PIPELINE" = "direct" ]; then
    origin="prev-${SERVICE_NAME}-production.yml"
  elif [ "$STACK_NAME" = "staging" ]; then
    origin="prev-${SERVICE_NAME}-staging.yml"
  else
    origin="${SERVICE_NAME}-staging.yml"
  fi

  patterns=$(grep ":image-placeholder" "${SERVICE_NAME}-${STACK_NAME}".yml | sed 's/:image-placeholder.*//')

  if [ -z "$patterns" ]; then
    echo "No missing image tags"
    return 0
  fi

  if [ ! -f "$origin" ]; then
    echo "No $origin file, nothing to update"
    return 0
  fi

  while IFS= read -r pattern; do
    [ -z "$pattern" ] && continue

    echo "Updating missing image tag with latest for ${pattern##*image: }"

    tag=$(grep -m1 -F "$pattern:" "$origin" | sed 's|.*:||')

    if [ -n "$tag" ]; then
      sed -i "s|$pattern:image-placeholder.*|$pattern:$tag|g" "${SERVICE_NAME}-${STACK_NAME}".yml
    fi
  done <<< "$patterns"
}

replace_placeholders
