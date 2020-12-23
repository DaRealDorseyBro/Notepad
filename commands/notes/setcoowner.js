const {MessageEmbed} = require('discord.js')
let cowner;
module.exports = {
    name: "setcoowner",
    description: "Set the co-owner of a note! Use \"none\" to set no one as the co-owner.",
    type: 'notes',
    aliases: ['setco'],
    cooldown: 3,
    usage: '< name > < mention | "none" >',
    async execute(client, message, args, db) {
        if (!args[0]) return message.channel.send('Please specify a note to set the co-owner of!')
        if (!await db.get(`${message.author.id}_${args[0].toLowerCase()}`)) return message.channel.send("You don't own a note with that name!")
        if (message.mentions.members.first()) cowner = message.mentions.members.first().id
        if (args[1] === 'none' || !args[1]) cowner = '`No One`'

        if (message.mentions.members.first()) {
            if (message.mentions.members.first().bot) return message.channel.send('You can\'t add a bot as a co-owner!')
            if (message.mentions.members.first().id === message.author.id) return message.channel.send('You can\'t add yourself as a co-owner!')
        }

        let obj = await db.get(`${message.author.id}_${args[0].toLowerCase()}`)
        await db.set(`${message.author.id}_${args[0].toLowerCase()}`, {name: obj.name, value: obj.value, owner: obj.owner, coowner: cowner})
        let embed = new MessageEmbed()
            .setTitle('Set Co-Owner Of: `' + args[0].toLowerCase() + '`')
            .setColor(client.bot.color)
            .setTimestamp()
            .setFooter(client.bot.footer)
            if (cowner === '`No One`') embed.setDescription(`New Co-Owner: ${cowner}`)
            if (cowner !== '`No One`') embed.setDescription(`New Co-Owner: <@${cowner}>`)
        return message.channel.send(embed)
    }
}