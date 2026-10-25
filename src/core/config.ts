import { GatewayIntentBits } from 'discord.js';
import { ClientConfig } from '../lib/types';
//@ts-ignore
import pkg from '../../package.json';

const config: ClientConfig = {
    name: 'Trivia',
    version: pkg.version,
    author: pkg.author,
    logLevel: process.env.LOG_LEVEL || 'info',
    devMode: false,
    private: false,
    developers: [
        // Kyle
        {
            id: '254814547326533632',
            website: 'https://soda.gg'
        }
    ],
    guilds: [
        '546800805060280352', // Quantum Biotics, Inc.
        '370708369951948800' // Avatar: The Last Airbender
    ],
    avatarGuild: '370708369951948800',
    web: {
        host: 'trivia.atlacord.com'
    },
    client: {
        token: process.env.TOKEN as string,
        status: 'trivia.atlacord.com | /trivia',
        options: {
            allowedMentions: {
                parse: [ 'users' ],
            },
            intents: [
                GatewayIntentBits.Guilds
            ]
        },
        restOptions: {}
    },
    logs: {
        client: process.env.CLIENT_LOG,
        session: process.env.SESSION_LOG
    }
}

if (config.devMode) {
    config.client.token = process.env.TOKEN_DEV as string;
};

export = config;