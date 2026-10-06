import 'dotenv/config';
import DiscordClient from './core/Bot';
import config from './core/config';

async function start() {
    console.debug(`[Start] Starting ${config.name}`)
    const bot = new DiscordClient();

    await bot.setup();
}

const run = async () => {
    await start();
};

run();