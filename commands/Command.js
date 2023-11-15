const Styles = require('../styles.json');
const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = class Command {
  defaultPermission = true;
  /**
   * Class for commands executed by the user
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    this.commandName = name;
    this.description = description;
    this.data = new SlashCommandBuilder()
        .setName(name.toLowerCase())
        .setDescription(description);
  }

  /**
   * Gets the SlashCommandBuilder used to create this command
   * @return {SlashCommandBuiler} SlashCommandBuilder for this command
   */
  getData() {
    return this.data;
  }

  /**
   * Sets the permissions necessary to execute the command
   * @param {Array} permissions permissions array
   */
  setPermissions(permissions) {
    this.permissions = permissions;
  }

  /**
   * Returns whether the GuildMember has permissions to execute this command
   * @param {GuildMember} member member to check
   * @return {boolean} whether `member` can execute this command
   */
  validate(member) {
    return true;
  }

  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  execute(interaction) {
    console.debug(`${this.commandName} executed`);
  }

  /**
   * Executes the given button interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  executeButton(interaction) {
    console.debug(`${this.commandName} button executed`);
  }

  /**
   * Executes the given context menu interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  executeContextMenu(interaction) {
    console.debug(`${this.commandName} context menu executed`);
  }

  /**
   * Executes the given select menu interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  executeSelectMenu(interaction) {
    console.debug(`${this.commandName} select menu executed`);
  }

  /**
   * Executes the given user context menu interaction
   * @param {CommandInteraction} interaction interaction executed
   */
  executeUserContextMenu(interaction) {
    console.debug(`${this.commandName} user context menu executed`);
  }

  /**
   * Called when the command errors
   * @param {BaseInteraction} interaction interaction executed
   * @param {String} message error message
   */
  async error(interaction, message) {
    console.log(this.commandName + ' error: ' + message);
    const embed = new EmbedBuilder()
        .setTitle(`${this.commandName} Error`)
        .setDescription(`${Styles.Emojis.Error}  ${message}`)
        .setColor(Styles.Colours.Error)
        .setTimestamp()
        .setFooter({
          text: `Requested by: ${interaction.user.username}`,
          iconURL: interaction.user.avatarURL(),
        });
    await interaction.reply({embeds: [embed]});
  }

  /**
   * Called when the command errors and the reply needs to be deferred
   * @param {BaseInteraction} interaction interaction executed
   * @param {String} message error message
   */
  async deferError(interaction, message) {
    console.log(this.commandName + ' error: ' + message);
    const embed = new EmbedBuilder()
        .setTitle(`${this.commandName} Error`)
        .setDescription(`${Styles.Emojis.Error}  ${message}`)
        .setColor(Styles.Colours.Error)
        .setTimestamp()
        .setFooter({
          text: `Requested by: ${interaction.user.username}`,
          iconURL: interaction.user.avatarURL()},
        );
    await interaction.editReply({embeds: [embed]});
  }
};
