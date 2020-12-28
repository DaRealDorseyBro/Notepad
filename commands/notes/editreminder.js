const {MessageEmbed} = require('discord.js')
let pretty = require('pretty-ms')
const dhms = require('dhms')
module.exports = {
    name: "editreminder",
    description: "Edit Reminders!",
    type: 'notes',
    cooldown: 5,
    usage: '< name > < time >',
    async execute(client, message, args, db) {
        if (!args[0]) return message.channel.send('Please add the name of the note!')
        if (!args[1]) return message.channel.send('Please add when you want to be reminded (Ex: `3d`)!')

        let name = args[0].toLowerCase()
        let time = dhms(args.slice(1).join(' ').toLowerCase())
        let reminder = await db.get(`remind_${message.author.id}_${name}`)

        if (time > 2073600000) return message.channel.send('Please use a time that\'s under `24` days!')
        if (time <= 0) return message.channel.send('Please use a valid time!')

        if (!reminder) return message.channel.send('You don\'t have a reminder with that name!')

        await db.set(`remind_${message.author.id}_${name}`, {
            type: reminder.type,
            trueOwner: reminder.trueOwner,
            channel: reminder.channel,
            owner: reminder.owner,
            name: reminder.name,
            time: time,
            now: Date.now(),
            times: reminder.times
        })
        return message.channel.send(new MessageEmbed()
            .setTitle('Edited Reminder: `' + name + '`')
            .setDescription(`\`\`\`diff\n- | ${pretty(reminder.time)} Time Left\n+ | ${pretty(time)} Time Left\`\`\``)
            .setColor(client.bot.color)
            .setTimestamp(Date.now() + time)
            .setFooter(client.bot.footer)
        );

    }
}