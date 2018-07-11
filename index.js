const Discord = require('discord.js');
const client = new Discord.Client();
var request = require("request");

client.login(process.env.BOT_TOKEN);

const prefix = process.env.PREFIX;

client.on('ready', () => {
  logChannel = client.channels.find('name', 'logs');
  promotionChannel = client.channels.find('name', 'promotion');
  sendLog('Svkiyo ~ Discord BOT is online !');
  client.user.setActivity(prefix + 'help');
});

client.on('message', message => {
  // ---------- general message ----------
  const content = message.content.toLowerCase();
  if (message.channel.name == promotionChannel.name) {
    if (!(content.startsWith("http://www.youtube.com/") || content.startsWith("https://www.youtube.com/") || content.startsWith("https://youtu.be/") || content.startsWith("https://www.instagram.com/p/") || content.startsWith("http://www.instagram.com/p/"))) {
      deleteMessage(message);
    }
  }

  // ---------- command message ---------
  if (!message.content.startsWith(prefix)) return;
  if (message.author.bot) return;

  const member = message.member;
  const args = message.content.split(' ').slice(1).join(" ");

  // ----------- !help -----------
  if (content.startsWith(prefix + 'help')) {
    message.author.send('\n**Commands lists**```Markdown\n'
        + prefix + 'help - Returns the list of available commands\n'
        + prefix + 'last - Get the lastest upload from YouTube SVKIYO.\n'
        + '```\nWe look forward to seeing you again', {
      file:"data/favicon.png"
    });
  } else if (content.startsWith(prefix + 'last')) {
    request("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=UUtG-hcuS78qQDWzGYcP-6tQ&key=AIzaSyCSvTcIW4McNV_HQ4D0K4sIaUv8JYAeTlQ", function(error, response, body) {
        var json = JSON.parse(body);
        var videoId = json.items[0].snippet.resourceId.videoId;
        var base_url = "https://www.youtube.com/watch?v=";
        sendPromotion(base_url + videoId);
    });
  }
  deleteMessage(message);
});

// --------- simple function ---------

function sendLog(message) {
  if ((message != null) && (message != '')){
    if (logChannel != null){
        logChannel.send(message);
    }
  }
}

function sendPromotion(message) {
  if ((message != null) && (message != '')){
    if (promotionChannel != null){
        promotionChannel.send(message);
    }
  }
}

function deleteMessage(message) {
  message.delete();
}
