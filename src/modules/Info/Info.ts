import { ApplicationCommandOption, PermissionFlagsBits, User } from 'discord.js';
import { Command, CommandData } from '../../lib/structures';
import moment from 'moment';
import 'moment-duration-format';
//@ts-ignore
import pkg from '../../../package.json';
import * as lists from '../../lib/trivia/lists';

export default class Info extends Command {
    public name         : string = 'info';
    public description  : string = 'Sends info about the bot'
    public usage        : string = '/info';
    public args         : ApplicationCommandOption[] =  [];
    public cooldown     : number = 5000;
    public permissions  : BigInt = PermissionFlagsBits.ViewChannel;
    public options      : any    =  {};

    public async execute({ interaction, options }: CommandData): Promise<any> {
        const trivialists: string[] = Object.keys(lists).sort();
        const duration = moment.duration(process.uptime()).format(' D [days], H [hrs], m [mins], s [secs]');
        let team = [];
        for (let i of this.config.developers) {
            let u: User = await this.client.users.fetch(i.id);
            let entry;
            if (i.website) {
                entry = `[${u.username}](${i.website})`
            } else {
                entry = u.username
            };
            team.push(entry);
        }

        let embed = {
            title: this.config.name,
            color: 0xffe4a8,
            thumbnail: {
                url: this.bot.user.avatarURL() as string
            },
            description: this.client.application.description,
            fields: [
                { name: 'Version',          value: pkg.version,                                                         inline: true },
                { name: 'Language',         value: 'TypeScript',                                                        inline: true },
                { name: 'Library',          value: 'discord.js',                                                        inline: true },
                { name: 'Servers',          value: this.client.guilds.cache.size.toString(),                            inline: true },
                { name: 'Trivia Lists',     value: trivialists.length.toString(),                                       inline: true },
                { name: 'Joined Discord',   value: `<t:${Math.floor(this.bot.user.createdAt.getTime() / 1000)}:D>`,     inline: false },
                { name: 'Developers',       value: team.join(', '),                                                     inline: false }
            ],
            footer: { text: `${this.bot.user.username} | PID: ${process.pid} | Uptime: ${duration}`}
        };

        let button = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Invite Bot',
                    url: this.client.application.customInstallURL || 'https://trivia.atlacord.com',
                    style: 5
                },
                {
                    type: 2,
                    label: 'Report Issues',
                    url: 'https://discord.gg/avatar',
                    style: 5
                },
            ]
        }
        interaction.reply({ embeds: [embed], components: [button] });
    };
}