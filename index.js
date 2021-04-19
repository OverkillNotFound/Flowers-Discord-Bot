const Discord = require('discord.js');
const mysql = require('mysql')
const fs = require('fs');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });
const c = require('colors');

const fileUtils = require('./utils/fileUtils');

client.Discord = require('discord.js');
config = require('./config.js');

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.cmdDesc = new Discord.Collection();
client.category = new Discord.Collection();
client.params = new Discord.Collection();

var database = mysql.createConnection(config.database);

database.connect((err) => {
    if(err) {
        console.log(c.red(err))
        return;
    }
    
    console.log(c.green('[Database] Conectado com sucesso ao banco de dados ') + config.database.database + c.green(' em ') + config.database.host);
    start();
})

async function start() {
    console.log(c.green(`\n[${client.user.username}] Criando conexão com o Discord...`));
    client.login(config.token).then(
        console.log('[»] ' + c.yellow('Conectado com sucesso!'))
    )
    .catch((err) => {
        console.log('[»] ' + c.red('Não foi possível manter a conexão com o Discord, erro: \n[»] ' + err));
    });

}

function loadCommands(dir) {
    for(const dirInfo of fileUtils.searchByExtension(dir, 'js')) {
        const dirList = dirInfo.directory.split('/');
        dirList.shift();
        dirList.shift();
        const commandCategory = dirList.join('/');

        for(const file of dirInfo.files) {
            let cmd = require(file);
            if(!cmd.help) {
                continue;
            }

            client.commands.set(cmd.help.name, cmd);
            client.cmdDesc.set(cmd.help.name, cmd.help.desc);
            client.category.set(cmd.help.name, commandCategory);
            client.params.set(cmd.help.name, cmd.help.params)
            if(cmd.help.aliases) {
                cmd.help.aliases
                .filter(alias => alias.trim() !== '')
                .forEach(alias => client.aliases.set(alias, cmd.help.name));
            }
        }

        const formatedFiles = dirInfo.files.map(file => file.split('/').pop().split('.').shift())
        console.log('[»] ' + c.yellow('Foram carregados ') + dirInfo.files.length + c.yellow(' comandos na categoria ') + commandCategory + c.yellow('. [') + formatedFiles.join(c.yellow(', ')) + c.yellow(']'));
    }
}
function loadEvents(dir) {
    for(const dirInfo of fileUtils.searchByExtension(dir, 'js')) {
        for(const file of dirInfo.files) {
            let events = require(file);
            if(!Array.isArray(events)) {
                events = [events];
            }

            for(const event of events) {
                if(!event.name || !event.run) {
                    continue;
                }

                console.log(`[»] ` + c.yellow('O evento ') + event.name + c.yellow(' foi carregado!'));

                client.on(event.name, (...args) => event.run(client, ...args));
            }
        }
    }
}

module.exports = {
    database: database,
    client: client
}