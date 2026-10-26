import { Client, ClientUser, PresenceStatusData, REST } from 'discord.js';
import config from './config';
import { Logger } from '@atla/logger';
import { CommandCollection } from './collections/CommandCollection';
import { EventManager } from './managers/EventManager';
import { Command } from '../lib/structures';
import { WebhookManager } from './managers/WebhookManager';
import { DataStore } from './database';

var instance: DiscordClient;

export default class DiscordClient {
    public isReady: boolean;
    public startTime: number;

    private _client!: Client;
    private _restClient!: REST;

    public _logger: any;
    public _db: DataStore;

    public user!: ClientUser;
    private playingStatus!: string;

    public _commands!: CommandCollection<string, Command> | null;
    public _events!: EventManager;
    public _webhooks!: WebhookManager

    public options!: {
        name: string;
        devMode: boolean;
        developers: string[];
        devGuild: string;
    };

    constructor() {
        this.isReady = false;
        this.startTime = Date.now();
        instance = this;
    };

    static get instance(): DiscordClient {
        return instance;
    };

    get client(): Client {
        return this._client;
    }
    
    get restClient(): REST {
        return this._restClient;
    }

    get config() {
        return config;
    }

    get db() {
        return this._db;
    }

    get logger() {
        return this._logger;
    }

    get commands() {
        return this._commands;
    }

    get events() {
        return this._events;
    }

    get webhooks() {
        return this._webhooks;
    }

    public setup(options?: any) {
        this._logger = new Logger(config);
        if (config.devMode) {
            this.logger.level = 'debug';
        };
        
        this.logger.debug(`[DiscordClient] Configuring client`)
        this.options = options || {};

        const clientOptions = config.client.options;
        const restOptions = config.client.restOptions;

        this._db = new DataStore(this, config.mongoUri);
        
        this._client = new Client(clientOptions);
        this._restClient = new REST(restOptions);

        let token = config.client.token;
        this._client.token = token;
        this._restClient.setToken(token);

        this.client.once('clientReady', this.ready.bind(this));

        this._commands = new CommandCollection(config, this);
        this._events = new EventManager(this);
        this._webhooks = new WebhookManager(this);

        this.client.on('error', this.handleError.bind(this));

        // Connect to Discord
        this.connect();
    };

    public changeStatus(playingStatus: string, status: PresenceStatusData) {
        this.playingStatus = playingStatus;
        this._client.user!.setPresence({ activities: [{ name: this.playingStatus }], status: status});
        this.logger.debug(`[DiscordClient] Changed the application status to ${this.playingStatus}`);
    };

    public connect() {
        this.logger.info(`[DiscordClient] Connecting to Discord`)
        this.client.login();
    };

    public async ready() {
        if (this._client.user) {
            this.user = this._client.user;
        };

        // Load client application into cache
        await this.client.application.fetch();
        
        this.isReady = true;
        this.logger.info(`[DiscordClient] ${this.config.name} online as ${this.user.username}#${this.user.discriminator}, serving ${this.client.guilds.cache.size} guilds`);
        this.changeStatus(config.client.status, 'online');

        // Link log channel to webhook manager
        await this.webhooks.initialize();
        let embed = {
            color: 0x66ff6b,
            title: 'Client Ready',
            thumbnail: {
                url: this.client.user.avatarURL()
            },
            fields: [
                { name: 'Name', value: this.client.user.username },
                { name: 'Commands', value: this.commands.size, inline: true },
                { name: 'Event Listeners', value: this.events.listeners, inline: true },
                { name: 'Guilds', value: this.client.guilds.cache.size, inline: true }
            ],
            footer: {
                text: `ID: ${this.client.user.id}`
            },
            timestamp: this.client.readyAt
        }

        this.webhooks.execute(this.webhooks.channels.client, { embeds: [embed]});

        // Register slash commands
        this.commands!.refreshSlashCommands();

        // Leave unapproved guilds
        if (config.private) {
            this.checkGuilds();
        };
    };

    /**
     * Leaves guilds that are not approved
     */
    public async checkGuilds() {
        this.client.guilds.cache.forEach(async (g) => {
            if ((!this.config.guilds.includes(g.id))) {
                let owner = await g.fetchOwner();
                this.logger.info(`[DiscordClient] Leaving unapproved guild ${g.name} (${g.id}), owned by ${owner.user.username} (${owner.id})`)
                g.leave();
            }
        });
    };

    public handleError(err: any) {
        let embed = {
            color: 0xff4040,
            title: 'Error',
            description: `\`\`\`${err.message}\`\`\`\nSee console for full error stack.`,
            footer: {
                text: null
            },
            timestamp: new Date()
        };

        if (!err) {
            return this.logger.error('An undefined exception occurred.');
        };

        // Suppress empty message errors
        if (err.code === 50006) return;

        try {
            if (err.code) {
                embed.footer.text = 'Code: ' + err.code;
            };

            if (err?.message && 
                [ 
                    'ECONNREFUSED', 
                    'ETIMEDOUT', 
                    '>1500ms', 
                    'Connection reset by peer'
                ].includes(err.message)
            ) {
                embed.color = 0xfffa6e;
                embed.title = 'Warning';
                return this.logger.warn(err);
            }

            if (err?.code === 1001) {
                embed.color = 0xfffa6e;
                embed.title = 'Warning';
                return this.logger.warn(err);
            }

            this.logger.error(err.stack ?? err);
        } catch (e) {
            this.logger.error(e);
        }
        this.webhooks.execute(this.webhooks.channels.client, { embeds: [embed] });
    };
}