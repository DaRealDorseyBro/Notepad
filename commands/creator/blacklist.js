const {MessageEmbed} = require('discord.js')
module.exports = {
    name: "blacklist",
    description: "Blacklist Users",
    type: "creator",
    aliases: ["bl"],
    cooldown: 0,
    ownerOnly: true,
    usage: "< mention > < reason >",
    async execute(client, message, args, db, blDb) {

        if (!message.mentions.members.first()) return message.channel.send('Please include a user to blacklist!')
        if (!args[1]) return message.channel.send('Please include a reason!')

        let mention = message.mentions.members.first()
        let reason = args.slice(1).join(' ')

        if (!await blDb.get(mention.id)) {

            await blDb.set(mention.id, {
                reason: reason
            })
            return message.channel.send(new MessageEmbed()
                .setTitle(`Blacklisted: \`${mention.user.tag}\``)
                .setDescription(`\`\`\`${reason}\`\`\``)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            )
        } else {
            await blDb.delete(mention.id)
            return message.channel.send(new MessageEmbed()
                .setTitle(`Unblacklisted: \`${mention.user.tag}\``)
                .setDescription(`\`\`\`${reason}\`\`\``)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            )
        }
    }
}