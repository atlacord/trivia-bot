import { ApplicationCommandOption, PermissionFlagsBits, User } from 'discord.js';
import { Command, CommandData } from '../../lib/structures';
import moment from 'moment';
import 'moment-duration-format';
//@ts-ignore
import pkg from '../../../package.json';

export default class Info extends Command {
    public name         : string = 'info';
    public description  : string = 'Sends info about the bot'
    public usage        : string = '/info';
    public args         : ApplicationCommandOption[] =  [];
    public cooldown     : number = 5000;
    public permissions  : BigInt = PermissionFlagsBits.ViewChannel;
    public options      : any    =  {};

    public async execute({ interaction, options }: CommandData): Promise<any> {
        const duration = moment.duration(process.uptime()).format(' D [days], H [hrs], m [mins], s [secs]');
        let team = [];
        for (let i of this.bot.config.developers) {
            let u: User = await this.bot.client.users.fetch(i);
            team.push(u.username);
        }

        let embed = {
            title: this.bot.config.name,
            color: 0xffe4a8,
            thumbnail: {
                url: this.bot.user.avatarURL() as string
            },
            fields: [
                { name: 'Description', value: pkg.description },
                { name: 'Version', value: pkg.version, inline: true },
                { name: 'Library', value: 'discord.js', inline: true },
                { name: 'Created', value: `<t:${Math.floor(this.bot.user.createdAt.getTime() / 1000)}:F>` },
                { name: 'Developers', value: team.join(', ') }
            ],
            footer: { text: `${this.bot.user.username} | PID: ${process.pid} | Uptime: ${duration}`}
        };

        let button = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: '⚠️ Report issues',
                    url: 'https://github.com/atlacord/trivia-bot',
                    style: 5
                }
            ]
        }
        interaction.reply({ embeds: [embed], components: [button] });
    };
}