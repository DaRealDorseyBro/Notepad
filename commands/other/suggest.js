const {MessageEmbed, Util} = require('discord.js')
module.exports = {
    name: 'suggest',
    description: 'Make a suggestion!',
    type: 'other',
    cooldown: 10,
    async execute(client, message, args) {
        let suggestion = args.join(' ')

        if (!suggestion) return message.channel.send('Please add a suggestion!')

        let channel = await client.channels.fetch('794524856585814026')
        await message.channel.send("Your suggestion has been sent!")
        return channel.send(new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL({dynamic: true}))
            .setDescription(`\`\`\`\n${Util.escapeMarkdown(suggestion)}\`\`\``)
            .setColor(client.bot.color)
            .setTimestamp()
            .setFooter(client.bot.footer)
        )
    }
}