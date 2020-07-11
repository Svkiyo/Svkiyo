const Discord = require('discord.js');
var request = require("request");
const bot = new Discord.Client();

const prefix = process.env.PREFIX || "!";

bot.on('ready', () => {
  logChannel = bot.channels.cache.find(ch => ch.name === 'logs');
  promotionChannel = bot.channels.cache.find(ch => ch.name === 'promotion');

  logChannel.send('S V K I Y O ~ Discord BOT is online !');
  bot.user.setActivity('@svkiyo', { type: 'CUSTOM_STATUS' });
});

bot.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();

  if (command === 'youtube') {
    request("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=UUtG-hcuS78qQDWzGYcP-6tQ&key=AIzaSyCSvTcIW4McNV_HQ4D0K4sIaUv8JYAeTlQ", function(error, response, body) {
        var json = JSON.parse(body);
        var videoId = json.items[0].snippet.resourceId.videoId;
        var base_url = "https://www.youtube.com/watch?v=";
        promotionChannel.send(base_url + videoId);
    });
  }

  message.delete();
});

bot.on('message', message => {
  const content = message.content.toLowerCase();
  if (message.channel.name == promotionChannel.name) {
    if (!(content.startsWith("http://www.youtube.com/") || content.startsWith("https://www.youtube.com/") || content.startsWith("https://youtu.be/") || content.startsWith("https://www.instagram.com/p/") || content.startsWith("http://www.instagram.com/p/"))) {
      message.delete();
    }
  }
});

client.login(process.env.BOT_TOKEN);