import { Box } from '@mui/material';
import { BallTriangle } from 'react-loader-spinner';

import { styles } from '../routes/Login';

interface Props {
    isMobile: boolean;
}

export default function LoadingSpinner({ isMobile }: Props) {
    return (
        <Box sx={isMobile ? styles.rootMobileLoader : styles.rootDesktop}>
            <BallTriangle
                height={100}
                width={100}
                radius={5}
                color="#4fa94d"
                ariaLabel="ball-triangle-loading"
                visible={true}
            />
        </Box>
    );
}
