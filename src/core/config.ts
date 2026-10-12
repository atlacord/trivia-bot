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
        '254814547326533632' // Kyle
    ],
    guilds: [
        '546800805060280352', // Quantum Biotics, Inc.
        '370708369951948800' // Avatar: The Last Airbender
    ],
    avatarGuild: '370708369951948800',
    client: {
        token: process.env.TOKEN as string,
        status: 'Trivia! Get started using /trivia',
        options: {
            intents: [
                GatewayIntentBits.Guilds
            ]
        },
        restOptions: {}
    },
}

if (config.devMode) {
    config.client.token = process.env.TOKEN_DEV as string;
};

export = config;