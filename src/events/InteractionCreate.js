const ClientEvent = require('../core/ClientEvent.js');
const CommandsService = require('../services/CommandsService.js');

const NAME = 'InteractionCreate';
const ONCE = false;

/**
 * Emitted when an interaction is created
 */
class InteractionCreate extends ClientEvent {
  #commandsService = CommandsService.create();

  /**
   * Listener for the event
   * @param {BaseInteraction} interaction interaction that was created
   */
  async execute(interaction) {
    super.execute(interaction);
    const command = this.#commandsService.get(interaction.commandName);

    if (interaction.isCommand()) {
      if (command) {
        if (command.validate(interaction.member)) {
          command.execute(interaction);
        } else {
          command.error(interaction, 'Cannot execute command');
        }
      } else {
        interaction.reply('Command not ready');
      }
    } else if (interaction.isStringSelectMenu()) {
      const commandId = interaction.commandId;
      const index = commandId.indexOf('_');
      const command = index > -1 &&
        slashCommands.get(commandId.slice(0, index).toUpperCase());

      if (command) {
        command.executeSelectionMenu(interaction);
      } else {
        interaction.reply('Invalid menu');
      }
    } else if (interaction.isButton()) {
      const commandId = interaction.customId;
      const index = commandId.indexOf('_');
      const command = index > -1 &&
        slashCommands.get(commandId.slice(0, index).toUpperCase());

      if (command) {
        command.executeButton(interaction);
      } else {
        interaction.reply('Invalid button');
      }
    }
    // } else if (interaction.isButton()) {
    //     await command.ExecuteButton(interaction);
    // } else if (interaction.isContextMenu()) {
    //     await command.ExecuteContextMenu(interaction);
    // } else if (interaction.isSelectMenu()) {
    //     await command.ExecuteSelectMenu(interaction);
    // } else if (interaction.isUserContextMenu()) {
    //     await command.ExecuteUserContextMenu(interaction);
    // } else {
    //     await interaction.reply("Not a command");
    //     console.error("Error: not a command");
    // }
  }
}

module.exports = (client) => {
  return new InteractionCreate(client, NAME, ONCE);
};
