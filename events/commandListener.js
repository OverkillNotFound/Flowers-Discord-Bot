const Discord = require('discord.js');
const index = require('../index.js');
const config = require('../config');

const cooldown = new Map();

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 */
async function onMessage(client, message) {
    if(message.author.bot || message.channel.type !== "text") {
        return;
    }

    if(message.content.startsWith(`<@!${client.user.id}>`)) {
        message.reply('o meu prefixo neste servidor é' + '`' + config.command.prefix + '`' +', para ver o que eu posso fazer use ' + '`' + config.command.prefix + 'ajuda` ' + 'no canal de comandos!');
    }

    if(!message.content.startsWith(config.command.prefix)) {
        return;
    }
    
    const args = message.content.split(' ');
    const cmd = args.shift();
    const database = await index.database;

    const command = getCommand(client, cmd);
    if(command) {
        if(cooldown.has(message.author.id)) {
            const timeSinceLastCommand = Date.now() - cooldown.get(message.author.id);
            if(timeSinceLastCommand < config.command.cooldown) {
                message
                    .reply(`Aguarde ${((config.command.cooldown - timeSinceLastCommand) / 1000).toFixed(2)} segundos para executar um novo comando.`)
                    .then(msg => msg.delete(5000));
                return;
            }
        }
        
        command.run(client, message, args, database);
    }
}

function getCommand(client, name) {
    name = name.slice(config.command.prefix.length);
    
    let command = client.commands.get(name);
    if (!command) {
        command = client.commands.get(client.aliases.get(name));
    }
    let desc = client.cmdDesc.get(name);
    return command;
}

module.exports = {
    name: 'message',
    run: onMessage
};
