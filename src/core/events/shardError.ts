import { EventManager } from '../managers/EventManager';

export default async function shardError(manager: EventManager, error: Error, shardId: number) {
    return manager.bot.logger.warn(`[ShardManager] Shard ${shardId} error: ${error.message}`);
};