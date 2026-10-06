import { ChatInputCommandInteraction, GuildTextBasedChannel } from 'discord.js';

export interface CommandContext extends Record<PropertyKey, unknown> {
    name: string;
    id: string;
};

export interface CommandData {
	interaction: ChatInputCommandInteraction;
    context: CommandContext;
	args?: any[];
	options?: {
		question: number;
		streak: number;
	};
	t?: Function;
	command?: string;
	isAdmin?: boolean;
	isDeveloper?: boolean;
	suppressOutput?: boolean;
	responseChannel?: GuildTextBasedChannel;
}