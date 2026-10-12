import util from 'util';
import path from 'path';
import config from './config';
import winston from 'winston';
import moment from 'moment';
const WinstonLimit = require('@redpill-paris/winston-limit-transport');

class Logger {
    private logger: any;
    private logLevel: string;
    /**
     * @prop {Array} transports
     * @prop {Boolean} exitOnError
     */
    constructor() {
        this.logLevel = config.logLevel;
        if (config.devMode) {
          this.logLevel = 'debug';
        }

        const formatTime = winston.format((i) => {
            i.timestamp = moment(new Date()).format('HH:mm:ss');
            let ts = `${i.timestamp}`;
            switch (i.level) {
                case 'debug':
                    ts += ' ⚙ ';
                    break;
                case 'info':
                    ts += ' 🆗 ';
                    break;
                case 'error':
                    ts += ' 🔥 ';
                    break;
                case 'warn':
                    ts += ' ☣ ';
                    break;
                case 'silly':
                    ts += ' 💩 ';
                    break;
            }
            i.timestamp = ts;
            return i;
        });
        const formatter = winston.format.printf(({ level, message, label, timestamp, ...meta}: any) => {
            let ts = `${timestamp}`;
            if (!message.length && meta instanceof Error) {
                message = meta + meta.stack!;
            }
            let msg = ts + ' ' + level + ': ' + (undefined !== message ? message : '') +
            (meta && Object.keys(meta).length
            ? '\n\t' + util.inspect(meta)
            : '');
            return msg;
        });
        
        const consoleLogger = winston.createLogger({
            level: this.logLevel,
            format: winston.format.json(),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        formatTime(),
                        // winston.format.timestamp({ format: 'HH:mm:ss' }),
                        winston.format.colorize(),
                        winston.format.errors({ stack: true }),
                        //@ts-ignore
                        formatter
                    ),
                }),
            ],
        });

        const _transports = [
            new WinstonLimit({
                timeout: 5000,
                transport: consoleLogger,
            }),
        ];

        this.logger = winston.createLogger({
            level: this.logLevel,
            transports: _transports,
        });

        const ret = this.logger;
        ret.error = console.error;
        return ret;
    }
}

export default new Logger() as any;
