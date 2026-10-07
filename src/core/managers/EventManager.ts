import fs from 'fs';
import path from 'path';
import { Client } from 'discord.js';
import DiscordClient from '../Bot';

export class EventManager {
    public bot: DiscordClient;
    private _client: Client;
    private _handlers: Map<string, any>;
    private _listeners: Record<string, Array<any>>;
    private _boundListeners: Map<string, any>;

    constructor(bot: DiscordClient) {
        this.bot = bot;
        this._client = bot.client;
        this._handlers = new Map();
        this._listeners = {};
        this._boundListeners = new Map();

        this.loadHandlers();
    }

    get client() {
        return this._client;
    };

    public async loadHandlers() {
        const basePath = path.resolve(path.join(__dirname, '../'))
        const files = fs.readdirSync(path.join(basePath, 'events'));
        for (const file of files) {
            const {default: handler } = await import(path.join(basePath, 'events', file));
            if (!handler) {
                console.error(`[EventManager] Ignoring invalid event handler`);
                continue;
            }
            this._handlers.set(handler.name, handler);
            this.client.on(handler.name, (...args) => handler(this, ...args));
            console.debug(`[EventManager] Registering ${handler.name} handler`);
        }
        console.info(`[EventManager] Registered ${this._handlers.size} handlers`);
    };

    public async registerListener(event: string, listener: any) {
        if (!this._listeners[event] || !this._listeners[event].find((l) => l.listener === listener)) {
            this._listeners[event] = this._listeners[event] || [];
            this._listeners[event].push({
                name: listener.name,
                listener: listener
            });
            return;
        }

        // this._boundListeners.set(event, this.createListener.bind(this, event));
        this.client.on(event, this._boundListeners.get(event));
    }

    public async loadListeners(event: string, ...args: any) {
        if (!this._listeners[event]) return;

        const handler = this._handlers.get(event);

        if (handler) {
            try {
                const e = await handler(this, ...args);
                if (!e) {
                    return;
                };
            } catch (err) {
                console.error(`[EventManager] An error occurred while loading listener: ${err}`);
                return;
            }
        };
    }
}