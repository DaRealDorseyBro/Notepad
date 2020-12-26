let { MessageEmbed } = require("discord.js"),
    pretty = require("pretty-ms"),
    dhms = require("dhms");
module.exports = {
    name: "remind",
    description: "Remind you to check a note!",
    type: "notes",
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