const {MessageEmbed} = require('discord.js')
const fetch = require('node-fetch')
const config = require('../../config.json')
module.exports = {
    name: "loopreminder",
    description: "Loop Reminders! *Vote Locked",
    type: 'notes',
    cooldown: 5,
    usage: '< name > < amount of loops >',
    async execute(client, message, args, db) {
        let voted = true;
        await fetch(`https://api.voidbots.net/bot/voted/${client.user.id}/${message.author.id}`, { headers: { 'Authorization': config.voidbots } }).then(res => res.json()).then(data => {
            if(data.voted === false) {
                return voted = false;
            }
        }).catch(console.error);
        if (voted === false) return message.channel.send(new MessageEmbed()
            .setTitle(`Vote Locked!`)
            .setDescription(`This command is vote locked, please vote on [VoidBots.net](https://voidbots.net/bot/790738491884568616) to unlock it!`)
            .setColor(client.bot.color)
            .setTimestamp()
            .setFooter(client.bot.footer)
        )

        if (!args[0]) return message.channel.send('Please add the name of the note!')
        if (!args[1]) return message.channel.send('Please add how many times you want to be reminded!')

        let name = args[0].toLowerCase()
        let time = args[1]

        if (isNaN(time)) return message.channel.send('Please make sure the amount is a number!')
        if (time <= 0) return message.channel.send('Please user a number that\'s more than 0!')
        if (time > 10) return message.channel.send('Please user a number that\'s less than 10!')

        let reminder = await db.get(`remind_${message.author.id}_${name}`)

        if (!reminder) return message.channel.send('You don\'t have a reminder with that name!')

        if (reminder.time < 1800000) return message.channel.send('The reminder time cannot be less that 30 minutes!')

        await db.set(`remind_${message.author.id}_${name}`, {
            type: reminder.type,
            trueOwner: reminder.trueOwner,
            channel: reminder.channel,
            owner: reminder.owner,
            name: reminder.name,
            time: reminder.time,
            now: reminder.now,
            times: time
        })
        return message.channel.send(new MessageEmbed()
            .setTitle('Looped Reminder: `' + name + '`')
            .setDescription(`\`\`\`diff\n${await client.bot.changes(reminder.times + " Times", time + " Times")}\`\`\``)
            .setColor(client.bot.color)
            .setTimestamp()
            .setFooter(client.bot.footer)
        );
    }
}