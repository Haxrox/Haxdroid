const CONSTANTS = {
    LOWER_CASE: "abcdefghijklmnopqrstuvwxyz",
    UPPER_CASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    DIGITS: "0123456789",
    SPECIAL: "!\"#$%&'*+,./:;=?@\\^`|~_-[]{}()<>",

    YOUTUBE_URL: "https://www.youtube.com/",
    YOUTUBE_VIDEO_URL: "https://www.youtube.com/watch",
    YOUTUBE_PLAYLIST_URL: "https://youtube.googleapis.com/youtube/v3/playlistItems",
    YOUTUBE_SEARCH_REULTS_URL: "https://www.youtube.com/results",
    YOUTUBE_SEARCH_URL: "https:/youtube.googleapis.com/youtube/v3/search",
    YOUTUBE_MUSIC_SEARCH_RESULT_URL: "https://music.youtube.com/search",

    GUILD_VOICE: 2
}

CONSTANTS.ALPHABET = CONSTANTS.LOWER_CASE + CONSTANTS.UPPER_CASE;
CONSTANTS.ALL = CONSTANTS.ALPHABET + CONSTANTS.DIGITS + CONSTANTS.SPECIAL;

module.exports = Object.freeze(CONSTANTS);