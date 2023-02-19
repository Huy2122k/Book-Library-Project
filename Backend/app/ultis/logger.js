const winston = require("winston");
const path = require("path");
const moment = require("moment")

dir = "/var/log/lib-log/";

const options = {
  file: {
    level: "debug",
    filename: path.join(dir, `${moment().format("YYYY-MM-DD")}.log`),
    datePattern: "YYYY-MM-DD",
    prepend: true,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    // maxFiles: 5,
    colorize: false,
  },
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const timezoned = () => {
  return new Date().toLocaleString("pt-BR", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });
};

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  format: winston.format.combine(
    winston.format.timestamp({
      format: timezoned(),
    }),
    winston.format.label({
      label: `[Library-website]`,
    }),

    winston.format.printf((info) => {
      // console.log(timezoned());
      return `${timezoned()} ${info.label}: ${info.level.toUpperCase()}: ${
        info.message
      }`;
    })
    // winston.format.json()
  ),
  exitOnError: false,
});
module.exports = logger;
