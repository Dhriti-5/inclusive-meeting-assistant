/**
 * Logger Utility
 * Provides colored console logging with timestamps
 */
import { config } from '../config.js';

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  success: 2,
  warn: 3,
  error: 4,
};

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background colors
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
};

class Logger {
  constructor() {
    this.level = LOG_LEVELS[config.logging.level] || LOG_LEVELS.info;
    this.enableTimestamps = config.logging.enableTimestamps;
    this.enableColors = config.logging.enableColors;
  }

  _getTimestamp() {
    if (!this.enableTimestamps) return '';
    
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    return `[${time}.${ms}]`;
  }

  _colorize(text, color) {
    if (!this.enableColors || !COLORS[color]) return text;
    return `${COLORS[color]}${text}${COLORS.reset}`;
  }

  _log(level, levelName, color, ...args) {
    if (level < this.level) return;
    
    const timestamp = this._getTimestamp();
    const prefix = this._colorize(`${timestamp} ${levelName}:`, color);
    
    console.log(prefix, ...args);
  }

  debug(...args) {
    this._log(LOG_LEVELS.debug, 'DEBUG', 'cyan', ...args);
  }

  info(...args) {
    this._log(LOG_LEVELS.info, 'INFO', 'blue', ...args);
  }

  success(...args) {
    this._log(LOG_LEVELS.success, 'SUCCESS', 'green', ...args);
  }

  warn(...args) {
    this._log(LOG_LEVELS.warn, 'WARN', 'yellow', ...args);
  }

  error(...args) {
    this._log(LOG_LEVELS.error, 'ERROR', 'red', ...args);
  }

  // Special formatters
  section(title) {
    const line = '='.repeat(60);
    this.info(this._colorize(line, 'bright'));
    this.info(this._colorize(` ${title}`, 'bright'));
    this.info(this._colorize(line, 'bright'));
  }

  divider() {
    this.info(this._colorize('-'.repeat(60), 'dim'));
  }
}

export const logger = new Logger();
export default logger;
