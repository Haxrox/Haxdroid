const Discord = require('discord.js');
const FileSystem = require('fs');
const ClientEvent = require('./ClientEvent.js');

const slashCommands = new Discord.Collection();
FileSystem.readdirSync('./commands')
    .filter((file) => (file != 'Command.js' && file != 'SlashCommand.js'))
    .forEach((file) => {
      let path = file;
      let command;
      if (file.endsWith('.js')) {
        command = require(`../commands/${file}`);
      } else {
        const commandFile = FileSystem.readdirSync(`./commands/${file}`)
            .filter((subFile) => subFile.endsWith('.js'))
            .find((subFile) =>
              subFile.toUpperCase()
                  .startsWith(file.toUpperCase(),
                  ),
            );
        command = require(`../commands/${file}/${commandFile}`);
        path = path.concat(`/${commandFile}`);
      }
      console.log(`Directory command loaded: %s [commands/%s]`,
          command.commandName,
          path,
      );
      slashCommands.set(command.commandName.toUpperCase(), command);
    });

/**
 * Emitted when an interaction is created
 */
class InteractionCreate extends ClientEvent {
  /**
   * Listener for the event
   * @param {BaseInteraction} interaction interaction that was created
   */
  async execute(interaction) {
    super.execute(interaction);

    if (interaction.isCommand()) {
      const command = slashCommands.get(interaction.commandName.toUpperCase());
      if (command) {
        if (command.validate(interaction.member)) {
          command.execute(interaction);
        } else {
          command.Error(interaction, 'Cannot execute command');
        }
      } else {
        interaction.reply('Command not ready');
      }
    } else if (interaction.isSelectMenu()) {
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
  return new InteractionCreate(client, 'InteractionCreate', false);
};
