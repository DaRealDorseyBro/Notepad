module.exports = {
    name: "restart",
    description: "Restart the Bot",
    type: "creator",
    aliases: ["res", 'reboot'],
    cooldown: 0,
    ownerOnly: true,
    async execute(client, message, args) {
        await message.channel.send("Restarting...")
        return process.exit()
    }
}