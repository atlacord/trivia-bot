import { Guild } from 'discord.js';
import { EventManager } from '../managers/EventManager';
import { Session } from '../../lib/trivia/TriviaSession';

export default async function triviaSessionCreate(manager: EventManager, session: Session, guild: Guild) {
    let embed = {
        color: 0x66ff6b,
        author: {
            name: 'Trivia Session Created'
        },
        thumbnail: {
            url: session.user.avatarURL()
        },
        description: guild.description || null,
        fields: [
            { name: 'User', value: `${session.user.username} (${session.user.id}` },
            { name: 'Guild', value: `${guild.name} (${guild.id})` },
            { name: 'Topic', value: session.topic },
            { name: 'Max Questions', value: session.maxQuestions },
        ],
        footer: {
            text: `ID: ${session.id}`,
        },
        timestamp: new Date()
    }
    manager.bot.webhooks.execute(manager.bot.webhooks.channels.session, { embeds: [embed] });
    return manager.bot.logger.info(`[TriviaSession] Initializing new session ${session.id} in ${guild.id}`);
};