import ClientModule from '../../intefaces/ClientModule';
import ClientCommand from '../../intefaces/ClientCommand';

import sftp from 'sftp-async';
import { Client as FTPClient } from 'basic-ftp';
import { existsSync, mkdirSync, readdirSync } from 'fs';

import settings from './settings.json';

export default {
    name: settings.name,
    author: settings.author,
    version: settings.version,
    description: settings.description,

    requires: {
        core: settings.requires.core
    },

    init: async(client) => {
        const FTP = new FTPClient();
        const SFTP = sftp;

        client.registerFeature('FTP', FTP);
        client.registerFeature('SFTP', SFTP);
        
        if(!existsSync(`${__dirname}/cache`)) mkdirSync(`${__dirname}/cache`);
    },
    
    initCommands: async(client) => {
        const moduleCommands = readdirSync(`${__dirname}/commands`);

        moduleCommands.forEach(commandName => {
            const moduleCommand: ClientCommand = require(`${__dirname}/commands/${commandName}`).default;

            if(!client.commands.get(moduleCommand?.name)) client.commands.set(moduleCommand.name, moduleCommand);
        })
    }
} as ClientModule;