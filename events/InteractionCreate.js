const Discord = require('discord.js');
const FileSystem = require('fs');
const ClientEvent = require("./ClientEvent.js");

const slashCommands = new Discord.Collection();
FileSystem.readdirSync('./commands').filter(file => (file != 'Command.js' && file != 'SlashCommand.js')).forEach(file => {
    if (file.endsWith('.js')) {
        var command = require(`../commands/${file}`);
        console.log(`Command loaded: ${command.commandName} [commands/${file}]`);
    } else {
        var commandFile = FileSystem.readdirSync(`./commands/${file}`).filter(subFile => subFile.endsWith('.js')).find(subFile => subFile.toUpperCase().startsWith(file.toUpperCase()));
        var command = require(`../commands/${file}/${commandFile}`);
        console.log(`Directory command loaded: ${command.commandName} [commands/${file}/${commandFile}]`);
    }
    slashCommands.set(command.commandName.toUpperCase(), command);
});

class InteractionCreate extends ClientEvent {
    async Execute(interaction) {
        super.Execute(interaction);

        if (interaction.isCommand()) {
            const command = slashCommands.get(interaction.commandName.toUpperCase());
            if (command) {
                if (command.Validate(interaction.member)) {
                    command.Execute(interaction);
                } else {
                    command.Error(interaction, "Cannot execute command");
                }
            } else {
                interaction.reply("Command not ready");
            }
        } else if (interaction.isSelectMenu()) {
            const commandId = interaction.commandId;
            const index = commandId.indexOf("_");
            const command = index > -1 && slashCommands.get(commandId.slice(0, index).toUpperCase());
            if (command) {
                command.ExecuteSelectionMenu(interaction);
            } else {
                interaction.reply("Invalid menu");
            }
        } else if (interaction.isButton()) {
            const commandId = interaction.customId;
            const index = commandId.indexOf("_");
            const command = index > -1 && slashCommands.get(commandId.slice(0, index).toUpperCase());
            if (command) {
                command.ExecuteButton(interaction);
            } else {
                interaction.reply("Invalid button");
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
    return new InteractionCreate(client, "interactionCreate", false);
}