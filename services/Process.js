const childProcess = require('child_process');
const util = require('util');

/**
 * Promisify child process functions
 */
module.exports = {
  exec: util.promisify(childProcess.exec),
  spawn: util.promisify(childProcess.spawn),
  execSync: util.promisify(childProcess.execSync),
};
