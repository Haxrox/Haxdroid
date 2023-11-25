const {EmbedBuilder, hyperlink} = require('discord.js');

const Command = require('./Command.js');
const Git = require('../utils/Git.js');

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
      const branch = results[0].status === 'fulfilled' ?
        results[0].value : 'main';
      const revision = results[1].status === 'fulfilled' ?
        results[1].value : 'n/a';
      const remote = results[2].status === 'fulfilled' ?
        results[2].value : 'https://github.com/Haxrox/Haxdroid';

      interaction.editReply({embeds: [
        this.createEmbed(interaction, new EmbedBuilder()
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
                value: hyperlink(revision,
                    remote.concat('/commit/', revision),
                ),
              },
            ]),
        ),
      ]});
    });
  }
}

module.exports = new Source(
    'Source',
    'Gets the bot Git repository information',
);
