const fs = require('fs');

/**
 * Класс для логирования сообщений.
*/
class Logger {
    /**
     * Записывает сообщение в лог как LOG уровень.
     * 
     * @param {...any} args - Аргументы для сообщения.
    */
    static log(...args) {
        Logger.printLog('LOG', ...args);
    }
    
    /**
     * Записывает сообщение в лог как INFO уровень.
     * 
     * @param {...any} args - Аргументы для сообщения.
    */
    static info(...args) {
        Logger.printLog('INFO', ...args);
    }
    
    /**
     * Записывает сообщение в лог как GLOBAL INFO уровень.
     * 
     * @param {...any} args - Аргументы для сообщения.
    */
    static infoG(...args) {
        Logger.printLog('GLOBAL INFO', ...args);
    }
    
    /**
     * Записывает сообщение в лог как WARN уровень.
     * 
     * @param {...any} args - Аргументы для сообщения.
    */
    static warn(...args) {
        Logger.printLog('WARN', ...args);
    }
    
    /**
     * Записывает сообщение в лог как ERROR уровень.
     * 
     * @param {...any} args - Аргументы для сообщения.
    */
    static error(...args) {
        Logger.printLog('ERROR', ...args);
    }
    
    /**
     * Записывает сообщение в лог как FATAL уровень.
     * 
     * @param {...any} args - Аргументы для сообщения.
    */
    static fatal(...args) {
        Logger.printLog('FATAL', ...args);
    }

    /**
     * Записывает сообщение в лог как DEBUG уровень.
     * 
     * @param {...any} args - Аргументы для сообщения.
    */
    static debug(...args) {
        Logger.printLog('DEBUG', ...args);
    }   

    /**
     * Записывает сообщение в лог с указанным уровнем.
     * 
     * @param {string} level - Уровень лога (например, LOG, INFO, WARN, ERROR, FATAL).
     * @param {...any} args - Аргументы для сообщения.
    */
    static printLog(level, ...args) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
  
        const logTime = `${year}.${month}.${day}-${hour}:${minute}:${second}`;
        const message = args.map(arg => String(arg)).join(' ');
  
        let decoratedMessage;
        let fileMessage;
        switch (level) {
            case 'LOG':
                decoratedMessage = `\x1b[1m\x1b[33m${logTime} \x1b[37m${level}\x1b[0m \x1b[1m${message}`;// Белый
                fileMessage = `${level} ${message}`

                break;
            case 'INFO':
                decoratedMessage = `\x1b[1m\x1b[33m${logTime} \x1b[32m${level}\x1b[0m \x1b[1m${message}`;// Зеленый
                fileMessage = `${level} ${message}`
                break;
            case 'GLOBAL INFO':
                decoratedMessage = `\x1b[1m\x1b[33m${logTime} \x1b[32m${level}\x1b[0m \x1b[1m\x1b[36m${message}`;// Зеленый
                fileMessage = `${level} ${message}`
                break;
            case 'WARN':
                decoratedMessage = `\x1b[1m\x1b[33m${logTime} \x1b[33m${level} ${message}`;// Желтый
                fileMessage = `${level} ${message}`
                break;
            case 'ERROR':
                decoratedMessage = `\x1b[1m\x1b[33m${logTime} \x1b[31m${level} ${message}`;// Красный
                fileMessage = `${level} ${message}`
                break;
            case 'FATAL':
                decoratedMessage = `\x1b[1m\x1b[33m${logTime} \x1b[35m${level} ${message}`;// Фиолетовый
                fileMessage = `${level} ${message}` 
                break;
            default:
                decoratedMessage = `\x1b[1m\x1b[33m${logTime} \x1b[0m${level}\x1b[0m \x1b[1m${message}`;// Сброс цвета
                fileMessage = `${level} ${message}`
                break;
        }
        console.log(`\x1b[0m${decoratedMessage}\x1b[0m`);
        Logger.writeLogToFile(logTime, fileMessage)
    }

    /**
     * Записывает сообщение в лог-файл.
     * 
     * @param {string} logTime - Время лога.
     * @param {string} message - Сообщение для записи в лог.
    */
    static writeLogToFile(logTime, message) {
        const logFilePath = './logs/AClans.log';
        const logEntry = `${logTime}: ${message}\n`;
        
        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, '', 'utf8');
        }
        
        fs.appendFile(logFilePath, logEntry, (err) => {
            if (err) {
                Logger.error('Ошибка при записи в лог файл:', err);
            }
        });
    }    
}

module.exports = Logger;