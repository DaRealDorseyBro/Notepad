const {MessageEmbed} = require('discord.js')
module.exports = {
    name: "addnote",
    description: "Create Notes!",
    type: 'notes',
    aliases: ['add', 'new'],
    cooldown: 5,
    usage: '< name > < text >',
    async execute(client, message, args, db) {
        let ownedNum = 0;
        await db.fetchEverything().forEach(obj => {
            if (obj.owner === message.author.id) ownedNum += 1
        })

        if (ownedNum >= 50) return message.channel.send('You already have over 50 notes, please delete some and then try again!')

        if (!args[0] || !args[1]) {
            return message.channel.send('Please add a some more text for the name and value of the note!')
        }

        let name = args[0].toLowerCase()
        let value = args.slice(1).join(' ')

        if (value.length > 1000) return message.channel.send('Please use a note that is less than 1000 characters!')
        if (name.length > 25) return message.channel.send('Please use a name that is less than 25 characters!')

        if (message.mentions.members.size >= 1) return message.channel.send('Please do not add any mentions in the note!')
        if (value.includes('```')) return message.channel.send('Please do note include \`\`\` in your note!')

        if (name === '--search' || name === '--editname' || name === '--editcoowner') return message.channel.send('You can\'t have that as a name!')

        message.channel.send(new MessageEmbed()
            .setTitle(`Adding Note \`${name}\`...`)
            .setDescription(`\`\`\`diff\n${value.split('\n').map((arr, i) => `${i + 1} | ${arr}`).join('\n')}\`\`\`\nSend the co-owner in chat (if you don't want a co-owner send "none")!`)
            .setColor(client.bot.color)
            .setTimestamp()
            .setFooter(client.bot.footer)
        ).then(async msg => {

            let filter = (m) => m.author.id === message.author.id;
            let collector = message.channel.createMessageCollector(filter, {max: 1, time: 30000})

            collector.on('collect', async collected => {
                // let errored;

                let coowner = collected.mentions.members.first() // || message.guild.members.fetch(collected.content).catch(e => errored = true)
                if (!collected.mentions.members.first() /* && isNaN(collected.content) */) coowner = {id:'`No One`'}
                // if (errored) coowner = {id:'`No One`'}

                // if (coowner.id !== '`No One`' && client.users.fetch(collected.content).bot) return message.channel.send('You can\'t add a bot as a co-owner!')
                if (coowner.id !== '`No One`' && collected.mentions.members.first().bot) return message.channel.send('You can\'t add a bot as a co-owner!')

                if (coowner.id !== '`No One`' && coowner.id === message.author.id) return message.channel.send('You can\'t add yourself as a co-owner!')

                let coownedNum = 0;
                await db.fetchEverything().forEach(obj => {
                    if (obj.coowner !== '`No One`' && obj.coowner === coowner.id) coownedNum += 1
                })

                if (coownedNum > 50) return message.channel.send('They already have over 50 notes, please ask them to delete some and then try again!')
                if (!db.get(`${message.author.id}_${name}`)) {
                    await db.set(`${message.author.id}_${name}`, {
                        type: 'note',
                        name: name,
                        value: value,
                        owner: message.author.id,
                        coowner: coowner.id,
                        timeAdded: Date.now()
                    })

                    if (message.guild.me.hasPermission('MANAGE_MESSAGES')) await collected.delete()

                    let embed = new MessageEmbed()
                        .setTitle('New Note: `' + name + '`!')
                        .setColor(client.bot.color)
                        .setTimestamp()
                        .setFooter(client.bot.footer)
                    if (coowner.id === '`No One`') embed.setDescription(`\`\`\`diff\n${await client.bot.changes('', value)}\`\`\`\nCo-Owner: ${coowner.id}`)
                    if (coowner.id !== '`No One`') embed.setDescription(`\`\`\`diff\n${await client.bot.changes('', value)}\`\`\`\nCo-Owner: <@${coowner.id}>`)

                    return msg.edit(embed);
                } else {
                    return message.channel.send("You already have a note with that name!")
                }
            })
        })
    }
}