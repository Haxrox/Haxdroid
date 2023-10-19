const { EmbedBuilder } = require('discord.js');
const ClientEvent = require("./ClientEvent.js");
const Config = require("../config.json");
const Styles = require("../styles.json");

class Error extends ClientEvent {
    constructor(client, eventName, once) {
        super(client, eventName, once);
        
        (async () => {
            this.guild = await this.client.guilds.fetch(Config.GUILD_ID);
            this.logChannel = await this.guild.channels.fetch(Config.LOGS_CHANNEL_ID);
        })();
    }

    Execute(error) {
        super.Execute(error);
        
        if (this.logChannel) {
            const embed = new EmbedBuilder()
                .setTitle("Bot Error")
                .setDescription(`${Styles.Emojis.Error}  ${error.message}`)
                .setColor(Styles.Colours.Error)
                .setTimestamp();
            
            this.logChannel.send({ embeds: [embed] });
        }
    }
}

module.exports = (client) => {
    return new Error(client, "Error", false);
}