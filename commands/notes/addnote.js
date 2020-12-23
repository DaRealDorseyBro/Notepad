const {MessageEmbed} = require('discord.js')
let coowner;
module.exports = {
    name: "addnote",
    description: "Create Notes! Use `none` to set no one as the co-owner.",
    type: 'notes',
    aliases: ['add'],
    cooldown: 2,
    usage: '< name > < mention | "none" > < text >',
    async execute(client, message, args, db) {
        if (!args[0] || !args[1] || !args[2]) {
            return message.channel.send('Please add a some more text for the name and value of the note!')
        }

        if (args[0].length > 250) return message.channel.send('Please use a note that is less than 250 characters!')
        if (args[2].length > 25) return message.channel.send('Please use a name that is less than 25 characters!')
        let name = args[0].toLowerCase()
        if (message.mentions.members.first()) coowner = message.mentions.members.first().id
        if (args[1] === 'none') coowner = '`No One`';
        if (!args[1]) coowner = '`No One`';
        let value = args.slice(2).join(' ')

        if (message.mentions.members.size >= 1 && coowner === 'No One') return message.channel.send('Please do not add any mentions in the note!')
        if (message.mentions.members.size > 1 && coowner !== 'No One') return message.channel.send('Please do not add any mentions in the note!')

        if (!db.get(`${message.author.id}_${name}`)) {
            await db.set(`${message.author.id}_${name}`, {
                name: name,
                value: value,
                owner: message.author.id,
                coowner: coowner
            })
            let embed = new MessageEmbed()
                .setTitle('New Note: `' + name + '`')
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
                if (coowner === 'No One') embed.setDescription(`Note: \`${value}\`\nCo-Owner: ${coowner}`)
            if (coowner !== 'No One') embed.setDescription(`Note: \`${value}\`\nCo-Owner: <@${coowner}>`)

            return message.channel.send(embed);
        } else {
            return message.channel.send("You already have a note with that name!")
        }
    }
}