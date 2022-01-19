const {SlashCommandBuilder} = require("@discordjs/builders");
const {MessageEmbed} = require('discord.js');

module.exports = class Command {
    defaultPermission = true;
    /**
     * Abstract class for commands executed by the user
     * @abstract
     * @param {String} name name of the command
     * @param {String} description description of the command
     */
    constructor(name, description) {
        this.commandName = name;
        this.description = description;
        this.data = new SlashCommandBuilder().setName(name.toLowerCase()).setDescription(description);
    }

    /**
     * Gets the SlashCommandBuilder used to create this command
     * @returns a SlashCommandBuilder for this command
     */
    GetData() {
        return this.data;
    }

    /**
     * Sets the permissions necessary to execute the command
     * @param {Array} permissions a permissions array
     */
    SetPermissions(permissions) {
        this.permissions = permissions;
    }

    /**
     * Executes the given interaction / SlashCommand
     * @param {CommandInteraction} interaction 
     */
    Execute(interaction) {
        console.debug(`${this.commandName} executed`);
    }

    /**
     * Called when the command errors
     * @param {CommandInteraction} interaction 
     * @param {String} message error message
     */
    async Error(interaction, message) {
        console.log(this.commandName +  " error: " + message);
        const embed = new MessageEmbed() 
            .setTitle(`${this.commandName} Error`)
            .setDescription(`:octagonal_sign:  ${message}`)
            .setColor("#dd2e44")
            .setTimestamp()
            .setFooter({text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
        await interaction.reply({embeds: [embed]});
    }

    /**
     * Called when the command errors and the reply needs to be deferred
     * @param {CommandInteraction} interaction 
     * @param {String} message error message
     */
     async DeferError(interaction, message) {
        console.log(this.commandName + " error: " + message);
        const embed = new MessageEmbed() 
            .setTitle(`${this.commandName} Error`)
            .setDescription(`:octagonal_sign:  ${message}`)
            .setColor("#dd2e44")
            .setTimestamp()
            .setFooter({text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
        await interaction.editReply({embeds: [embed]});
    }
}