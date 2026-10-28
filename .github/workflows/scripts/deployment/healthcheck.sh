#!/bin/bash

# The stack's services: exactly "<APP_LOWER>-<STACK_NAME>_*", not other stacks sharing the prefix
stack_services() {
  docker service ls --format "{{.Name}}" | grep "^$APP_LOWER-${STACK_NAME}_" || true
}

# Running tasks on the service's current image vs its replicas: "<running>/<expected>". A task of
# the previous image doesn't count, so the stack isn't healthy before Swarm has replaced it.
service_replicas() {
  local service="$1" image expected running

  image="$(docker service inspect --format '{{.Spec.TaskTemplate.ContainerSpec.Image}}' "$service")"
  expected="$(docker service inspect --format '{{if .Spec.Mode.Replicated}}{{.Spec.Mode.Replicated.Replicas}}{{end}}' "$service")"
  running="$(docker service ps --no-trunc --filter desired-state=running --format '{{.Image}} {{.CurrentState}}' "$service" | grep -cF "$image Running" || true)"

  echo "$running/${expected:-1}"
}

# Swarm's update state: empty (new service), updating, completed, paused, rollback_*
update_state() {
  docker service inspect --format '{{if .UpdateStatus}}{{.UpdateStatus.State}}{{end}}' "$1"
}

# Lowercased state of the service's latest task (complete, failed, rejected, running…)
latest_task_state() {
  docker service ps --format "{{.CurrentState}}" "$1" | head -n 1 | awk '{ print tolower($1) }'
}

# Prints the last 3 tasks of a service: tasks that never started have no logs, their error is only here
print_tasks() {
  docker service ps --no-trunc --format "  {{.Name}} {{.CurrentState}} {{.Error}}" "$1" | head -n 3
}

# Returns 0 when every service runs its new version, 1 while waiting, 2 when a service failed for good.
check_services() {
  local services service replicas state
  local all_healthy=true

  services="$(stack_services)"
  if [ -z "$services" ]; then
    echo "No $APP_LOWER-$STACK_NAME services yet"
    return 1
  fi

  for service in $services; do
    # migrations run once and exit: their last task must have completed
    case "$service" in
      *-migrations)
        state="$(latest_task_state "$service")"
        case "$state" in
          complete) echo "$service completed" ;;
          failed|rejected)
            echo "$service failed ($state)"
            print_tasks "$service"
            return 2
            ;;
          *) echo "$service is running (${state:-no task yet})"; all_healthy=false ;;
        esac
        continue
        ;;
    esac

    # a paused or rolled back update won't recover on its own
    state="$(update_state "$service")"
    case "$state" in
      paused|rollback_*)
        echo "$service update is $state"
        print_tasks "$service"
        return 2
        ;;
    esac

    replicas="$(service_replicas "$service")"
    if [ "${replicas%/*}" = "${replicas#*/}" ]; then
      echo "$service is healthy ($replicas)"
    else
      echo "$service is unhealthy ($replicas${state:+, update $state})"
      print_tasks "$service"
      all_healthy=false
    fi
  done

  $all_healthy
}

healthcheck() {
  local timeout="${HEALTHCHECK_TIMEOUT:-90}"
  local start_time=$(date +%s)
  local elapsed status

  while true; do
    status=0
    check_services || status=$?

    if [ "$status" -eq 0 ]; then
      echo "All services are healthy"
      return 0
    fi

    if [ "$status" -eq 2 ]; then
      echo "A service failed, not waiting for the timeout."
      return 1
    fi

    elapsed=$(($(date +%s) - start_time))

    if [ $elapsed -ge $timeout ]; then
      echo "Timeout reached. Not all services are healthy."
      return 1
    fi

    echo "Waiting for all services to become healthy..."
    sleep 10
  done
}

script_dir="$(dirname "$0")"
if ! healthcheck; then
  "$script_dir/rollback.sh"
  exit 1
fi
