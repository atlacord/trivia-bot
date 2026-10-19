import { ApplicationCommandOption, PermissionFlagsBits } from 'discord.js';
import { Command, CommandData } from '../../lib/structures';
import { TriviaSession } from '../../lib/trivia';
import * as lists from '../../lib/trivia/lists';

export default class Trivia extends Command {
    public name         : string = 'trivia';
    public description  : string = 'Start a trivia game.'
    public usage        : string = '/trivia [optional list]';
    public args         : ApplicationCommandOption[] =  [
                                        {
                                            type: 3,
                                            name: 'list',
                                            description: 'A trivia topic (topic will be random if don\'t specify a topic)',
                                            autocomplete: true
                                        },
                                        {
                                            type: 4,
                                            name: 'questions',
                                            description: 'The amount of questions in your trivia session (defaults to 10)'
                                        }
                                    ];
    public cooldown     : number = 10000;
    public permissions  : BigInt = PermissionFlagsBits.ViewChannel;
    public options      : any    =  {};

    public async autocomplete(interaction: any) {
        const choices: string[] = Object.keys(lists).sort();
        try {
            let filtered;
            filtered = choices.slice(0, 25);
            const focusedValue = interaction.options.getFocused();
            if (focusedValue) {
                filtered = choices.filter(c => c.toLowerCase().includes(focusedValue.toLowerCase()));
            };

            await interaction.respond(filtered.slice(0, 25).map(choice => ({ name: choice, value: choice })))
        } catch (err: any) {
            if (err.code === 'AutocompleteInteractionOptionNoFocusedOption') {
                return;
            };
            this.bot.logger.error(err);
        };
    }

    public getList(listArg?: any): any {
        if (!listArg) {
            const values = Object.values(lists);
            return values[Math.floor(Math.random() * values.length)];
        };
        return lists[listArg.value as keyof typeof lists];
    }

    public async execute({ interaction, options }: CommandData): Promise<any> {

        let listArg: any = interaction.options.get('list') || null;
        let list = this.getList(listArg);
        let maxQuestions: any = interaction.options.get('questions') || null;

        let identifier;
        if (!listArg) {
            identifier = 'random'
        } else {
            identifier = listArg.value
        };
        let sessionOptions = {
            id: `trivia:${identifier}:${interaction.user.id}`,
            user: interaction.user,
            list: list,
            topic: listArg.value,
            maxQuestions: maxQuestions.value
        };

        return new TriviaSession(this.bot, interaction, sessionOptions);
    };
}