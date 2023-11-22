const {EmbedBuilder, hyperlink} = require('discord.js');

const Command = require('./Command.js');
const Git = require('../services/Git.js');
const Styles = require('../styles.json');

/**
 * Returns GitHub repo for bot
 */
class Source extends Command {
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    await interaction.deferReply();

    const git = new Git();

    Promise.allSettled([
      git.getBranch(),
      git.getRevision(),
      git.getRemote(),
    ]).then((results) => {
      const branch = results[0].value;
      const revision = results[1].value;
      const remote = results[2].value;

      const embed = new EmbedBuilder()
          .setTitle(`${interaction.client.user.username} Source`)
          .setURL(remote)
          .setThumbnail(interaction.client.user.avatarURL())
          .addFields([
            {
              name: 'Branch',
              value: hyperlink(branch, remote.concat('/tree/', branch)),
            },
            {
              name: 'Revision',
              value: hyperlink(revision, remote.concat('/commit/', revision)),
            },
          ])
          .setColor(Styles.Colours.Theme)
          .setTimestamp()
          .setFooter({
            text: `Requested by: ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL(),
          });
      interaction.editReply({embeds: [embed]});
    });
  }
}

module.exports = new Source('Source', 'Gets the bot source code');
