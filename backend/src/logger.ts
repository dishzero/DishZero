import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

const logger = pino({
    level: 'info',
    ...(isProd
        ? {}
        : {
              transport: {
                  target: 'pino-pretty',
                  options: { colorize: true, translateTime: true },
              },
          }),
});

export default logger;
