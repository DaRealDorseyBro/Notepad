module.exports = {
    name: 'ping',
    description: 'Pong!',
    type: 'other',
    cooldown: 1,
    async execute(client, message, args) {
        //pong  lmaoooooo
        const Discord = require('discord.js')
        const now = Date.now()
        const embed = new Discord.MessageEmbed()
            .setTitle('Ponging <a:loadingBar:790746778131234826>\n')
        embed.setColor(client.bot.color)
            .setFooter(client.bot.footer)
        message.channel.send(embed)
            .then((msg) => {
                embed.setTitle('<:websocket:790744904845885483>-Websocket Ping: `' + client.ws.ping + `ms\`\n<:WumpusHelmat:790745092754374706>-Message Took: \`${Date.now() - now}ms\` to send`)
                setTimeout(() => {
                    msg.edit(embed)
                }, 150);
            });
    }
}