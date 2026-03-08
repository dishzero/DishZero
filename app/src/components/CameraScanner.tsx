import { CameraAlt, Cameraswitch, Warning } from '@mui/icons-material';
import { Box, CircularProgress, IconButton, Typography } from '@mui/material';
import React, { useState } from 'react';

import { QrReader } from './QrScanner/index';

interface CameraScannerProps {
    isLoading: boolean;
    onSubmit: (value: string) => void;
    style?: React.CSSProperties;
}

const CameraScanner = (props: CameraScannerProps) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [showQr, setShowQr] = useState(false);
    const [frontCamera, setFrontCamera] = useState(0);

    const handleError = (err: Error) => {
        console.error(err.message);
        if (err.message === 'Permission denied') {
            setErrorMessage('Camera Permission Denied');
        } else {
            setErrorMessage(err.message);
        }
        setShowQr(false);
    };

    const handleScan = (text?: string) => {
        if (!text) return;
        props.onSubmit(text);
    };

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                minHeight: { xs: 320, sm: 420 },
                height: props.style?.height ?? '100%',
                overflow: 'hidden',
            }}>
            <Box
                onClick={() => setShowQr(!showQr)}
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    px: 3,
                    cursor: 'pointer',
                }}>
                {props.isLoading ? (
                    <CircularProgress size={56} sx={{ color: 'secondary.main' }} aria-label="Scanning" />
                ) : showQr ? (
                    <QrReader
                        scanDelay={1000}
                        videoContainerStyle={{ height: '100%', width: '100%' }}
                        onResult={(result) => {
                            if (result != null) {
                                setShowQr(false);
                                handleScan(result.getText());
                            }
                        }}
                        onError={handleError}
                        videoId="123"
                        deviceIndex={frontCamera}
                    />
                ) : errorMessage ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'error.main' }}>
                        <Warning sx={{ fontSize: 48 }} />
                        <Typography sx={{ fontSize: '1.4em', mt: 1 }}>{errorMessage}</Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>
                        <CameraAlt sx={{ fontSize: 48 }} />
                        <Typography sx={{ mt: 2, fontWeight: 600 }}>Camera Disabled</Typography>
                        <Typography variant="body2">Tap to Enable</Typography>
                    </Box>
                )}
            </Box>
            <IconButton
                onClick={() => setFrontCamera(frontCamera + 1)}
                sx={{
                    position: 'absolute',
                    right: 20,
                    top: 20,
                    zIndex: 2,
                }}
                aria-label="Switch camera">
                <Cameraswitch />
            </IconButton>
        </Box>
    );
};

export default CameraScanner;
