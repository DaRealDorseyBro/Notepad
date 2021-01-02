const {MessageEmbed} = require('discord.js')
module.exports = {
    name: 'afk',
    description: 'Set your afk status!',
    type: 'utility',
    usage: '[ text ]',
    async execute(client, message, args, kek, uwu, afkdb) {
        let reason = args.join(' ')
        if (!args[0]) reason = 'I\'m AFK right now!'

        await afkdb.set(`${message.author.id}`, {reason: reason, pings: 0, now: Date.now()})
        return message.channel.send(new MessageEmbed()
            .setTitle('AFK')
            .setDescription(`\`\`\`${reason}\`\`\``)
            .setColor(client.bot.color)
            .setTimestamp()
            .setFooter(client.bot.footer)
        )
    }
}