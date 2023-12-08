const Axios = require('axios');
const {EmbedBuilder, bold, hyperlink} = require('discord.js');

const SlashCommand = require('../core/SlashCommand.js');
const Config = require('../configs/config.json');
const Styles = require('../configs/styles.json');
const Constants = require('../Constants.js');
const Audio = require('../services/AudioService.js');

const YOUTUBE = 'youtube';
const YOUTUBE_MUSIC = 'youtube_music';
let audio;

/**
 * Plays music in Discord Voice channel
 */
class Music extends SlashCommand {
  Subcommands = {
    init: async function(interaction) {
      await interaction.deferReply();
      const channel = interaction.options.getChannel('channel', true);
      const url = interaction.options.getString('song', true);
      audio = new Audio(
          interaction,
          channel,
          interaction.options.getBoolean('autoplay'),
          interaction.options.getBoolean('repeat'),
      );
      const song = await audio.play(url, interaction.user);

      if (song) {
        interaction.editReply({embeds: [audio.InitEmbed, song.embed()]});
      } else {
        this.deferError(interaction, 'Failed to parse YouTube URL - ' + url);
        audio.stop();
        audio = null;
      }
    },
    info: async function(interaction) {
      const reduce = audio?.Queue.reduce((song) => {
        const emoji = Styles.Emojis.Bullet;
        const formattedSong = hyperlink(song.Title, song.Url);
        const formattedArtist = hyperlink(
            song.Artist?.name,
            song.Artist?.channel_url,
        );
        `${emoji} ${formattedSong} - ${formattedArtist}\n`,
        '',
        1024;
      });
      const embed = new EmbedBuilder()
          .setAuthor({name: 'YouTube', url: 'https://www.youtube.com/', iconURL: Styles.Icons.YouTube})
          .setTitle(`${Styles.Emojis.Music}  Music Information`)
          .setDescription(`${bold('Current Song:')} ${hyperlink(audio?.CurrentSong?.Title || 'None', audio?.CurrentSong?.Url || 'https://www.youtube.com/')}\n${bold('Channel:')} <#${audio?.Channel?.id || 'None'}>\n${bold('Autoplay:')} ${audio?.AutoPlay || 'None'}`)
          .addFields(
              {
                name: `Queue [${reduce[0]}/${audio?.Queue.Size || '0'}]:`,
                value: audio?.Queue.Size > 0 ? reduce[1] : 'Empty',
                inline: true,
              },
          )
          .setColor(Styles.Colours.YouTube)
          .setTimestamp()
          .setFooter({
            text: `Requested by: ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL(),
          });

      interaction.reply({embeds: [embed]});
    },
    set: async function(interaction) {
      const autoplay = interaction.options.getBoolean('autoplay');
      const repeat = interaction.options.getBoolean('repeat');
      if (autoplay != undefined) {
        const embed = audio?.updateSetting(interaction, 'AutoPlay', autoplay);
        interaction.reply({embeds: [embed]});
      } else if (repeat != undefined) {
        const embed = audio?.updateSetting(interaction, 'Repeat', autoplay);
        interaction.reply({embeds: [embed]});
      } else {
        this.error(interaction, 'Invalid property');
      }
    },
    search: async function(interaction) {
      await interaction.deferReply();
      const query = interaction.options.getString('query', true);
      const embed = new EmbedBuilder()
          .setAuthor({name: 'YouTube', url: 'https://www.youtube.com/', iconURL: Styles.Icons.YouTube})
          .setTitle(`${Styles.Emojis.Music}  Search Results`)
          .setColor(Styles.Colours.YouTube)
          .setTimestamp()
          .setFooter({
            text: `Searched by: ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL(),
          });
      let url;

      switch (interaction.options.getString('provider', true)) {
        case YOUTUBE:
          const searchUrl = new URL(Constants.YOUTUBE_SEARCH_URL);
          searchUrl.searchParams.append('key', Config.YOUTUBE_KEY);
          searchUrl.searchParams.append('part', 'snippet');
          searchUrl.searchParams.append('maxResults', 10);
          searchUrl.searchParams.append('type', 'video');
          searchUrl.searchParams.append('q', query);

          url = new URL(Constants.YOUTUBE_SEARCH_REULTS_URL);
          url.searchParams.append('search_query', query);

          let results = '';
          let processed = 0;

          const response = await Axios.get(searchUrl.href);

          if (response.status) {
            response.data?.items?.some((song) => {
              const videoUrl = new URL(Constants.YOUTUBE_VIDEO_URL);
              const emoji = Styles.Emojis.Bullet;
              const formattedSong = hyperlink(
                  song.snippet?.title,
                  videoUrl.href,
              );
              const channel = song.snippet?.channelTitle;
              const append = `${emoji} ${formattedSong} - ${channel}\n`;

              videoUrl.searchParams.append('v', song.id?.videoId);

              if (results.length + append.length <= 2000) {
                processed++;
                results += append;
              } else {
                append += ` ${response.length - processed} more`;
              }

              return results.length > 2000;
            });
          }
          embed.setURL(url.href)
              .setDescription(response.status && results || 'None');
          break;
        case YOUTUBE_MUSIC:
          url = new URL(Constants.YOUTUBE_MUSIC_SEARCH_RESULT_URL);
          url.searchParams.append('q', query);

          embed.setURL(url.href)
              .setDescription(url.href);
          break;
        default:
          break;
      }

      interaction.editReply({embeds: [embed]});
    },
    enqueue: async function(interaction) {
      await interaction.deferReply();
      const url = interaction.options.getString('song', true);
      const song = await audio?.enqueue(url, interaction.user);

      if (song) {
        const embed = song.embed()
            .setTitle(`${Styles.Emojis.Play}  Queued Song: ${song.Title}`);
        interaction.editReply({embeds: [embed]});
      } else {
        this.error(interaction, 'Failed to parse YouTube URL - ' + song);
      }
    },
    dequeue: async function(interaction) {
      await interaction.deferReply();
      const position = interaction.options.getInteger('position', true);
      const song = audio?.dequeue(position, interaction.user);
      if (song) {
        const embed = song.embed()
            .setTitle('Dequeued Song: ' + song.Title);
        interaction.editReply({embeds: [embed]});
      } else {
        this.error(interaction, 'Invalid position');
      }
    },
    skip: async function(interaction) {
      const embed = audio?.skip(interaction);
      interaction.reply({embeds: [embed]});
    },
    pause: async function(interaction) {
      const embed = audio?.pause(interaction);
      interaction.reply({embeds: [embed]});
    },
    resume: async function(interaction) {
      const embed = audio?.resume(interaction);
      interaction.reply({embeds: [embed]});
    },
    stop: async function(interaction) {
      const embed = audio?.stop(interaction);
      interaction.reply({embeds: [embed]});
    },
    play: async function(interaction) {
      await interaction.deferReply();
      const url = interaction.options.getString('song', true);
      const song = await audio?.play(url, interaction.user);
      if (song) {
        const embed = song.embed()
            .setFooter({
              text: `Played by: ${interaction.user.username}`,
              iconURL: interaction.user.avatarURL(),
            });
        interaction.editReply({embeds: [embed]});
      } else {
        this.deferError(interaction, 'Failed to play song: ' + url);
      }
    },
  };
  /**
   * Class for commands executed by the user
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);
    for (const [key, func] of Object.entries(this.Subcommands)) {
      this.Subcommands[key] = func.bind(this);
    }
  }
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (this.Subcommands[subcommand]) {
      if (audio?.State !== audio?.STATES?.DEAD ||
        subcommand === 'init' ||
        subcommand === 'search') {
        this.Subcommands[subcommand](interaction);
      } else {
        this.error(interaction,
            // eslint-disable-next-line max-len
            'Music not initialized. Use the command:\n>>> **/music init `channel` `song` [autoplay] [repeat]** to initialize',
        );
      }
    } else {
      this.error(interaction, 'Invalid subcommand - ' + subcommand);
    }
  }
  /**
   * Executes the given button interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async executeButton(interaction) {
    switch (interaction.customId) {
      case audio?.ID.MUSIC_PAUSE:
        audio.State === audio?.STATES.PLAY ?
          audio.pause(interaction) : audio.resume(interaction);
        audio.Buttons.components[0] = audio.State === audio?.STATES.PLAY ?
          audio.PauseButton : audio.ResumeButton;
        break;
      case audio?.ID.MUSIC_SKIP:
        audio.skip(interaction);
        break;
      case audio?.ID.MUSIC_AUTOPLAY:
        audio.Buttons.components[2] = audio?.AutoPlay ?
          audio?.AutoPlayOnButton : audio?.AutoPlayOffButton;
        audio?.updateSetting(interaction, 'AutoPlay', !audio?.AutoPlay);
        break;
      case audio?.ID.MUSIC_REPEAT:
        audio.Buttons.components[3] = audio?.Repeat ?
          audio?.RepeatOnButton : audio?.RepeatOffButton;
        audio?.updateSetting(interaction, 'Repeat', !audio?.Repeat);
        break;
      case audio?.ID.MUSIC_STOP:
        audio.stop(interaction);
        break;
    }

    if (interaction.customId != audio?.ID.MUSIC_STOP) {
      audio?.updateQueue();
      interaction.update({
        embeds: [
          audio?.InitEmbed,
          audio?.CurrentSong?.embed(),
          audio?.QueueEmbed,
        ],
        components: [
          audio.Buttons,
        ],
      });
    }
  }
}

const MusicCommand = new Music('Music', 'Music player');
MusicCommand.getData()
    .addSubcommand((subcommand) =>
      subcommand.setName('init')
          .setDescription('Initializes the music player')
          .addChannelOption((option) =>
            option.setName('channel')
                .setDescription('Voice channel to join')
                .setRequired(true)
                .addChannelTypes(Constants.GUILD_VOICE),
          )
          .addStringOption((option) =>
            option.setName('song')
                .setDescription('Song to play')
                .setRequired(true),
          )
          .addBooleanOption((option) =>
            option.setName('autoplay')
                // eslint-disable-next-line max-len
                .setDescription('Whether to continue playing music once the queue is empty'),
          )
          .addBooleanOption((option) =>
            option.setName('repeat')
                .setDescription('Whether to repeat the currently playing song'),
          ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('info')
          .setDescription('Gets information about current music state'),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('search').setDescription('Searches for a song')
          .addStringOption((option) =>
            option.setName('provider')
                .setDescription('where to search for the song')
                .setRequired(true)
                .addChoices(
                    {name: 'YouTube', value: YOUTUBE},
                    {name: 'YouTube Music', value: YOUTUBE_MUSIC},
                ),
          )
          .addStringOption((option) =>
            option.setName('query')
                .setDescription('song to search for')
                .setRequired(true),
          ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('set')
          .setDescription('Set music configurations')
          .addBooleanOption((option) =>
            option.setName('autoplay')
                .setDescription('toggles autoplay'),
          )
          .addBooleanOption((option) =>
            option.setName('repeat')
                .setDescription('Whether to repeat the currently playing song'),
          ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('enqueue')
          .setDescription('Adds a song to the queue')
          .addStringOption((option) =>
            option.setName('song')
                .setDescription('song to queue')
                .setRequired(true),
          ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('dequeue')
          .setDescription('Removes a song from the queue')
          .addIntegerOption((option) =>
            option.setName('position')
                .setDescription('position in the queue')
                .setRequired(true),
          ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('skip')
          .setDescription('skips the current song'),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('pause')
          .setDescription('Pauses the music'),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('resume')
          .setDescription('Resumes the music'),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('stop')
          .setDescription('Stops the music and disconnects the bot'),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('play')
          .setDescription('Stops currently playing song and plays new song')
          .addStringOption((option) =>
            option.setName('song')
                .setDescription('Song to play')
                .setRequired(true),
          ),
    );

module.exports = MusicCommand;
