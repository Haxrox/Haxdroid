const Discord = require('discord.js');
const FileSystem = require('fs');
const ClientEvent = require("./ClientEvent.js");

const slashCommands = new Discord.Collection();
FileSystem.readdirSync('./Commands').filter(file => (file.endsWith('.js') && file != 'Command.js' && file != 'SlashCommand.js' && file != "TemplateCommand.js")).forEach(file => {
    const command = require(`../Commands/${file}`);
    slashCommands.set(command.commandName, command);
});

class InteractionCreate extends ClientEvent {
    async Execute(interaction) {
        super.Execute();
        console.log(super.client);
        if (interaction.isCommand()) {
            const command = slashCommands.get(interaction.commandName);
            if (command) {
                await command.Execute(interaction);
            }
        }
    }
}

module.exports = new InteractionCreate("interactionCreate", false);