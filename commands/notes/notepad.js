const {MessageEmbed} = require('discord.js')
module.exports = {
    name: "notepad",
    description: "View your notes!",
    type: 'notes',
    aliases: ['pad'],
    cooldown: 2,
    usage: '[ --search | --coowned ] [ name ]',
    async execute(client, message, args, db) {
                    if (!args[0]) {
                        let data = []
                        let number = 1;
                        await db.fetchEverything().forEach(obj => {
                        if (obj.owner === message.author.id) {
                            data.push(number + ". `" + obj.name + "`")
                            number += 1;
                            }
                        })
                        if (!data.length >= 1) data.push('You have no notes!')

                        return message.channel.send(new MessageEmbed()
                            .setTitle('Your Notepad')
                            .setDescription(data.join('\n'))
                            .setColor(client.bot.color)
                            .setTimestamp()
                            .setFooter(client.bot.footer)
                        );
                    } else if (args[0] !== "--search" && args[0] !== "--coowned") {
                        let obj = await db.fetch(`${message.author.id}_${args[0].toLowerCase()}`)
                        if (!obj) return message.channel.send('You don\'t have a note with that name!')

                        let embed = new MessageEmbed()
                            .setColor(client.bot.color)
                            .setTimestamp()
                            .setFooter(client.bot.footer)
                            if (obj.coowner === '`No One`') embed.setDescription(`\`\`\`\n${obj.value}\`\`\`\nMain Owner: <@${obj.owner}>\nCo-Owner: ${obj.coowner}`)
                            if (obj.coowner !== '`No One`') embed.setDescription(`\`\`\`\n${obj.value}\`\`\`\nMain Owner: <@${obj.owner}>\nCo-Owner: <@${obj.coowner}>`)

                            return message.channel.send(embed);
                    } else if (args[0] === '--search' && !args[1]) {
                    if (!args[1]) return message.channel.send('You can\'t search with nothing!')
                    let data = []
                        await db.fetchEverything().forEach(obj => {
                        if (obj.owner === message.author.id && obj.name.startsWith( args[1])) {
                            data.push("`" + obj.name + "`")
                            }
                        })
                        
                        if (!data.length >= 1) data.push('You have no notes starting with `' + args[1] + "`!")
                        
                        return message.channel.send(new MessageEmbed()
                            .setTitle('Notes starting with `' + args[1] + '`')
                            .setDescription(data.join(', '))
                            .setColor(client.bot.color)
                            .setTimestamp()
                            .setFooter(client.bot.footer)
                        );
                    } else if (args[0] === '--coowned' && !args[1]) {
                        let data = []
                        let number = 1;
                        await db.fetchEverything().forEach(obj => {
                            if (obj.coowner === message.author.id) {
                                data.push(number + ". `" + obj.name + "`")
                                number += 1;
                            }
                        })

                        if (!data.length >= 1) data.push('You don\'t co-own any notes!')

                        return message.channel.send(new MessageEmbed()
                            .setTitle('Notes You Co-Own')
                            .setDescription(data.join(', '))
                            .setColor(client.bot.color)
                            .setTimestamp()
                            .setFooter(client.bot.footer)
                        );
                    } else if (args[0] === '--coowned' && args[1]) {
                        let obje;
                        await db.fetchEverything().forEach(obj => {
                            if (obj.coowner === message.author.id && obj.name === args[1].toLowerCase()) {
                                obje = obj;
                            }
                        })

                        if (!obje) data.push('You don\'t co-own a note with that name!')

                        return message.channel.send(new MessageEmbed()
                            .setColor(client.bot.color)
                            .setTimestamp()
                            .setFooter(client.bot.footer)
                            .setDescription(`\`\`\`\n${obje.value}\`\`\`\nMain Owner: <@${obje.owner}>\nCo-Owner: <@${obje.coowner}>`)
                        );
                    }
    }
}
