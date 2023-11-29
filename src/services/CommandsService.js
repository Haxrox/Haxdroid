const {Collection} = require('discord.js');
const FileSystem = require('fs');

const COMMANDS_BASE_PATH = './src/commands';
const RELATIVE_COMMANDS_PATH = '../commands';
/**
 * Commands Service
 */
class CommandsService {
  #commandsDirectory = COMMANDS_BASE_PATH;
  #commands = new Collection();

  /**
   * Creates an embed that follows the base embed format
   * @param {EmbedBuilder} embedBuilder embedBuilder for the embed
   * @return {EmbedBuilder} embed merged with the base embed
   */
  static createBaseEmbed(embedBuilder) {
    const embedData = embedBuilder.data;

    return new EmbedBuilder(embedData)
        .setTimestamp(embedData.timestamp || new Date())
        .setColor(embedData.color || Styles.Colours.Theme);
  }

  /**
   * Creates a commands service
   * @param {String} path path to commands relative from ./src/commands
   * @return {CommandsService} commands service
   */
  static create(path = '/') {
    if (!path.startsWith('/')) {
      path = '/'.concat(path);
    }
    const commandsPath = COMMANDS_BASE_PATH.concat(path);

    if (!FileSystem.existsSync(commandsPath)) {
      return null;
    }

    return new CommandsService(path);
  }

  /**
   * Initializes commands located at `path`
   * @param {String} path path to commands relative from ./src/commands
   */
  constructor(path) {
    this.#commandsDirectory = this.#commandsDirectory.concat(path);

    FileSystem.readdirSync(this.#commandsDirectory)
        .filter((file) => file.endsWith('.js'))
        .forEach((file) => {
          const command = require(`${RELATIVE_COMMANDS_PATH}${path}/${file}`);
          this.#commands.set(command.commandName.toUpperCase(), command);
        });
  }

  /**
   * Gets all commands
   * @return {Collection} commands
   */
  get commands() {
    return this.#commands;
  }

  /**
   * Gets command module from name
   * @param {String} commandName command
   * @return {Command} command from interaction
   */
  get(commandName) {
    return this.#commands.get(commandName.toUpperCase());
  }
}

module.exports = CommandsService;
