const Discord = require('discord.js');
const FileSystem = require('fs');
const ClientEvent = require("./ClientEvent.js");

const slashCommands = new Discord.Collection();
FileSystem.readdirSync('./Commands').filter(file => (file.endsWith('.js') && file != 'Command.js' && file != 'SlashCommand.js')).forEach(file => {
    const command = require(`../Commands/${file}`);
    slashCommands.set(command.commandName.toUpperCase(), command);
});

class InteractionCreate extends ClientEvent {
    async Execute(client, interaction) {
        super.Execute(client, interaction);
        if (interaction.isCommand()) {
            const command = slashCommands.get(interaction.commandName.toUpperCase());
            if (command) {
                await command.Execute(interaction);
            } else {
                console.log("Command not ready");
            }
        } else {
            console.log("Not a command");
        }
    }
}

module.exports = new InteractionCreate("interactionCreate", false);