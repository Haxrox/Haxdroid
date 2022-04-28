const {
	AudioPlayerStatus,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
} = require('@discordjs/voice');
const Ytdl = require("ytdl-core");
const Queue = require("../utils/Queue.js");

class Audio {
    constructor(channel) {
        this.Channel = channel
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

    Enqueue(url) {
        if (Ytdl.validateURL(url)) {
            const stream = Ytdl(url, {
                fmt: "mp3",
                highWaterMark: 1 << 62,
                liveBuffer: 1 << 62,
                dlChunkSize: 0, //disabling chunking is recommended in discord bot
                bitrate: 128
            });
            this.Queue.Push(createAudioResource(stream, { inputType: StreamType.Arbitrary }));
            return true;
        } else {
            return false;
        }
    }

    Play(url) {
        if (Ytdl.validateURL(url)) {
            this.CurrentSong = url;
            const stream = Ytdl(url, {
                fmt: "mp3",
                highWaterMark: 1 << 62,
                liveBuffer: 1 << 62,
                dlChunkSize: 0, //disabling chunking is recommended in discord bot
                bitrate: 128
            });
            this.State = "Playing";

            const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
            this.Player.play(resource);
            return true;
        } else {
            return false;
        }
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
            this.Player.play(this.Queue.Pop());
        }
        /*
        if () {
            this.Connection.destroy();
        }
        */
    }

    Error() {
        console.log(error);
    }

}

module.exports = Audio