const {
  AudioPlayerStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  demuxProbe,
} = require('@discordjs/voice');
const Axios = require('axios');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
} = require('discord.js');
const {bold, hyperlink} = require('@discordjs/builders');
const ytdl = require('ytdl-core');

const Config = require('../configs/config.json');
const Styles = require('../configs/styles.json');
const Constants = require('../Constants.js');
const Random = require('../utils/Random.js');
const Queue = require('../utils/Queue.js');
const Time = require('../utils/Time.js');

/**
 * Fetches songs from a playlist
 * @param {string} id id of the playlist
 * @return {Queue} playlist
 */
/* async function fetchPlaylists(id) {
  const url = new URL(Constants.YOUTUBE_PLAYLIST_URL);
  url.searchParams.append('key', Config.YOUTUBE_KEY);
  url.searchParams.append('part', 'contentDetails');
  url.searchParams.append('playlistId', id);
  url.searchParams.append('maxResults', 25);
  const playlist = new Queue();
  const response = await Axios.get(url.href);
  let nextPage = '';
  do {
    url.searchParams.set('pageToken', nextPage || '');
    if (response.status) {
      const data = response?.data;
      nextPage = response?.nextPageToken;
      for (const video of data.items) {
        const videoUrl = new URL(Constants.YOUTUBE_VIDEO_URL);
        videoUrl.searchParams.append('v', video?.contentDetails?.videoId);
        const info = await ytdl.getBasicInfo(videoUrl.href);
        const song = new Song(info, user, this.AutoPlay);
        playlist.push(song);
      }
    }
  } while (nextPage != '' && nextPage);
  return playlist;
} */
/**
 * Class that represents a song
 */
class Song {
  /**
   * Creates a Song object
   * @param {VideoDetails} info information about the song
   * @param {Client} user the client associated with this song
   * @param {boolean} autoplay toggles autoplay
   */
  constructor(info, user, autoplay) {
    const videoDetails = info?.videoDetails;
    const thumbnailLength = videoDetails?.thumbnails.length;
    this.Title = videoDetails?.title || 'Unknown';
    this.Url = videoDetails?.video_url || 'Unknown';
    this.Artist = videoDetails?.author;
    this.Length = videoDetails?.lengthSeconds;
    this.Thumbnail = videoDetails?.thumbnails[thumbnailLength - 2]?.url;
    this.RelatedVideos = autoplay && info?.related_videos != null &&
      info.related_videos.filter((video) =>
        parseInt(video.view_count) > Constants.VIDEO_THRESHOLD &&
      !video.title.toUpperCase().includes(this.Title.toUpperCase(),
      ));
    this.Views = parseInt(videoDetails?.viewCount);
    this.Likes = parseInt(videoDetails?.likes);
    this.User = user || this.Client.user;
  }

  /**
   * Gets a EmbedBuilder for the song
   * @return {EmbedBuilder} EmbedBuilder that displays the song
   */
  embed() {
    const duration = Time.secondsToDuration(this.Length);

    return new EmbedBuilder()
        .setAuthor({
          name: 'YouTube',
          url: Constants.YOUTUBE_VIDEO_URL,
          iconURL: Styles.Icons.YouTube,
        })
        .setTitle(`${Styles.Emojis.Music}  ${this.Title}`)
        .setURL(this.Url)
        .addFields({name: 'Duration', value: duration, inline: true},
            {
              name: 'Artist',
              value: hyperlink(this.Artist.name, this.Artist.channel_url),
              inline: true,
            },
            {
              name: '\u200b',
              value: '\u200b',
              inline: true,
            },
            {
              name: 'ViewCount',
              value: this.Views.toLocaleString('en-US') || '0',
              inline: true,
            },
            {
              name: 'Likes',
              value: this.Likes.toLocaleString('en-US') || '0',
              inline: true,
            },
            {
              name: 'Subscribers',
              // eslint-disable-next-line max-len
              value: this.Artist?.subscriber_count.toLocaleString('en-US') || '0',
              inline: true,
            },
        )
        .setImage(this.Thumbnail)
        .setColor(Styles.Colours.YouTube)
        .setTimestamp()
        .setFooter({
          text: `Queued by: ${this.User?.username}`,
          iconURL: this.User?.avatarURL(),
        });
  }

  /**
   * Gets a EmbedBuilder for the related videos
   * @return {EmbedBuilder} embed that represents the related videos
   */
  relatedEmbed() {
    return this.RelatedVideos != null && new EmbedBuilder()
        .setAuthor({
          name: 'YouTube',
          url: Constants.YOUTUBE_VIDEO_URL,
          iconURL: Styles.Icons.YouTube,
        })
        .setTitle(`${Styles.Emojis.Music}  ${this.Title} - Related Videos`)
        .setDescription(this.RelatedVideos.reduce((prev, song) => {
          const url = new URL(Constants.YOUTUBE_VIDEO_URL);
          url.searchParams.append('v', song.id);
          // eslint-disable-next-line max-len
          const appended = prev.concat(`${Styles.Emojis.Bullet} ${bold(hyperlink(song.title, url.href))} - ${hyperlink(song.author?.name, song.author?.channel_url)}\n`);

          if (appended.length > 1500) {
            return prev;
          } else {
            return appended;
          }
        }, ''))
        .setColor(Styles.Colours.YouTube)
        .setTimestamp();
  }
}

/**
 * Audio player class
 */
class Audio {
  ID = {
    MUSIC_PAUSE: 'music_pause',
    MUSIC_SKIP: 'music_skip',
    MUSIC_REPEAT: 'music_repeat',
    MUSIC_AUTOPLAY: 'music_autoplay',
    MUSIC_STOP: 'music_stop',
  };
  STATES = {
    PLAY: 'Play',
    STOP: 'Stop',
    PAUSE: 'Pause',
    DEAD: 'Dead',
  };
  /**
   * Creates an Audio object
   * @param {CommandInteraction} interaction that initialized the music
   * @param {VoiceChannel} channel where the music is being played
   * @param {boolean} autoplay whether to play music when the queue is empty
   * @param {boolean} repeat whether to repeat the current song
   */
  constructor(interaction, channel, autoplay = true, repeat = false) {
    this.Client = interaction.client;
    this.Channel = channel;
    this.InitChannel = interaction.channel;

    this.Queue = new Queue();

    this.Connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });
    this.CurrentSong = '';
    this.Player = createAudioPlayer();
    this.State = this.STATES.STOP;
    this.AutoPlay = autoplay === null ? true : autoplay;
    this.Repeat = repeat === null ? false : repeat;

    this.Player.on(AudioPlayerStatus.Idle, this.idle.bind(this));
    this.Player.on('error', this.error.bind(this));
    this.Connection.on('error', this.error.bind(this));
    this.Connection.subscribe(this.Player);

    (async () => {
      // eslint-disable-next-line max-len
      this.PlayerChannel = await interaction.guild.channels.fetch(Config.MUSIC_PLAYER_CHANNEL_ID);
      // eslint-disable-next-line max-len
      this.HistoryChannel = await interaction.guild.channels.fetch(Config.MUSIC_HISTORY_CHANNEL_ID);

      this.InitEmbed = new EmbedBuilder()
          .setAuthor({
            name: 'YouTube',
            url: Constants.YOUTUBE_VIDEO_URL,
            iconURL: Styles.Icons.YouTube,
          })
          .setTitle(`${Styles.Emojis.Music}  Music Initialized`)
          // eslint-disable-next-line max-len
          .setDescription(`${bold('Channel:')} <#${channel.id}>\n${bold('Autoplay:')} ${this.AutoPlay}\n${bold('Repeat:')} ${this.Repeat}`)
          .setColor(Styles.Colours.YouTube)
          .setTimestamp()
          .setFooter({
            text: `Initialized by: ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL(),
          });

      const reduce = this.Queue.reduce((song) =>
        // eslint-disable-next-line max-len
        `${Styles.Emojis.Bullet} ${bold(hyperlink(song.Title, song.Url))} - ${hyperlink(song.Artist?.name, song.Artist?.channel_url)}\n`, '', 2048,
      );
      this.QueueEmbed = new EmbedBuilder()
          // eslint-disable-next-line max-len
          .setTitle(`${Styles.Emojis.Music}  Queue [${reduce[0]}/${this.Queue.Size || '0'}]`)
          .setDescription(this.Queue.Size > 0 ? reduce[1] : 'Empty', true)
          .setColor(Styles.Colours.YouTube)
          .setTimestamp();

      this.PauseButton = new ButtonBuilder()
          .setCustomId(this.ID.MUSIC_PAUSE)
          .setLabel('Pause')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(Styles.Emojis.Pause);
      this.ResumeButton = new ButtonBuilder()
          .setCustomId(this.ID.MUSIC_PAUSE)
          .setLabel('Resume')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(Styles.Emojis.Play);
      this.SkipButton = new ButtonBuilder()
          .setCustomId(this.ID.MUSIC_SKIP)
          .setLabel('Skip')
          .setStyle(ButtonStyle.Primary)
          .setEmoji(Styles.Emojis.Skip);
      this.AutoPlayOnButton = new ButtonBuilder()
          .setCustomId(this.ID.MUSIC_AUTOPLAY)
          .setLabel('AutoPlay')
          .setStyle(ButtonStyle.Success)
          .setEmoji(Styles.Emojis.AutoPlay);
      this.AutoPlayOffButton = new ButtonBuilder()
          .setCustomId(this.ID.MUSIC_AUTOPLAY)
          .setLabel('AutoPlay')
          .setStyle(ButtonStyle.Danger)
          .setEmoji(Styles.Emojis.AutoPlay);
      this.RepeatOnButton = new ButtonBuilder()
          .setCustomId(this.ID.MUSIC_REPEAT)
          .setLabel('Repeat')
          .setStyle(ButtonStyle.Success)
          .setEmoji(Styles.Emojis.Repeat);
      this.RepeatOffButton = new ButtonBuilder()
          .setCustomId(this.ID.MUSIC_REPEAT)
          .setLabel('Repeat')
          .setStyle(ButtonStyle.Danger)
          .setEmoji(Styles.Emojis.Repeat);
      this.StopButton = new ButtonBuilder()
          .setCustomId(this.ID.MUSIC_STOP)
          .setLabel('Stop')
          .setStyle(ButtonStyle.Danger)
          .setEmoji(Styles.Emojis.Stop);

      this.Buttons = new ActionRowBuilder().addComponents(
          this.PauseButton, this.SkipButton,
          this.AutoPlay ? this.AutoPlayOnButton : this.AutoPlayOffButton,
          this.Repeat ? this.RepeatOnButton : this.RepeatOffButton,
          this.StopButton,
      );

      this.Message = await this.PlayerChannel?.send({
        embeds: [this.InitEmbed, this.QueueEmbed],
        components: [this.Buttons],
      });
    })();
  }

  /**
     * Updates the queue embed
     */
  updateQueue() {
    const reduce = this.Queue.reduce((song, position) =>
      // eslint-disable-next-line max-len
      `${position + 1}. ${bold(hyperlink(song.Title, song.Url))} - ${hyperlink(song.Artist?.name, song.Artist?.channel_url)}\n`, '', 2048,
    );
    this.QueueEmbed
        // eslint-disable-next-line max-len
        .setTitle(`${Styles.Emojis.Music}  Queue [${reduce[0]}/${this.Queue.Size || '0'}]`)
        .setDescription(this.Queue.Size > 0 ? reduce[1] : 'Empty', true);
    this.Message?.edit({
      embeds: [this.InitEmbed, this.CurrentSong.embed(),
        this.Queue.Size > 0 ? this.QueueEmbed :
          this.CurrentSong.relatedEmbed(),
      ],
      components: [this.Buttons],
    });
  }

  /**
   * Updates a given audio setting
   * @param {CommandInteraction} interaction
   * @param {string} setting the setting to modify
   * @param {string} value the value to set the setting to
   * @return {EmbedBuilder} a EmbedBuilder to be shown when changing the setting
   */
  updateSetting(interaction, setting, value) {
    if (this[setting] != undefined) {
      this[setting] = value;
      const embed = new EmbedBuilder()
          .setAuthor({
            name: 'YouTube',
            url: Constants.YOUTUBE_VIDEO_URL,
            iconURL: Styles.Icons.YouTube,
          })
          .setTitle(`${Styles.Emojis.Music}  Setting changed`)
          .setDescription(`${setting} set to ${bold(value)}`)
          .setColor(Styles.Colours.YouTube)
          .setTimestamp()
          .setFooter({
            text: `Set by: ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL(),
          });

      this.Buttons = new ActionRowBuilder().addComponents(
          this.PauseButton, this.SkipButton,
          this.AutoPlay ? this.AutoPlayOnButton : this.AutoPlayOffButton,
          this.Repeat ? this.RepeatOnButton : this.RepeatOffButton,
          this.StopButton,
      );

      // eslint-disable-next-line max-len
      this.InitEmbed.setDescription(`${bold('Channel:')} <#${this.Channel.id}>\n${bold('Autoplay:')} ${this.AutoPlay}\n${bold('Repeat:')} ${this.Repeat}`);
      this.Message?.edit({
        embeds: [this.InitEmbed, this.CurrentSong.embed(),
          this.Queue.Size > 0 ? this.QueueEmbed :
            this.CurrentSong.relatedEmbed(),
        ],
        components: [this.Buttons],
      });
      this.HistoryChannel?.send({embeds: [embed]});
      return embed;
    }
  }

  /**
   * Enqueue's the given song to the queue
   * @param {String} url of the youtube song
   * @param {Client} user the client that enqueued the song
   * @return {Song} the song that was enqueued
   */
  async enqueue(url, user) {
    if (ytdl.validateURL(url)) {
      try {
        const info = await ytdl.getBasicInfo(url);
        const song = new Song(info, user, this.AutoPlay);
        this.Queue.push(song);
        if (this.CurrentSong) {
          this.updateQueue();
        }
        return song;
      } catch (error) {
        return null;
      }
    } else {
      return (await this.enqueuePlaylist(url, user)).get();
    }
  }

  /**
   * Dequeue's the given song to the queue
   * @param {Number} index index in the queue to remove
   * @return {Song} the song that was enqueued
   */
  dequeue(index) {
    const song = (index > 0 && index <= this.Queue.Size) ?
      this.Queue.remove(index - 1) : null;
    if (song) {
      this.updateQueue();
    }
    return song;
  }
  /**
   * Enqueue's the given playlist to the end of the queue
   * @param {String} id of the given playlist
   * @param {Client} user the user that enqueued the playlist
   * @return {Queue} the playlist
     */
  async enqueuePlaylist(id, user) {
    try {
      const url = new URL(Constants.YOUTUBE_PLAYLIST_URL);
      url.searchParams.append('key', Config.YOUTUBE_KEY);
      url.searchParams.append('part', 'contentDetails');
      url.searchParams.append('playlistId', id);
      url.searchParams.append('maxResults', 25);
      const playlist = new Queue();
      let nextPage = '';
      do {
        url.searchParams.set('pageToken', nextPage || '');
        const response = await Axios.get(url.href);
        if (response.status) {
          const data = response?.data;
          nextPage = response?.nextPageToken;
          for (const video of data.items) {
            const videoUrl = new URL(Constants.YOUTUBE_VIDEO_URL);
            videoUrl.searchParams.append('v', video?.contentDetails?.videoId);
            const info = await ytdl.getBasicInfo(videoUrl.href);
            const song = new Song(info, user, this.AutoPlay);
            playlist.push(song);
          }
        }
      } while (nextPage != '' && nextPage);
      this.Queue.concat(playlist);
      this.updateQueue();
      return playlist;
    } catch (error) {
      console.log(error.message);
    }
  }

  /**
   * Plays the given song
   * @param {String} url to the YouTube video
   * @param {Client} user that played the given song
   * @return {EmbedBuilder} embed that shows the currently playing the song
   */
  async play(url, user) {
    if (ytdl.validateURL(url)) {
      if (await this.enqueue(url, user)) {
        return this.playSong();
      } else {
        return null;
      }
    } else {
      return await this.playPlaylist(url, user);
    }
  }

  /**
   * Play's the given playlist. Moves the playlist to the front of the queue
   * @param {String} id of the playlist
   * @param {Client} user the user that played the playlist
   * @return {Song} first song in the playlist
     */
  async playPlaylist(id, user) {
    const url = new URL(Constants.YOUTUBE_PLAYLIST_URL);
    url.searchParams.append('key', Config.YOUTUBE_KEY);
    url.searchParams.append('part', 'contentDetails');
    url.searchParams.append('playlistId', id);
    url.searchParams.append('maxResults', 25);
    const playlist = new Queue();
    let nextPage = '';
    do {
      url.searchParams.set('pageToken', nextPage || '');
      const response = await Axios.get(url.href);
      if (response.status) {
        const data = response?.data;
        nextPage = response?.nextPageToken;
        for (const video of data.items) { // TODO: make this async
          const videoUrl = new URL(Constants.YOUTUBE_VIDEO_URL);
          videoUrl.searchParams.append('v', video?.contentDetails?.videoId);
          const info = await ytdl.getBasicInfo(videoUrl.href);
          const song = new Song(info, user, this.AutoPlay);
          playlist.push(song);
        }
      }
    } while (nextPage != '' && nextPage);
    playlist.concat(this.Queue);
    this.Queue = playlist;
    return this.playSong();
  }

  /**
   * Plays the next song in the queue, or repeats the current one
   * (if this.Repeat === true)
   * @return {Song} the current song that is playing
   */
  async playSong() {
    if (!this.Repeat) {
      this.CurrentSong = this.Queue.pop();
      this.State = this.STATES.PLAY;
      this.Client.user.setPresence({
        activities: [{
          name: `${this.CurrentSong.Title} by ${this.CurrentSong.Artist.name}`,
          type: 'STREAMING',
          url: this.CurrentSong.Url,
        }],
        status: 'dnd',
      });
      this.updateQueue();
      this.HistoryChannel?.send({
        embeds: [this.CurrentSong.embed()
            .setTitle(`${Styles.Emojis.Music}  ${this.CurrentSong.Title}`),
        ],
      });
    }

    const readableStream = ytdl(this.CurrentSong.Url, {
      quality: 'highestaudio',
      filter: 'audioonly',
      liveBuffer: 40000,
      highWaterMark: 1 << 30,
    });

    const {stream, type} = await demuxProbe(readableStream);
    this.Player.play(createAudioResource(stream, {
      inputType: type,
    }));

    return this.CurrentSong;
  }

  /**
   * Skips the current song
   * @param {CommandInteraction} interaction interaction used to skip the song
   * @return {EmbedBuilder} embed to be shown when skipping the song
   */
  skip(interaction) {
    const embed = new EmbedBuilder()
        .setAuthor({
          name: 'YouTube',
          url: Constants.YOUTUBE_VIDEO_URL,
          iconURL: Styles.Icons.YouTube,
        })
        .setTitle(`${Styles.Emojis.Skip}  Song Skipped`)
        .setDescription(hyperlink(this.CurrentSong.Title, this.CurrentSong.Url))
        .setColor(Styles.Colours.YouTube)
        .setTimestamp()
        .setFooter({
          text: `Skipped by: ${interaction.user.username}`,
          iconURL: interaction.user.avatarURL(),
        });
    this.HistoryChannel?.send({embeds: [embed]});

    const temp = this.Repeat;
    this.Repeat = false;
    this.idle();
    this.Repeat = temp;

    return embed;
  }

  /**
   * Pauses the music
   * @param {CommandInteraction} interaction used to pause the music
   * @return {EmbedBuilder} embed shown when pausing the music
   */
  pause(interaction) {
    this.State = this.STATES.PAUSE;
    this.Player.pause();

    const embed = this.CurrentSong?.embed()
        // eslint-disable-next-line max-len
        .setTitle(`${Styles.Emojis.Pause}  Music Paused: ${this.CurrentSong?.Title}`)
        .setFooter({
          text: `Paused by: ${interaction.user.username}`,
          iconURL: interaction.user.avatarURL(),
        });
    this.HistoryChannel?.send({embeds: [embed]});

    return embed;
  }

  /**
   * Resumes the music
   * @param {CommandInteraction} interaction used to resume the music
   * @return {EmbedBuilder} embed to be shown when resuming the music
   */
  resume(interaction) {
    this.State = this.STATES.PLAY;
    this.Player.unpause();

    const embed = this.CurrentSong?.embed()
        // eslint-disable-next-line max-len
        .setTitle(`${Styles.Emojis.Pause}  Music Resumed: ${this.CurrentSong?.Title}`)
        .setFooter({
          text: `Resumed by: ${interaction.user.username}`,
          iconURL: interaction.user.avatarURL(),
        });
    this.HistoryChannel?.send({embeds: [embed]});

    return embed;
  }

  /**
   * Stops the music and cleans any resources created
   * @param {CommandInteraction} interaction that was used to stop the music
   * @return {EmbedBuilder} if an interaction is shown when stopping the music
   */
  stop(interaction) {
    this.CurrentSong = null;
    this.Channel = null;
    this.State = this.STATES.STOP;
    this.Message?.delete();
    this.Player.stop();
    this.Queue.clear();
    this.Connection.destroy();

    if (interaction) {
      const embed = new EmbedBuilder()
          .setAuthor({
            name: 'YouTube',
            url: Constants.YOUTUBE_VIDEO_URL,
            iconURL: Styles.Icons.YouTube,
          })
          .setTitle(`${Styles.Emojis.Stop}  Music Stopped`)
          .setColor(Styles.Colours.YouTube)
          .setTimestamp()
          .setFooter({
            text: `Stopped by: ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL(),
          });

      this.HistoryChannel?.send({embeds: [embed]});
      return embed;
    }
  }

  /**
   * Invoked when AudioPlayer turns idle, or skipping for the next song
   */
  idle() {
    if ((this.Channel.members.size < 2 &&
      this.State !== 'Stopped' && this.Connection) ||
      (this.Queue.empty() && !this.AutoPlay)) {
      this.stop();
    } else if (this.Queue.empty() && this.AutoPlay && !this.Repeat) {
      const url = new URL(Constants.YOUTUBE_VIDEO_URL);
      // implement fuzzy search w/ video title
      // eslint-disable-next-line max-len
      // const filtered = this.CurrentSong.RelatedVideos.filter((video) => parseInt(video.view_count) > Constants.VIDEO_THRESHOLD && !video.title.toUpperCase().includes(this.CurrentSong.Title.toUpperCase()));
      // eslint-disable-next-line max-len
      // var song = filtered.length / 4 > 0 ? filtered[Math.round(Random.Generate(0, filtered.length / 4))] : this.CurrentSong.RelatedVideos[Math.round(Random.Generate(0, this.CurrentSong.RelatedVideos.length / 4))];
      const song = this.CurrentSong.RelatedVideos.length / 4 > 0 ?
                this.CurrentSong.RelatedVideos[Math.round(
                    Random.generate(0, this.CurrentSong.RelatedVideos.length/4),
                )] :
                this.CurrentSong.RelatedVideos[Math.round(
                    Random.generate(0, this.CurrentSong.RelatedVideos.length),
                )];
      url.searchParams.append('v', song.id);
      this.play(url.href, this.Client.user);
    } else {
      this.playSong();
    }
  }

  /**
   * Called when this class errors
   * @param {*} error error that was thrown
   */
  error(error) {
    console.error(error);
  }
}

module.exports = Audio;
