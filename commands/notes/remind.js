let { MessageEmbed } = require("discord.js"),
  pretty = require("pretty-ms"),
  dhms = require("dhms");
module.exports = {
  name: "remind",
  description: "Remind you to check a note!",
  type: "notes",
  aliases: ['remindme'],
  cooldown: 5,
  usage: "< name > < time >",
  async execute(client, message, args, db) {
    if (!args[0] || !args[1])
      return message.channel.send(
        "Either the value of the reminder or the time for the reminder was not found or found invalid to format time make sure you do something like 3d"
      );
    let name = args[0].toLowerCase(),
      time = dhms(
        args
          .slice(1)
          .join(" ")
          .toLowerCase()
      ),
      dball = db.fetchEverything(),
      coowner = false,
      noteowner;
    if (time > 2073600000 || time <= 0)
      return message.channel.send(
        "Please use a valid time which is less then 24 days"
      );

    let reminders = dball.filter(
      t => t.type === "reminder" && t.owner === message.author.id
    );
    if (reminders.length >= 10)
      return message.channel.send("You already have 10 reminders!");
    await db.fetchEverything().forEach(c => {
      if (
        c.type === "note" &&
        c.coowner === message.author.id &&
        c.name === name
      ) {
        coowner = true;
        noteowner = c.owner;
      }
    });
    if (!(await db.get(`${message.author.id}_${name}`)) && coowner === false)
      return message.channel.send(
        "You don't own/co-own a note with that name!"
      );
    if (await db.get(`remind_${message.author.id}_${name}`))
      return message.channel.send(
        "You already have a reminder set for that name!"
      );
    if (coowner === false) noteowner = message.author.id;

    await db.set(`remind_${message.author.id}_${name}`, {
      type: "reminder",
      trueOwner: noteowner,
      channel: message.channel.id,
      owner: message.author.id,
      name: name,
      time: time,
      now: Date.now(),
      times: 1
    });
    let v = await db.get(`remind_${message.author.id}_${name}`)
    let currentTimeout;
    currentTimeout = setTimeout(async() => {
      if (v.times < 2) await db.delete(`remind_${v.owner}_${v.name}`)
      if (v.times > 1) await db.set(`remind_${v.owner}_${v.name}`, {
        type: v.type,
        trueOwner: v.trueOwner,
        channel: v.channel,
        owner: v.owner,
        name: v.name,
        time: v.time,
        now: Date.now(),
        times: v.times - 1
      })
      let channel = client.channels.cache.get(v.channel)
      if (!await db.get(`${v.trueOwner}_${v.name}`)) return channel.send(`<@${v.owner}>, You were supposed to be reminder but the note was corrupted!`)
      await channel.send(`<@${v.owner}>,`, new MessageEmbed()
          .setTitle('Reminder: `' + v.name + '`')
          .setDescription(`\`\`\`\n${await db.get(`${v.trueOwner}_${v.name}`).value}\`\`\``)
          .setColor(client.bot.color)
          .setTimestamp(v.now)
          .setFooter(client.bot.footer)
      );
      await client.reminders.delete(`${v.owner}_${v.name}`)
      if (v.times > 1) return require('../../index').setReminders(await db.get(`remind_${v.owner}_${v.name}`))
    }, v.time - (Date.now() - v.now))
    await client.reminders.set(`${v.owner}_${v.name}`, currentTimeout)
    return message.channel.send(
      new MessageEmbed()
        .setTitle("Reminder: `" + name + "`")
        .setDescription(`I will remind you in \`\`\`\n${pretty(time)}\`\`\``)
        .setColor(client.bot.color)
        .setTimestamp(Date.now() + time)
        .setFooter(client.bot.footer)
    );
  }
};
