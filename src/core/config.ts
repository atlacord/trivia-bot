import { GatewayIntentBits } from 'discord.js';
import { ClientConfig } from '../lib/types';

const config: ClientConfig = {
    name: 'Trivia',
    devMode: false,
    developers: [
        '254814547326533632' // Kyle
    ],
    testGuilds: [
        '546800805060280352', // Quantum Biotics, Inc.
        '370708369951948800' // Avatar: The Last Airbender
    ],
    client: {
        token: process.env.TOKEN as string,
        status: 'Trivia! Use /trivia to begin',
        options: {
            intents: [
                GatewayIntentBits.GuildScheduledEvents
            ]
        },
        restOptions: {}
    },
}

export = config;