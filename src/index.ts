import 'dotenv/config';
import fs from 'fs';
import DiscordClient from './core/Bot';
import config from './core/config';
//@ts-ignore
import chalk from 'chalk';

async function start() {
    const bot = new DiscordClient();
    const logo = fs.readFileSync('logo.txt', 'utf-8');
    console.log(chalk.white.bold(logo));
    console.log(chalk.white.bold(`${config.name} v${config.version} - by ${config.author}`));
    await bot.setup();
}

const run = async () => {
    await start();
};

run();