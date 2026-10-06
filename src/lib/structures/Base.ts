import DiscordClient from '../../core/Bot';

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
};