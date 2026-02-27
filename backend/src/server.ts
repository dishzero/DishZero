import { app } from '@/app'
import nodeConfig from 'config'
import logger from '@/logger'

const port = process.env.PORT || nodeConfig.get('server.port') || 3000

app.listen(port, () => {
    logger.info(`Server is listening on port ${port}`)
})
