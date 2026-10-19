import { ActionRow, Embed, FileComponent, TextChannel, Webhook } from 'discord.js';
import DiscordClient from '../../core/Bot';

interface WebhookOptions {
	avatarURL?: string;
	username?: string;
	content?: string;
	embeds?: Embed[];
	file?: FileComponent;
	slack?: boolean;
	components?: ActionRow<any>;
}

export default class Base {
	public _bot!: DiscordClient;

	constructor(context?: any) {
		this._bot = context;
	};

	/**
	 * Discord bot instance
	 */
	public get bot() {
		return this._bot;
	};

	/**
	 * Discord.js client instance
	 */
	public get client() {
		return this._bot.client;
	};

	/**
	 * Discord.js REST client instance
	 */
	public get restClient() {
		return this._bot.restClient;
	};

    public toJSON(): object {
		const copy: {[key: string]: any} = {};

		for (const key in this) {
			if (!this.hasOwnProperty(key) || key.startsWith('_')) {
				continue;
			}

			if (!this[key]) {
				copy[key] = this[key];
			} else if (<any>this[key] instanceof Set) {
				copy[key] = Array.from(<any>this[key]);
			} else if (<any>this[key] instanceof Map) {
				copy[key] = Array.from((<any>this[key]).values());
			} else if ((<any>this[key]).toJSON != undefined) {
				copy[key] = (<any>this[key]).toJSON();
			} else {
				copy[key] = this[key];
			}
		}

		return copy;
	};

    public inspect(): object {
		return this.toJSON();
	};

	public async getOrCreateWebook(channel: TextChannel, options: WebhookOptions = {}): Promise<Webhook> {
		const id = typeof channel === 'string' ? channel : channel.id || null;
		if (!id) {
			return Promise.reject('Invalid channel or ID')
		};

		const avatarURL = options.avatarURL || this.client.user.avatarURL();

		try {
			const webhooks = await channel.fetchWebhooks();
			let hook: Webhook;
			if (webhooks.size) {
				hook = webhooks.find((hook: any) => hook.name === options.username || (hook.name === this.bot.config.name && hook.token));
			};

			if (hook) {
				Promise.resolve(hook);
			} else {
				const wh = await channel.createWebhook({
					name: options.username || this.bot.config.name,
					avatar: Buffer.from(avatarURL, 'utf8').toString('base64')
				})

				return Promise.resolve(wh);
			}
		} catch (err) {
			return Promise.reject(err);
		}
	}
};