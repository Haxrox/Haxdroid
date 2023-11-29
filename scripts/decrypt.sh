#! /bin/bash
# decrypt.sh
# Decrypts secrets used in this repository
# Arguments:
#   $1: passphrase used to encrypt the secrets

declare -r KEY_PATH="./configs/HaxVM_key.pem"
declare -r CONFIG_PATH="./configs/config.json"
declare -r PM2_ECOSYSTEM_PATH="./configs/ecosystem.config.js"

########################################
# Decrypts secret JSON file using gpg
# Arguments: 
#   $1: file that holds the encrypted secrets
#   $2: path to store decrypted secrets
#   $3: passphrase used to encrypt the secrets
# Returns:
#   None
function decrypt() {
  local secret_file_path="$1"
  local result_file_path="$2"
  local passphrase="$3"

  if [ ! -e "${secret_file_path}" ]; then
    echo "[ERROR] ${secret_file_path} not found"
    return 1;
  fi

  gpg --quiet --batch --yes --decrypt --passphrase="${passphrase}" --output "${result_file_path}" "${secret_file_path}"
}

########################################
# Main function
# Arguments: 
#   $1: passphrase used to encrypt the secrets
# Returns:
#   None
function main() {
  local passphrase="$1"

  # Decrypt key file
  decrypt "${KEY_PATH}.gpg" "${KEY_PATH}" "${passphrase}"
  if [ -e "${KEY_PATH}" ]; then
    chmod 400 "${KEY_PATH}"
  fi

  # Decrypt config file
  decrypt "${CONFIG_PATH}.gpg" "${CONFIG_PATH}" "${passphrase}"

  # Decrypt ecosystem.config.js
  decrypt "${PM2_ECOSYSTEM_PATH}.gpg" "${PM2_ECOSYSTEM_PATH}" "${passphrase}"
}

main "$@"