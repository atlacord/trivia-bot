import Base from './Base';
import { ApplicationCommandOption } from 'discord.js';
import { CommandData, SlashCommandArgumentEnvelope } from './index';

export abstract class Command extends Base {
    public name!: string;
    public abstract description: string;
    public abstract args: ApplicationCommandOption[];
    public abstract cooldown?: number;
    public abstract permissions?: BigInt;
    public abstract options?: SlashCommandArgumentEnvelope;

    public autocomplete?(i: any): Promise<any>;
    
    public abstract execute(e: CommandData): Promise<any>;

    public slashMetadata() {
        let data = {
            type:  1,
            name: this.name,
            description: this.description,
            options: this.args,
            default_member_permissions: this.permissions?.toString()
        };

        if (this.options) {
            Object.assign(data, this.options)
        };
        return data;
    };
};