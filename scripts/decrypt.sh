#! /bin/bash

########################################
# Decrypts secret JSON file using gpg
# Arguments: 
#   $1: file that holds the encrypted secrets
#   $2: passphrase used to encrypt the secrets
#   $3: path to store decrypted secrets
# Returns:
#   None
function main() {
  local secret_file_path="$1"
  local passphrase="$2"
  local result_file_path="$3"

  gpg --quiet --batch --yes --decrypt --passphrase="${passphrase}" --output "${result_file_path}" "${secret_file_path}"
}

main "$@"