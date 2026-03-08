import { Box, CircularProgress } from '@mui/material';

interface Props {
    isMobile?: boolean;
}

export default function LoadingSpinner({ isMobile }: Props) {
    return (
        <Box
            sx={{
                width: '100%',
                height: '100%',
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
            }}>
            <CircularProgress size={56} color="primary" aria-label="Loading" />
        </Box>
    );
}
