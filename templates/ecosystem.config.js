/*
 * argv[2] is CONFIG_PASSPHRASE
 */
module.exports = {
  apps: [{
    name: "<Bot Name>",
    script: 'npm start',
    ignore_watch: ["node_modules"]
  }],

  deploy : {
    production : {
      user: '<SSH_USERNAME>',
      host: '<SSH_HOST>',
      ref  : '<REPO_BRANCH>',
      repo : '<GIT_REPOSITORY>',
      path: '<REMOTE_DESTINATION_PATH>',
      ssh_options: "StrictHostKeyChecking=no",
      'pre-setup': 'mkdir -p <REMOTE_DIRECTORY_PATH>',
      'post-setup': 'npm install && npm run configure -- ' + process.argv[2]
    }
  }
};
