const {MessageEmbed} = require('discord.js')
let pretty = require('pretty-ms')
const dhms = require('dhms')
module.exports = {
    name: "remind",
    description: "Remind you to check a note!",
    type: 'notes',
    cooldown: 5,
    usage: '< name > < time >',
    async execute(client, message, args, db) {
        if (!args[0]) return message.channel.send('Please add the name of the note!')
        if (!args[1]) return message.channel.send('Please add when you want to be reminded (Ex: `3d`)!')

        let name = args[0].toLowerCase()
        let time = dhms(args.slice(1).join(' ').toLowerCase())

        if (time > 2073600000) return message.channel.send('Please use a time that\'s under `24` days!')
        if (time <= 0) return message.channel.send('Please use a valid time!')

        let coowner = false
        let noteowner;
        db.fetchEverything().forEach(c => {
            if (c.coowner === message.author.id && c.name === name) {
                coowner = true
                noteowner = c.owner
            }
        })
        if (!await db.get(`${message.author.id}_${name}`) && coowner === false) return message.channel.send('You don\'t own/co-own a note with that name!')
        if (await db.get(`remind_${message.author.id}_${name}`)) return message.channel.send('You already have a reminder set for that name!')
        if (coowner === false) noteowner = message.author.id

        await db.set(`remind_${message.author.id}_${name}`, {
            type: 'reminder',
            trueOwner: noteowner,
            channel: message.channel.id,
            owner: message.author.id,
            name: name,
            time: time,
            now: Date.now(),
            times: 1
        })
        return message.channel.send(new MessageEmbed()
            .setTitle('Reminder: `' + name + '`')
            .setDescription(`I will remind you in \`\`\`\n${pretty(time)}\`\`\``)
            .setColor(client.bot.color)
            .setTimestamp(Date.now() + time)
            .setFooter(client.bot.footer)
        );
    }
}