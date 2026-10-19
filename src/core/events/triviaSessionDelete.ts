import { Guild } from 'discord.js';
import { EventManager } from '../managers/EventManager';
import { Session } from '../../lib/trivia/TriviaSession';

export default async function triviaSessionDelete(manager: EventManager, session: Session, guild: Guild) {
    let embed = {
        color: 0xff4040,
        author: {
            name: 'Trivia Session Deleted'
        },
        thumbnail: {
            url: session.user.avatarURL()
        },
        description: guild.description || null,
        fields: [
            { name: 'User', value: `${session.user.username} (${session.user.id}` },
            { name: 'Guild', value: `${guild.name} (${guild.id})` },
            { name: 'Topic', value: session.topic },
            { name: 'Score', value: session.score },
        ],
        footer: {
            text: `ID: ${session.id}`,
        },
        timestamp: new Date()
    }
    manager.bot.webhooks.execute(manager.bot.webhooks.channels.session, { embeds: [embed] });
    return manager.bot.logger.info(`[TriviaSession] Closing session ${session.id} in ${guild.id}`);
};