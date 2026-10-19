import { ActionRow, Channel, Client, Embed, FileComponent, TextChannel, Webhook, WebhookMessageCreateOptions } from 'discord.js';
import { ClientConfig } from '../../lib/types'
import DiscordClient from '../Bot';

interface WebhookOptions {
    avatarURL?: string;
    username?: string;
    content?: string;
    embeds?: Embed[];
    file?: FileComponent;
    slack?: boolean;
    components?: ActionRow<any>;
}

export class WebhookManager {
    private bot: DiscordClient
    private config: ClientConfig
    private client: Client;
    private avatarURL: string;
    private default: WebhookOptions;
    private logChannel: Channel;

    constructor(bot: DiscordClient) {
        this.bot = bot;
        this.config = bot.config;
        this.client = bot.client;

        this.logChannel = null;

        this.avatarURL = this.config.client.avatar || null;

        this.default = {
            username: this.config.name,
            avatarURL: this.avatarURL
        }
    };

    get log() {
        return this.logChannel;
    };

    public async initialize(): Promise<Channel> {
        this.logChannel = await this.client.channels.fetch(this.bot.config.logChannel);
        return this.logChannel;
    };

    /**
     * Fetches a webhook or creates one if it doesn't exist
     * @param channel Channel object
     * @param options Webhook options
     * @returns {Webhook} A webhook
    **/
    public async getOrCreate(channel: any, options: WebhookOptions = {}): Promise<Webhook> {
        channel = channel || this.log;
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
				return Promise.resolve(hook);
			} else {
				const wh = await channel.createWebhook({
					name: options.username || this.bot.config.name,
					avatar: avatarURL
				})

				return Promise.resolve(wh);
			}
		} catch (err) {
			return Promise.reject(err);
		}
	};

    /**
     * 
     * @param channel A channel object
     * @param options Webhook options
     * @param webhook A webhook object
     * @returns 
     */
    async execute(channel: any, options: any, webhook?: Webhook) {
        options.avatarURL = options.avatarURL || this.avatarURL;
        const content: WebhookMessageCreateOptions = Object.assign({}, this.default, options || {});

        if (webhook) {
            return webhook.send(content)
        } else {
            try {
                const webhook = await this.getOrCreate(channel);
                return webhook.send(content);
            } catch (err) {
                return Promise.reject(err);
            }
        }
    }
}