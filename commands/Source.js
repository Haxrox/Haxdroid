const Command = require('./Command.js');

/**
 * Returns GitHub repo for bot
 */
class Source extends Command {
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    interaction.reply('https://github.com/Haxrox/Haxdroid');
  }
}

module.exports = new Source('Source', 'Gets the bot source code');
