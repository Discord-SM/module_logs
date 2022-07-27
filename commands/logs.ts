import ClientCommand from '../../../intefaces/ClientCommand';

import { writeFileSync } from 'fs';
import { Client as FTPClient } from 'basic-ftp';
import { ApplicationCommandOptionType, AttachmentBuilder } from 'discord.js';

import settings from '../settings.json';
import phrases from '../translations.json';
import config from '../../../configs/client.config.json';

export default {
    name: 'logs',
    description: phrases[config.defaultLocale].info,
    cooldown: '10s',
    onlyAdmins: true,
    onlyOwners: true,

    options: [
        {
            name: 'server',
            type: ApplicationCommandOptionType.String,
            description: 'Server Name',
            required: true,

            choices: settings.ftps
        },

        {
            name: 'log',
            type: ApplicationCommandOptionType.String,
            description: 'Log Name',
            required: true,

            choices: settings.logs
        }
    ],

    run: async(client, command) => {
        const serverFTP = command.options.get('server')?.value as string;
        const serverLog = command.options.get('log')?.value as string;

        const ftpData = serverFTP.split('|');
        const directoryData = serverLog.split('|');

        const ftpType = ftpData[0] as 'ftp' | 'sftp';
        const rootType = ftpData[1] as 'root' | 'nonRoot';
        const rootPath = ftpData[2];
        const ftpHost = ftpData[3];
        const ftpPort = Number(ftpData[4]);
        const ftpUser = ftpData[5];
        const ftpPass = ftpData[6];

        const directoryPath = directoryData[0];
        const fileName = directoryData[1];
        const filePath = `./${rootType === 'root' ? `${rootPath}/` : ''}${directoryPath}`;

        if(ftpType === 'ftp') {
            const FTP: FTPClient = client.getFeature('FTP');
            
            FTP.access({ host: ftpHost, port: ftpPort, user: ftpUser, password: ftpPass }).then(connectData => {
                FTP.downloadTo(`${__dirname.replace('/commands', '')}/cache/${fileName}`, filePath).then(downloadData => {
                    const attachment = new AttachmentBuilder(`${__dirname.replace('/commands', '')}/cache/${fileName}`);

                    return command.reply({ content: `Log Path: ${filePath}`, files: [attachment] });
                }).catch((error: Error) => {
                    const failGetFile = client.managers.utils.buildEmbed({ description: phrases[config.defaultLocale].failGetFile.replace('{path}', filePath) }, null);

                    return command.reply({ embeds: [failGetFile] });
                })
            }).catch((error: Error) => {
                const failConnect = client.managers.utils.buildEmbed({ description: phrases[config.defaultLocale].failConnect }, null);

                return command.reply({ embeds: [failConnect] });
            })
        }

        if(ftpType === 'sftp') {
            const SFTP = client.getFeature('SFTP');

            SFTP.connect(ftpHost, ftpPort, ftpUser, ftpPass).then((connectData: any) => {
                SFTP.getFileData(filePath).then((downloadData: any) => {
                    writeFileSync(`${__dirname.replace('/commands', '')}/cache/${fileName}`, downloadData, { encoding: 'utf-8' });

                    const attachment = new AttachmentBuilder(`${__dirname.replace('/commands', '')}/cache/${fileName}`);

                    return command.reply({ content: `Log Path: ${filePath}`, files: [attachment] })
                }).catch((error: Error) => {
                    const failGetFile = client.managers.utils.buildEmbed({ description: phrases[config.defaultLocale].failGetFile.replace('{path}', filePath) }, null);

                    return command.reply({ embeds: [failGetFile] });
                })
            }).catch((error: Error) => {
                const failConnect = client.managers.utils.buildEmbed({ description: phrases[config.defaultLocale].failConnect }, null);

                return command.reply({ embeds: [failConnect] });
            })
        }
    }
} as ClientCommand;