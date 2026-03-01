import nodeConfig from 'config';

import { app } from '@/app';
import logger from '@/logger';

const port = nodeConfig.get('server.port') || 8080;

app.listen(port, () => {
    logger.info(`Server is listening on port ${port}`);
});
