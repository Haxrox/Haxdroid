const Command = require('./Command.js');
const { EmbedBuilder } = require('discord.js');

class Source extends Command {
    async Execute(interaction) {
        interaction.reply("https://github.com/Haxrox/Haxdroid");
    }
}

module.exports = new Source("Source", "Gets the bot source code");