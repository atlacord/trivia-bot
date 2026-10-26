import { PermissionFlagsBits } from 'discord.js';
import { Command, CommandData } from '../../lib/structures';
import * as lists from '../../lib/trivia/lists';

export default class MigrateTopics extends Command {
    public name         : string = 'migrate';
    public description  : string = '[Temporary] Migrate trivia topics to database'
    public usage        : string = '/migrate';
    public cooldown     : number = 10000;
    public args         : any    = null;
    public permissions  : BigInt = PermissionFlagsBits.Administrator;
    public avatarGuild ?: boolean = true;
    public options      : any    =  {};

    public getList(listArg?: any): any {
        if (!listArg) {
            const values = Object.values(lists);
            return values[Math.floor(Math.random() * values.length)];
        };
        return lists[listArg.value as keyof typeof lists];
    }

    public async execute({ interaction, options }: CommandData): Promise<any> {
        if (interaction.user.id !== '254814547326533632') return;
        let Topic = this.bot.db.models['Topic'];
        let topicDocs = [];
        for (let l of Object.values(lists)) {
            const doc = new Topic({ _id: l.name, name: l.name, questions: l.content, createdAt: Date.now(), lastUpdated: Date.now() });
            topicDocs.push(doc);
        }
        await Topic.insertMany(topicDocs);
        interaction.reply(`Migrated ${topicDocs.length} topics.`);
    };
}