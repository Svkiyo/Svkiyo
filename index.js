const Discord = require('discord.js');
var request = require('request');
var cron = require('node-cron');
const bot = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

const prefix = process.env.PREFIX || "!";

const lundiMessageID = '864791655286571038';
const mardiMessageID = '864791662257635328';
const mercrediMessageID = '864791666505809920';
const jeudiMessageID = '864791669899264010';
const vendrediMessageID = '864791673720143882';
const samediMessageID = '864791677057892382';
const dimancheMessageID = '864791684328194048';
const emojiCheckedID = '862763914294591488';

bot.on('ready', () => {
  logChannel = bot.channels.cache.find(ch => ch.name === 'logs');
  promotionChannel = bot.channels.cache.find(ch => ch.name === 'promotions');
  planningChannel = bot.channels.cache.find(ch => ch.name === 'planning');
  playerChannel = bot.channels.cache.find(ch => ch.name === 'players');
  generalChannel = bot.channels.cache.find(ch => ch.name === 'general');

  console.log(`✔️  Bot started ${new Date().toLocaleString()}`);
  logChannel.send(`<:checked:862763914294591488> [${new Date().toLocaleString()}] BOT is online <:svkiyowhite:857946734940258344>`);
  bot.user.setActivity('svkiyo.com', { type: 'CUSTOM_STATUS' });
});

bot.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'youtube') {
    request("https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=UUtG-hcuS78qQDWzGYcP-6tQ&key=AIzaSyCSvTcIW4McNV_HQ4D0K4sIaUv8JYAeTlQ", function (error, response, body) {
      var json = JSON.parse(body);
      var videoId = json.items[0].snippet.resourceId.videoId;
      var base_url = "https://www.youtube.com/watch?v=";
      promotionChannel.send(base_url + videoId);
    });
  }

  message.delete();
});

bot.on('messageReactionAdd', async (reaction, user) => { // https://discordjs.guide/popular-topics/reactions.html#awaiting-reactions
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (error) {
      logChannel.send(`<:crossed:862763897928286268> [${new Date().toLocaleString()}] Erreur dans la récupération de message`);
      console.log(`❌ Something went wrong when fetching the message: ${new Date().toLocaleString()}`, error);
      return;
    }
  }

  // ----- Welcome message -----
  if (reaction.message.channel.name == 'rules') {
    if ((reaction.message.id == '856661239631314945') && (reaction._emoji.name == '✅')) {
      generalChannel.send(`Bienvenue sur le serveur de SVKIYO ${user}  👋`);
    }
  }

  // ----- Esport planner ------
  if (reaction.message.channel.name !== 'planning') return;

  // Other reactions is removed
  if (!reaction.message.content.startsWith('🗓️') || (reaction._emoji.id !== emojiCheckedID)) {
    reaction.users.remove(user);
    return;
  }

  // ----- Full -----
  if (reaction.message.reactions.cache.get(emojiCheckedID).count > 1) {
    user.send('❌ La session dont vous souhaitez vous inscrire est complète pour le moment, désolé');
    reaction.users.remove(user);
    return;
  }

  // ----- Participation -----
  let embedParticipation = new Discord.MessageEmbed()
    .setAuthor('Planificateur de session')
    .setTitle(`${new Date().toLocaleString()}`)
    .setDescription(`${user} **s'engage** à participer à la session \n\n${reaction.message.content}\n`)
    .setFooter('⚠️ Après 20:00, la veille de l\'évènement, votre participation est obligatoire')
    .setColor("#f9a926")
    .setThumbnail('https://svkiyo.com/wp-content/uploads/2021/07/svkiyo-hd.gif');

  user.send(embedParticipation);
  logChannel.send(`<:checked:862763914294591488> [${new Date().toLocaleString()}] ${user} ajoute sa participation ${reaction.message.content}`);
});

bot.on('messageReactionRemove', (reaction, user) => {
  // Other reactions is ignored
  if (reaction._emoji.id !== emojiCheckedID) return;

  const today = new Date();
  switch (reaction.message.id) {
    case lundiMessageID:
      if ((today.getDay() == 1) && (today.getHours() >= 20)) warnUser(reaction, user);
      break;
    case mardiMessageID:
      if ((today.getDay() == 2) && (today.getHours() >= 20)) warnUser(reaction, user);
      break;
    case mercrediMessageID:
      if ((today.getDay() == 3) && (today.getHours() >= 20)) warnUser(reaction, user);
      break;
    case jeudiMessageID:
      if ((today.getDay() == 4) && (today.getHours() >= 20)) warnUser(reaction, user);
      break;
    case vendrediMessageID:
      if ((today.getDay() == 5) && (today.getHours() >= 20)) warnUser(reaction, user);
      break;
    case samediMessageID:
      if ((today.getDay() == 6) && (today.getHours() >= 20)) warnUser(reaction, user);
      break;
    case dimancheMessageID:
      if ((today.getDay() == 0) && (today.getHours() >= 20)) warnUser(reaction, user);
      break;
  }

  function warnUser(reaction, user) {
    let embedParticipation = new Discord.MessageEmbed()
      .setAuthor('Planificateur de session')
      .setTitle(`${new Date().toLocaleString()}`)
      .setDescription(`🚫 ${user}, vous **ne pouvez pas** retirer votre participation après 20:00 la veille de la session. \n\n${reaction.message.content}\n`)
      .setFooter('Si vous ne pouvez pas participer, je vous prie de contactez un fondateur')
      .setColor("#FF0000")
      .setThumbnail('https://svkiyo.com/wp-content/uploads/2021/07/svkiyo-hd.gif');

    user.send(embedParticipation);
    logChannel.send(`<:crossed:862763897928286268> [${new Date().toLocaleString()}] ${user} retire sa participation ${reaction.message.content}`);
  }
});

cron.schedule('00 01 * * Mon', () => { // At 01:00 on Monday.
  logChannel.send(`📜  Reset of the week ${new Date().toLocaleString()}`);
  console.log('📜 Reset of the week')
  planningChannel.messages.fetch({ limit: 10 }).then(messages => {
    messages.forEach(message => {
      if (message.content.startsWith('🗓️')) {
        message.reactions.removeAll().catch(error => {
          logChannel.send(`<:crossed:862763897928286268> [${new Date().toLocaleString()}] Failed to clear reactions`);
          console.log(`❌ Failed to clear reactions ${new Date().toLocaleString()}`, error);
        });
      }
    });
  });
});

cron.schedule('00 12 * * Mon', () => { // At 12:00 on Monday.
  sessionRappel(lundiMessageID);
});

cron.schedule('00 12 * * Tue', () => { // At 12:00 on Tuesday.
  sessionRappel(mardiMessageID);
});

cron.schedule('58 14 * * Wed', () => { // At 12:00 on Wednesday.
  sessionRappel(mercrediMessageID);
});

cron.schedule('00 12 * * Thu', () => { // At 12:00 on Thursday.
  sessionRappel(jeudiMessageID);
});

cron.schedule('00 12 * * Fri', () => { // At 12:00 on Friday.
  sessionRappel(vendrediMessageID);
});

cron.schedule('00 12 * * Sat', () => { // At 12:00 on Saturday.
  sessionRappel(samediMessageID);
});

cron.schedule('00 12 * * Sun', () => { // At 12:00 on Sunday.
  sessionRappel(dimancheMessageID);
});

function sessionRappel(messageDayID) {
  let participants = '';
  planningChannel.messages.fetch(messageDayID).then(message => {
    message.reactions.cache.get(emojiCheckedID).users.fetch().then(users => {
      users.forEach(user => {
        participants += `\n<@${user.id}>`;
      });

      let embedParticipation = new Discord.MessageEmbed()
        .setAuthor('Rappel pour la session de ce soir')
        .setDescription(`Les joueurs qui sont inscrits pour la session sont ${participants}`)
        .setFooter('⚠️ Votre participation est obligatoire, des mesures seront prises en cas d\'absences/retards')
        .setColor("#008000")
        .setThumbnail('https://svkiyo.com/wp-content/uploads/2021/07/svkiyo-hd.gif');

      playerChannel.send(embedParticipation);
      logChannel.send(`🎯 [${new Date().toLocaleString()}] Rappel session ce soir pour ${participants.replace('\n', ' ')}`);

      users.forEach(user => {
        user.send(embedParticipation);
      })
    });
  });
}

bot.login(process.env.BOT_TOKEN);
