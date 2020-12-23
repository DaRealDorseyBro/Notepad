const {MessageEmbed} = require('discord.js');
const {stripIndents} = require('common-tags')
module.exports = {
    name: "help",
    description: "Help Screen!",
    type: 'other',
    aliases: ['commands'],
    cooldown: 2,
    usage: '[ command ]',
    execute(client, message, args, db) {
        let {commands} = message.client;

        if (!args.length) {
            return message.channel.send(new MessageEmbed()
                .setTitle('Help Screen!')
                .setDescription(stripIndents`Here are my categories:\n \`\`\`
                Notes\nOther\nCreator
                \`\`\``)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );
        }
        let command = commands.get(args[0].toLowerCase()) || commands.find((c) => c.ali && c.ali.includes(args[0].toLowerCase()));
        if (args[0] === 'notes') {
            return message.channel.send(new MessageEmbed()
                .setTitle('Note Commands')
                .setDescription(`Here are my commands in the \`notes\` category:\n\`${client.commands.filter(c => c.type === 'notes').map(c => c.name).join('`, `')}\``)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );
        } else if (args[0] === 'other') {
            return message.channel.send(new MessageEmbed()
                .setTitle('Note Commands')
                .setDescription(`Here are my commands in the \`other\` category:\n\`${client.commands.filter(c => c.type === 'other').map(c => c.name).join('`, `')}\``)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );
        }  else if (args[0] === 'creator') {
            return message.channel.send(new MessageEmbed()
                .setTitle('Note Commands')
                .setDescription(`Here are my commands in the \`creator\` category:\n\`${client.commands.filter(c => c.type === 'creator').map(c => c.name).join('`, `')}\``)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );
        } else if (command) {
            return message.channel.send('y')
        } else if (!command) {
            return message.channel.send('That command does not exist!')
        }
    }
}