const ClientEvent = require("./ClientEvent.js");

class MessageCreate extends ClientEvent {
    Execute(message) {
        super.Execute(message);
        console.log(message.content);
    }
}

module.exports = (client) => {
    return new MessageCreate(client, "messageCreate", false);
}