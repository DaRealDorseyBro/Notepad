const {MessageEmbed} = require('discord.js')
module.exports = {
    name: "deletenote",
    description: "Delete Notes!",
    type: 'notes',
    aliases: ['delete'],
    cooldown: 3,
    usage: '< name >',
    async execute(client, message, args, db) {
        if (!args[0]) return message.channel.send('Please specify a note to delete!')
        if (!await db.get(`${message.author.id}_${args[0].toLowerCase()}`)) return message.channel.send("You don't own a note with that name!")

        await db.delete(`${message.author.id}_${args[0].toLowerCase()}`)
        return message.channel.send(new MessageEmbed()
            .setTitle('Deleted Note: `' + args[0].toLowerCase() + '`')
            .setColor(client.bot.color)
            .setTimestamp()
            .setFooter(client.bot.footer)
        )
    }
}