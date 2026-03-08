import { Box } from '@mui/material';
import { BallTriangle } from 'react-loader-spinner';

interface Props {
    isMobile: boolean;
}

const spinnerStyles = {
    root: {
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden' as const,
    },
};

export default function LoadingSpinner({ isMobile }: Props) {
    return (
        <Box sx={spinnerStyles.root}>
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
