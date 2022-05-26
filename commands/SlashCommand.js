const { MessageEmbed } = require('discord.js');

module.exports = class Command {
    slash = false;
    permissionLevel = 5;
    /**
     * Abstract class for a command
     * @abstract
     * @constructor
     * @param {Client} client 
     * @param {Table} commandInfo 
     */
    constructor(client, commandInfo) {
        this.client = client;

        this.name = commandInfo.Name;
        this.description = commandInfo.Description;
    }

    /**
     * Mutates the datatype by enabling slash command
     * @returns a SlashCommandBuilder for the given SlashCommand
     */
    SetSlashData() {
        this.slash = true;
        this.data = new this.SlashCommandBuilder().setName(this.name).setDescription(this.description);
        return this.data;
    }

    SetSlashPermissions(permissions) {
        this.Permissions = permissions;
    }
    /**
     * Returns whether the GuildMember has permissions to execute this command
     * @param {GuildMember} member - guild member that sent the message
     */
    HasPermissions(member) {

    }

    /**
     * Executes the given command
     * @param {Message} message - the message that was sent
     */
    Execute(message) {

    }

    /**
     * Executes the given slash command
     * @param {Interaction} interaction 
     */
    ExecuteSlash(interaction) {

    }
}