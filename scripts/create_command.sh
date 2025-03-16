#! /bin/bash

source ./scripts/utils.sh

main() {
  local command_name="$1"
  local description="$2"

  create "Command" "${command_name}" "${description}"
}

main "$@"