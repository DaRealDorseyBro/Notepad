const {MessageEmbed} = require('discord.js')
let pretty = require('pretty-ms')
const dhms = require('dhms')
module.exports = {
    name: "deletereminder",
    description: "Delete Reminders!",
    type: 'notes',
    cooldown: 5,
    usage: '< name >',
    async execute(client, message, args, db) {
        if (!args[0]) return message.channel.send('Please add the name of the note!')

        let name = args[0].toLowerCase()
        let reminder = await db.get(`remind_${message.author.id}_${name}`)

        if (!reminder) return message.channel.send('You don\'t have a reminder with that name!')

        await db.delete(`remind_${message.author.id}_${name}`)
        return message.channel.send(new MessageEmbed()
            .setTitle('Deleted Reminder: `' + name + '`')
            .setColor(client.bot.color)
            .setTimestamp()
            .setFooter(client.bot.footer)
        );

    }
}