const {
	AudioPlayerStatus,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
} = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
const { hyperlink } = require('@discordjs/builders');
const Ytdl = require("ytdl-core");
const Styles = require("../styles.json");
const Queue = require("../utils/Queue.js");

class Song {
    constructor(videoDetails, audio, user) {
        this.Audio = audio; 
        this.Title = videoDetails?.title || "Unknown";
        this.Url = videoDetails?.embed?.flashUrl || "Unknown";
        this.Artist = videoDetails?.author
        this.Length = videoDetails?.lengthSeconds;
        this.Thumbnail = videoDetails?.thumbnails[videoDetails?.thumbnails.length - 2]?.url;
        this.User = user || { username: "Haxdroid", avatarURL: () => Styles.Avatar};
    }

    Embed() {
        return new MessageEmbed()
            .setAuthor({name: "YouTube", url: "https://www.youtube.com/", iconURL: Styles.Icons.YouTube})
			.setTitle(`${Styles.Emojis.Play}  Now Playing: ${this.Title}`)
            .setURL(this.Url)
            .addField("Length", `${this.Length} seconds`, true)
            .addField("Artist", hyperlink(this.Artist.name, this.Artist.channel_url), true)
            .setImage(this.Thumbnail)
            .setColor(Styles.Colours.YouTube)
            .setTimestamp()
            .setFooter({text: `Queued by: ${this.User?.username}`, iconURL: this.User?.avatarURL()});
    }
}
class Audio {
    constructor(client, channel) {
        this.Client = client;
        this.Channel = channel;
        this.Queue = new Queue();
        this.Connection = joinVoiceChannel({
			channelId: channel.id,
			guildId: channel.guildId,
			adapterCreator: channel.guild.voiceAdapterCreator,
		});
        this.CurrentSong = "" 
        this.Player = createAudioPlayer();
        this.State = "Stopped"

        this.Player.on(AudioPlayerStatus.Idle, this.Idle.bind(this));
        this.Player.on("error", this.Error.bind(this));
        this.Connection.on("error", this.Error.bind(this));
        this.Connection.subscribe(this.Player);
    }

    async Enqueue(url, user) {
        if (Ytdl.validateURL(url)) {
            try {
                const stream = Ytdl(url, {
                    fmt: "mp3",
                    highWaterMark: 1 << 62,
                    liveBuffer: 1 << 62,
                    dlChunkSize: 0, //disabling chunking is recommended in discord bot
                    bitrate: 128
                });
                const info = await Ytdl.getBasicInfo(url);
                const song = new Song(info?.videoDetails, createAudioResource(stream, { inputType: StreamType.Arbitrary }), user);
                this.Queue.Push(song);
                return song;
            } catch (error) {
                return null;
            }
        } else {
            return null;
        }
    }

    async Play(url, user) {
        if (await this.Enqueue(url, user)) {
            return this.PlaySong();
        } else {
            return null;
        }
    }

    PlaySong() {
        this.CurrentSong = this.Queue.Pop();
        this.State = "Playing";
        this.Client.user.setPresence({activities: [{name: `${this.CurrentSong.Title} by ${this.CurrentSong.Artist.name}`, type: "LISTENING", url: this.CurrentSong.Url}], status: "dnd"})
        this.Player.play(this.CurrentSong.Audio);
        return this.CurrentSong;
    }

    Pause() {
        this.State = "Pause";
        this.Player.pause();
    }

    Resume() {
        this.State = "Playing";
        this.Player.unpause();
    }

    Stop() {
        this.State = "Stopped";
        this.Player.stop();
        this.Queue.Clear();
        this.Connection.destroy();
    }

    Idle() {
        if (this.Queue.Empty()) {
            if (this.State !== "Stopped" && this.Connection) {
                this.Stop();
            }   
        } else {
            this.PlaySong();
        }
    }

    Error() {
        console.log(error);
    }

}

module.exports = Audio