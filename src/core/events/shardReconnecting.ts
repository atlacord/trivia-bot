import { EventManager } from '../managers/EventManager';

export default async function shardReconnecting (manager: EventManager, id: number) {
    return manager.bot.logger.debug(`[ShardManager] Shard ${id} reconnecting`);
};