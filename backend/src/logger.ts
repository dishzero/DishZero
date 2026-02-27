import pino from 'pino'

const isProd = process.env.NODE_ENV === 'prod'

const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    ...(isProd
        ? {}
        : {
              transport: {
                  target: 'pino-pretty',
                  options: { colorize: true, translateTime: true },
              },
          }),
})

export default logger
