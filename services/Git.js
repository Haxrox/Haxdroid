const Process = require('./Process.js');

/**
 * Git service for fetching current branch + revision
 */
class Git {
  /**
   * Gets the current git branch
   * @return {Promise<String>} current git branch
   */
  getBranch() {
    return Process.exec('git status').then((result) => {
      const regExp = new RegExp(/On branch (.*)/);
      return result.stdout.match(regExp)[1].trim();
    });
  }

  /**
   * Gets the current git revision
   * @return {Promise<String>} current git revision
   */
  getRevision() {
    return Process.exec('git rev-parse HEAD').then((result) => {
      return result.stdout.trim();
    });
  }

  /**
   * Gets the current git remote
   * @return {Promise<String>} current git remote
   */
  getRemote() {
    return Process.exec('git remote get-url $(git remote)').then((result) => {
      return result.stdout.trim().slice(0, -4);
    });
  }
}

module.exports = Git;
