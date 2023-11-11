#! /bin/bash
# decrypt.sh
# Decrypts secrets used in this repository
# Arguments:
#   $1: passphrase used to encrypt the secrets

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
  decrypt "../HaxVM_key.pem.gpg" "../HaxVM_key.pem" passphrase
  chmod 400 "../HaxVM_key.pem"
  # Decrypt config file
  decrypt "../configs/config.json.gpg" "../configs/config.json" passphrase

  # Decrypt ecosystem.config.js
  decrypt "../configs/ecosystem.config.js.gpg" "../configs/ecosystem.config.js" passphrase
}
main "$@"