import { ClientOptions } from 'discord.js';

interface Developer {
    id: string;
    website?: string
}

export interface ClientConfig {
    name: string;
    version: string;
    author: string;
    logLevel: string;
    devMode: boolean;
    private: boolean;
    developers: Developer[];
    guilds: string[];
    avatarGuild: string;
    client: {
        token: string;
        status: string;
        avatar?: string;
        options: ClientOptions;
        restOptions: any;
    },
    logs: {
        client: string;
        session: string;
    };
}