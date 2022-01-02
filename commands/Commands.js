const FileSystem = require('fs');
const {MessageEmbed} = require('discord.js');

const Command = require('./Command.js');

class Commands extends Command {
    commands = "";
    commandCount = 0;
    constructor(name, description) {
        super(name, description);
        FileSystem.readdirSync('./commands').filter(file => (file.endsWith('.js') && file != 'Command.js' && file != 'SlashCommand.js' && file != "Commands.js")).forEach(file => {
            const command = require(`../commands/${file}`);
            this.commandCount++;
            this.commands = this.commands.concat(`**${file.slice(0, file.length - 3)} - ** ${command.description}\n`);
        });
    }
    async Execute(interaction) {
        const embed = new MessageEmbed()
            // .setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL()})
            .setTitle(`List of commands [${this.commandCount}]`)
            .setDescription(this.commands)
            .setColor('#cacaca')
            .setTimestamp()
            .setFooter(`Requested by: ${interaction.user.username}`, interaction.user.avatarURL());
            // .setFooter({name: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
        await interaction.reply({embeds: [embed]});
    }
}

module.exports = new Commands("Commands", "Gets a list of commands");