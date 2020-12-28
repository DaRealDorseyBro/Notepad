const Discord = require('discord.js')
const fs = require('fs')
const commandFiles = fs.readdirSync('./commands/other').filter(file => file.endsWith('.js')).length + fs.readdirSync('./commands/notes').filter(file => file.endsWith('.js')).length + fs.readdirSync('./commands/creator').filter(file => file.endsWith('.js')).length
const os = require('os')
const cpuStat = require('cpu-stat')
const package = require('../../package.json')
module.exports = {
    name: 'botinfo',
    description: 'Shows info about Notepad!',
    type: 'utility',
    aliases: ['bi', 'stats'],
    execute(client, message, args) {

        function formatBytes (a,b){
            if (0 == a) return "0 Bytes";
            let c = 1024,
                d = b || 2,
                e = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
            f = Math.floor(Math.log(a) / Math.log(c));
            return parseFloat((a/ Math.pow(c,f)).toFixed(d)) + " " + e[f]
        }
        cpuStat.usagePercent(function (error, percent, seconds){
            if (error){
                return console.error(error)
            }

            const cores = os.cpus().length
            const cpuModel = os.cpus()[0].model
            const usage = formatBytes(process.memoryUsage().heapUsed)
            const Node = process.version
            const CPU = percent.toFixed(2)

            const moment = require("moment");
            require("moment-duration-format");
            const duration = moment.duration(client.uptime).format(" D [days], H [hours], m [minutes], s [seconds]");

            const embed = new Discord.MessageEmbed()
                .setTitle(`Notepads Info, Version: **${package.version}**`)
                .setDescription(`**Bot Info**\nServers: \`${client.guilds.cache.size}\`\nUsers: \`${client.users.cache.size}\`\nChannels: \`${client.channels.cache.size}\`\nEmojis: \`${client.emojis.cache.size}\`\n\n**Files and Coding Info**\nUptime: \`${duration}\`\nCommands: \`${commandFiles}\`\nCoded On: \`Discord.js v12 | Nodejs ${Node} | VSC\`\n\n**OS info**\nCPU: \`${cpuModel}\`\nCore(s): \`${cores}\`\nOS: \`Ubuntu 18.04.3 (LTS) x64\`\nCPU Usage: \`${CPU}\`\nRam Usage: \`${usage}\``)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            message.channel.send(embed)
        })
    }
}