import { Client, ClientUser, PresenceStatusData, REST } from 'discord.js';
import config from './config';
import { CommandCollection } from './collections/CommandCollection';
import { EventManager } from './managers/EventManager';
import { Command } from '../lib/structures';

var instance: DiscordClient;

export default class DiscordClient {
    public isReady: boolean;
    public startTime: number;

    private _client!: Client;
    private _restClient!: REST;

    public user!: ClientUser;
    private playingStatus!: string;

    public _commands!: CommandCollection<string, Command> | null;
    public _eventmanager!: EventManager;

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

    get commands() {
        return this._commands;
    }

    get eventManager() {
        return this._eventmanager;
    }

    public setup(options?: any) {
        console.debug(`[DiscordClient] Configuring client`)
        this.options = options || {};

        const clientOptions = config.client.options;
        const restOptions = config.client.restOptions;
        
        this._client = new Client(clientOptions);
        this._restClient = new REST(restOptions);;

        let token = config.client.token;
        this._client.token = token;
        this._restClient.setToken(token);

        this.client.once('clientReady', this.ready.bind(this));

        this._commands = new CommandCollection(config, this);
        this._eventmanager = new EventManager(this);

        this.client.on('error', this.handleError.bind(this));

        // Connect to Discord
        this.connect();
    };

    public changeStatus(playingStatus: string, status: PresenceStatusData) {
        this.playingStatus = playingStatus;
        this._client.user!.setPresence({ activities: [{ name: this.playingStatus }], status: status});
        console.log(`[DiscordClient] Changed the application status to ${this.playingStatus}`);
    };

    public connect() {
        console.debug(`[DiscordClient] Connecting to Discord`)
        this.client.login();
    };

    public ready() {
        console.info(`[DiscordClient] ${this.config.name} online, serving ${this.client.guilds.cache.size} guilds`);
        if (this._client.user) {
            this.user = this._client.user;
        };

        this.isReady = true;
        
        this.changeStatus(config.client.status, 'online');

        // Register slash commands
        this.commands!.refreshSlashCommands();
    };

    public handleError(err: any) {
        if (!err) {
            return console.error('An undefined exception occurred.');
        }

        try {
            if (err?.message && 
                [ 
                    'ECONNREFUSED', 
                    'ETIMEDOUT', 
                    '>1500ms', 
                    'Connection reset by peer'
                ].includes(err.message)
            ) {
                return console.warn(err);
            }

            if (err?.code === 1001) {
                return console.warn(err);
            }

            console.error(err.stack ?? err);
        } catch (e) {
            console.error(e);
        }
    };
}