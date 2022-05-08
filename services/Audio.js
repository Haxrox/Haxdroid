const {
    AudioPlayerStatus,
    StreamType,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
} = require('@discordjs/voice');
const Axios = require('axios');
const { MessageEmbed, MessageActionRow, MessageButton, CommandInteraction, Client, VoiceChannel } = require('discord.js');
const { bold, hyperlink } = require('@discordjs/builders');
const Ytdl = require("ytdl-core");

const Config = require("../config.json");
const Styles = require("../styles.json");
const Constants = require("../constants.js");
const Random = require("../services/Random.js");
const Queue = require("../utils/Queue.js");

async function fetchPlaylists(id) {
    const url = new URL(Constants.YOUTUBE_PLAYLIST_URL)
    url.searchParams.append("key", Config.YOUTUBE_KEY)
    url.searchParams.append("part", "contentDetails");
    url.searchParams.append("playlistId", id);
    url.searchParams.append("maxResults", 25);
    const playlist = new Queue();
    const response = await Axios.get(url.href);
    var nextPage = "";
    do {
        url.searchParams.set("pageToken", nextPage || "");
        if (response.status) {
            const data = response?.data;
            nextPage = response?.nextPageToken;
            for (const video of data.items) {
                const videoUrl = new URL(Constants.YOUTUBE_VIDEO_URL);
                videoUrl.searchParams.append("v", video?.contentDetails?.videoId);
                const info = await Ytdl.getBasicInfo(videoUrl.href);
                const song = new Song(info, user, this.AutoPlay);
                playlist.Push(song);
            }
        }
    } while (nextPage != "" && nextPage);
    return playlist;
}
class Song {
    /**
     * Creates a Song object
     * @param {VideoDetails} info information about the song
     * @param {Client} user the client associated with this song
     * @param {boolean} autoplay whether autoplay was enabled when enqueuing the song
     */
    constructor(info, user, autoplay) {
        const videoDetails = info?.videoDetails;
        this.Title = videoDetails?.title || "Unknown";
        this.Url = videoDetails?.video_url || "Unknown";
        this.Artist = videoDetails?.author
        this.Length = videoDetails?.lengthSeconds;
        this.Thumbnail = videoDetails?.thumbnails[videoDetails?.thumbnails.length - 2]?.url;
        this.RelatedVideos = autoplay ? info?.related_videos : null;
        this.User = user || this.Client.user;
    }

    /**
     * Gets a MessageEmbed for the song
     * @returns a MessageEmbed that represents the song
     */
    Embed() {
        const padVal = (val) => val < 10 ? `0${val}` : val.toString();
        const parse = (val, pad, forceAppend) => pad ? padVal(val).concat(":") : ((val > 0 || forceAppend) ? val.toString().concat(":") : "");
        const seconds = this.Length % 60;
        const minutes = Math.floor(this.Length / 60) % 60;
        const hours = Math.floor(this.Length / 3600) % 24;
        const days = Math.floor(this.Length / (3600 * 24));

        const duration = parse(days, false) + parse(hours, days > 0) + parse(minutes, (hours > 0 || days > 0), true) + padVal(seconds);
        return new MessageEmbed()
            .setAuthor({ name: "YouTube", url: Constants.YOUTUBE_VIDEO_URL, iconURL: Styles.Icons.YouTube })
            .setTitle(`${Styles.Emojis.Music}  ${this.Title}`)
            .setURL(this.Url)
            .addField("Duration", duration, true)
            .addField("Artist", hyperlink(this.Artist.name, this.Artist.channel_url), true)
            .setImage(this.Thumbnail)
            .setColor(Styles.Colours.YouTube)
            .setTimestamp()
            .setFooter({ text: `Queued by: ${this.User?.username}`, iconURL: this.User?.avatarURL() });
    }
}

class Audio {
    ID = {
        MUSIC_PAUSE: "music_pause",
        MUSIC_SKIP: "music_skip",
        MUSIC_REPEAT: "music_repeat",
        MUSIC_AUTOPLAY: "music_autoplay",
        MUSIC_STOP: "music_stop"
    }
    STATES = {
        PLAY: "Play",
        STOP: "Stop",
        PAUSE: "Pause",
        DEAD: "Dead"
    }
    /**
     * Creates an Audio object
     * @param {CommandInteraction} interaction that initialized the music
     * @param {VoiceChannel} channel where the music is being played
     * @param {boolean} autoplay whether to keep playing the music when the queue is empty
     * @param {boolean} repeat whether to repeat the current song
     */
    constructor(interaction, channel, autoplay = true, repeat = false) {
        this.Client = interaction.client;
        this.Channel = channel;
        this.InitChannel = interaction.channel;

        this.Queue = new Queue();
        this.Connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guildId,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
        this.CurrentSong = "";
        this.Player = createAudioPlayer();
        this.State = this.STATES.STOP;
        this.AutoPlay = autoplay === null ? true : autoplay;
        this.Repeat = repeat === null ? false : repeat;

        this.Player.on(AudioPlayerStatus.Idle, this.Idle.bind(this));
        this.Player.on("error", this.Error.bind(this));
        this.Connection.on("error", this.Error.bind(this));
        this.Connection.subscribe(this.Player);

        (async () => {
            this.PlayerChannel = await interaction.guild.channels.fetch(Constants.MUSIC_PLAYER_CHANNEL_ID);
            this.HistoryChannel = await interaction.guild.channels.fetch(Constants.MUSIC_HISTORY_CHANNEL_ID);

            this.InitEmbed = new MessageEmbed()
                .setAuthor({ name: "YouTube", url: Constants.YOUTUBE_VIDEO_URL, iconURL: Styles.Icons.YouTube })
                .setTitle(`${Styles.Emojis.Music}  Music Initialized`)
                .setDescription(`${bold("Channel:")} <#${channel.id}>\n${bold("Autoplay:")} ${this.AutoPlay}\n${bold("Repeat:")} ${this.Repeat}`)
                .setColor(Styles.Colours.YouTube)
                .setTimestamp()
                .setFooter({ text: `Initialized by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });

            const reduce = this.Queue.Reduce((song) => `${Styles.Emojis.Bullet} ${hyperlink(song.Title, song.Url)} - ${hyperlink(song.Artist?.name, song.Artist?.channel_url)}\n`, "", 2048);
            this.QueueEmbed = new MessageEmbed()
                .setTitle(`${Styles.Emojis.Music}  Queue [${reduce[0]}/${this.Queue.Size || "0"}]`)
                .setDescription(this.Queue.Size > 0 ? reduce[1] : "Empty", true)
                .setColor(Styles.Colours.YouTube)
                .setTimestamp()

            this.PauseButton = new MessageButton()
                .setCustomId(this.ID.MUSIC_PAUSE)
                .setLabel('Pause')
                .setStyle('PRIMARY')
                .setEmoji(Styles.Emojis.Pause);
            this.ResumeButton = new MessageButton()
                .setCustomId(this.ID.MUSIC_PAUSE)
                .setLabel('Resume')
                .setStyle('PRIMARY')
                .setEmoji(Styles.Emojis.Play);
            this.SkipButton = new MessageButton()
                .setCustomId(this.ID.MUSIC_SKIP)
                .setLabel("Skip")
                .setStyle("PRIMARY")
                .setEmoji(Styles.Emojis.Skip);
            this.AutoPlayOnButton = new MessageButton()
                .setCustomId(this.ID.MUSIC_AUTOPLAY)
                .setLabel("AutoPlay")
                .setStyle("SUCCESS")
                .setEmoji(Styles.Emojis.AutoPlay);
            this.AutoPlayOffButton = new MessageButton()
                .setCustomId(this.ID.MUSIC_AUTOPLAY)
                .setLabel("AutoPlay")
                .setStyle("DANGER")
                .setEmoji(Styles.Emojis.AutoPlay);
            this.RepeatOnButton = new MessageButton()
                .setCustomId(this.ID.MUSIC_REPEAT)
                .setLabel("Repeat")
                .setStyle("SUCCESS")
                .setEmoji(Styles.Emojis.Repeat);
            this.RepeatOffButton = new MessageButton()
                .setCustomId(this.ID.MUSIC_REPEAT)
                .setLabel("Repeat")
                .setStyle("DANGER")
                .setEmoji(Styles.Emojis.Repeat);
            this.StopButton = new MessageButton()
                .setCustomId(this.ID.MUSIC_STOP)
                .setLabel("Stop")
                .setStyle("DANGER")
                .setEmoji(Styles.Emojis.Stop);

            this.Buttons = new MessageActionRow().addComponents(
                this.PauseButton, this.SkipButton, this.AutoPlay ? this.AutoPlayOnButton : this.AutoPlayOffButton,
                this.Repeat ? this.RepeatOnButton : this.RepeatOffButton, this.StopButton
            );

            this.Message = await this.PlayerChannel?.send({ embeds: [this.InitEmbed, this.QueueEmbed], components: [this.Buttons] });
        })();
    }

    /**
     * Updates the queue embed
     */
    UpdateQueue() {
        const reduce = this.Queue.Reduce((song) => `${Styles.Emojis.Bullet} ${hyperlink(song.Title, song.Url)} - ${hyperlink(song.Artist?.name, song.Artist?.channel_url)}\n`, "", 2048);
        this.QueueEmbed.setTitle(`${Styles.Emojis.Music}  Queue [${reduce[0]}/${this.Queue.Size || "0"}]`)
            .setDescription(this.Queue.Size > 0 ? reduce[1] : "Empty", true);
        this.Message?.edit({ embeds: [this.InitEmbed, this.CurrentSong.Embed(), this.QueueEmbed], components: [this.Buttons] });
    }

    /**
     * Updates a given audio setting
     * @param {CommandInteraction} interaction 
     * @param {*} setting the setting to modify
     * @param {*} value the value to set the setting to
     * @returns a MessageEmbed to be shown when changing the setting
     */
    UpdateSetting(interaction, setting, value) {
        if (this[setting] != undefined) {
            this[setting] = value;
            const embed = new MessageEmbed()
                .setAuthor({ name: "YouTube", url: Constants.YOUTUBE_VIDEO_URL, iconURL: Styles.Icons.YouTube })
                .setTitle(`${Styles.Emojis.Music}  Setting changed`)
                .setDescription(`${setting} set to ${bold(value)}`)
                .setColor(Styles.Colours.YouTube)
                .setTimestamp()
                .setFooter({ text: `Set by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });

            this.InitEmbed.setDescription(`${bold("Channel:")} <#${this.Channel.id}>\n${bold("Autoplay:")} ${this.AutoPlay}\n${bold("Repeat:")} ${this.Repeat}`)
            this.Message?.edit({ embeds: [this.InitEmbed, this.CurrentSong.Embed(), this.QueueEmbed], components: [this.Buttons] });
            this.HistoryChannel?.send({ embeds: [embed] });
            return embed;
        }
    }

    /**
     * Enqueue's the given song to the queue
     * @param {String} url of the youtube song
     * @param {Client} user the client that enqueued the song
     * @returns the song that was enqueued
     */
    async Enqueue(url, user) {
        if (Ytdl.validateURL(url)) {
            try {
                const info = await Ytdl.getBasicInfo(url);
                const song = new Song(info, user, this.AutoPlay);
                this.Queue.Push(song);
                if (this.CurrentSong) {
                    this.UpdateQueue();
                }
                return song;
            } catch (error) {
                return null;
            }
        } else {
            return (await this.EnqueuePlaylist(url, user)).Get();
        }
    }

    /**
     * Enqueue's the given playlist to the end of the queue
     * @param {String} id of the given playlist
     * @param {Client} user the user that enqueued the playlist
     * @returns the playlist
     */
    async EnqueuePlaylist(id, user) {
        try {
            const url = new URL(Constants.YOUTUBE_PLAYLIST_URL)
            url.searchParams.append("key", Config.YOUTUBE_KEY)
            url.searchParams.append("part", "contentDetails");
            url.searchParams.append("playlistId", id);
            url.searchParams.append("maxResults", 25);
            const playlist = new Queue();
            var nextPage = "";
            do {
                url.searchParams.set("pageToken", nextPage || "");
                const response = await Axios.get(url.href);
                if (response.status) {
                    const data = response?.data;
                    nextPage = response?.nextPageToken;
                    for (const video of data.items) {
                        const videoUrl = new URL(Constants.YOUTUBE_VIDEO_URL);
                        videoUrl.searchParams.append("v", video?.contentDetails?.videoId);
                        const info = await Ytdl.getBasicInfo(videoUrl.href);
                        const song = new Song(info, user, this.AutoPlay);
                        playlist.Push(song);
                    }
                }
            } while (nextPage != "" && nextPage);
            this.Queue.Concat(playlist);
            this.UpdateQueue();
            return playlist;
        } catch (error) {
            console.log(error.message);
        }
    }

    /**
     * Plays the given song
     * @param {String} url to the YouTube video
     * @param {Client} user that played the given song
     * @returns a MessageEmbed to be shown when playing the song
     */
    async Play(url, user) {
        if (Ytdl.validateURL(url)) {
            if (await this.Enqueue(url, user)) {
                return this.PlaySong();
            } else {
                return null;
            }
        } else {
            return await this.PlayPlaylist(url, user);
        }
    }

    /**
     * Play's the given playlist. Moves the playlist to the front of the queue
     * @param {String} id of the playlist
     * @param {Client} user the user that played the playlist
     * @returns the first song in the playlist
     */
    async PlayPlaylist(id, user) {
        const url = new URL(Constants.YOUTUBE_PLAYLIST_URL)
        url.searchParams.append("key", Config.YOUTUBE_KEY)
        url.searchParams.append("part", "contentDetails");
        url.searchParams.append("playlistId", id);
        url.searchParams.append("maxResults", 25);
        const playlist = new Queue();
        var nextPage = "";
        do {
            url.searchParams.set("pageToken", nextPage || "");
            const response = await Axios.get(url.href);
            if (response.status) {
                const data = response?.data;
                nextPage = response?.nextPageToken;
                for (const video of data.items) {
                    const videoUrl = new URL(Constants.YOUTUBE_VIDEO_URL);
                    videoUrl.searchParams.append("v", video?.contentDetails?.videoId);
                    const info = await Ytdl.getBasicInfo(videoUrl.href);
                    const song = new Song(info, user, this.AutoPlay);
                    playlist.Push(song);
                }
            }
        } while (nextPage != "" && nextPage);
        playlist.Concat(this.Queue);
        this.Queue = playlist;
        return this.PlaySong();
    }

    /**
     * Plays the next song in the queue, or repeats the current one (if this.Repeat === true)
     * @returns the current song that is playing
     */
    PlaySong() {
        if (!this.Repeat) {
            this.CurrentSong = this.Queue.Pop();
            this.State = this.STATES.PLAY;
            this.Client.user.setPresence({ activities: [{ name: `${this.CurrentSong.Title} by ${this.CurrentSong.Artist.name}`, type: "STREAMING", url: this.CurrentSong.Url }], status: "dnd" })
            this.UpdateQueue();
            this.HistoryChannel?.send({ embeds: [this.CurrentSong.Embed().setTitle(`${Styles.Emojis.Music}  ${this.CurrentSong.Title}`)] })
        }
        const stream = Ytdl(this.CurrentSong.Url, {
            fmt: "mp3",
            highWaterMark: 1 << 62,
            liveBuffer: 1 << 62,
            dlChunkSize: 0,
            bitrate: 128
        });
        this.Player.play(createAudioResource(stream, { inputType: StreamType.Arbitrary }));
        return this.CurrentSong;
    }

    /**
     * Skips the current song
     * @param {CommandInteraction} interaction the interaction used to skip the song
     * @returns a MessageEmbed to be shown when skipping the song
     */
    Skip(interaction) {
        const embed = new MessageEmbed()
            .setAuthor({ name: "YouTube", url: Constants.YOUTUBE_VIDEO_URL, iconURL: Styles.Icons.YouTube })
            .setTitle(`${Styles.Emojis.Skip}  Song Skipped`)
            .setDescription(`${hyperlink(this.CurrentSong.Title, this.CurrentSong.Url)}`)
            .setColor(Styles.Colours.YouTube)
            .setTimestamp()
            .setFooter({ text: `Skipped by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
        this.HistoryChannel?.send({ embeds: [embed] });

        const temp = this.Repeat;
        this.Repeat = false;
        this.Idle();
        this.Repeat = temp;

        return embed;
    }

    /**
     * Pauses the music
     * @param {CommandInteraction} interaction used to pause the music
     * @returns a MessageEmbed to be shown when pausing the music
     */
    Pause(interaction) {
        this.State = this.STATES.PAUSE;
        this.Player.pause();

        const embed = this.CurrentSong?.Embed()
            .setTitle(`${Styles.Emojis.Pause}  Music Paused: ${this.CurrentSong?.Title}`)
            .setFooter({ text: `Paused by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
        this.HistoryChannel?.send({ embeds: [embed] });

        return embed;
    }

    /**
     * Resumes the music
     * @param {CommandInteraction} interaction used to resume the music
     * @returns a MessageEmbed to be shown when resuming the music
     */
    Resume(interaction) {
        this.State = this.STATES.PLAY;
        this.Player.unpause();

        const embed = this.CurrentSong?.Embed()
            .setTitle(`${Styles.Emojis.Pause}  Music Resumed: ${this.CurrentSong?.Title}`)
            .setFooter({ text: `Resumed by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
        this.HistoryChannel?.send({ embeds: [embed] });

        return embed
    }

    /**
     * Stops the music and cleans any resources created
     * @param {CommandInteraction} interaction that was used to stop the music
     * @returns a MessageEmbed if an interaction to be shown when stopping the music
     */
    Stop(interaction) {
        this.CurrentSong = null;
        this.Channel = null;
        this.State = this.STATES.STOP;
        this.Message?.delete();
        this.Player.stop();
        this.Queue.Clear();
        this.Connection.destroy();

        if (interaction) {
            const embed = new MessageEmbed()
                .setAuthor({ name: "YouTube", url: Constants.YOUTUBE_VIDEO_URL, iconURL: Styles.Icons.YouTube })
                .setTitle(`${Styles.Emojis.Stop}  Music Stopped`)
                .setColor(Styles.Colours.YouTube)
                .setTimestamp()
                .setFooter({ text: `Stopped by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });

            this.HistoryChannel?.send({ embeds: [embed] });
            return embed;
        }
    }

    /**
     * Invoked when AudioPlayer turns idle, or skipping for the next song
     */
    Idle() {
        if ((this.Channel.members.size < 2 && this.State !== "Stopped" && this.Connection) || (this.Queue.Empty() && !this.AutoPlay)) {
            this.Stop();
        } else if (this.Queue.Empty() && this.AutoPlay && !this.Repeat) {
            const url = new URL(Constants.YOUTUBE_VIDEO_URL);
            url.searchParams.append("v", this.CurrentSong.RelatedVideos[Math.round(Random.Generate(0, this.CurrentSong.RelatedVideos.length / 2))].id);
            this.Play(url.href, this.Client.user);
        } else {
            this.PlaySong();
        }
    }

    /**
     * Called when this class errors
     * @param {*} error error that was thrown
     */
    Error(error) {
        console.error(error);
    }

}

module.exports = Audio