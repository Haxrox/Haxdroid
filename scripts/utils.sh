#! /bin/bash

create() {
  local type="$1"
  local name="$2"
  local description="$3"

  local template="./templates/Template${type}.js"
  local destination="./src/${type,,}s/${name}.js"

  if [[ -e "${destination}" ]]; then
    echo "${type} already exists: ${destination}"
    return 1
  fi

  cp "${template}" "${destination}"

  if [[ -e "${destination}" ]]; then
    sed -i "s/${type^^}_NAME/${name}/g; s/${type^^}_DESCRIPTION/${description}/g" "${destination}"
    echo -e "Created ${type}: ${destination}\n\t${description}"
  else
    echo "Failed to create ${type}: ${destination}"
  fi
}