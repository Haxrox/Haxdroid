const FileSystem = require('fs');
const {EmbedBuilder, bold} = require('discord.js');

const Command = require('./Command.js');

/**
 * Displays command list
 */
class Commands extends Command {
  embedBuilder;
  commands = '';
  commandCount = 0;

  /**
   * Constructs commands description and counts the number of commands
   * @param {string} name
   * @param {string} description
   */
  constructor(name, description) {
    super(name, description);
    FileSystem.readdirSync('./commands')
        .filter((file) =>
          (file.endsWith('.js') && file != 'Command.js' &&
          file != 'SlashCommand.js' && file != 'Commands.js'),
        )
        .forEach((file) => {
          const command = require(`../commands/${file}`);
          this.commandCount++;
          this.commands = this.commands
              .concat(bold(`${command.commandName} - `))
              .concat(command.description)
              .concat('\n');
        });

    this.embedBuilder = new EmbedBuilder()
        .setTitle(`List of commands [${this.commandCount}]`)
        .setDescription(this.commands);
  }

  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    await interaction.reply({embeds: [
      this.createEmbed(interaction, this.embedBuilder),
    ]});
  }
}

module.exports = new Commands('Commands', 'Gets a list of commands');
