import { ClientOptions } from 'discord.js';

export interface ClientConfig {
    name: string;
    version: string;
    author: string;
    logLevel: string;
    devMode: boolean;
    developers: string[];
    testGuilds: string[];
    avatarGuild: string;
    client: {
        token: string;
        status: string;
        options: ClientOptions;
        restOptions: any;
    }
}