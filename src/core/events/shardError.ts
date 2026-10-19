import { EventManager } from '../managers/EventManager';

export default async function shardError(manager: EventManager, error: Error, shardId: number) {
    let embed = {
        author: {
            name: 'Shard Error'
        },
        description: error.message,
        fields: [
            { name: 'ID', value: shardId },
        ],
        timestamp: new Date()
    }
    manager.bot.webhooks.execute(manager.bot.webhooks.channels.client, { embeds: [embed] });
    return manager.bot.logger.warn(`[ShardManager] Shard ${shardId} error: ${error.message}`);
};