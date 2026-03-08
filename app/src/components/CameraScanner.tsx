/*eslint-disable*/

import { faCamera, faCameraRotate, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, IconButton, Typography } from '@mui/material';
import React, { useState } from 'react';
import { TailSpin } from 'react-loader-spinner';

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
    const scannerFrameStyle = { height: '100%' };

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
        if (!text) {
            return;
        }
        props.onSubmit(text);
        console.log(text);
    };

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                minHeight: { xs: 320, sm: 420 },
                height: props.style?.height ?? '100%',
                borderRadius: 4,
                overflow: 'hidden',
                backgroundColor: '#464646',
            }}>
            <Box
                onClick={() => {
                    console.log(showQr);
                    setShowQr(!showQr);
                }}
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'common.white',
                    textAlign: 'center',
                    px: 3,
                    cursor: 'pointer',
                }}>
                {props.isLoading ? (
                    <Box>
                        <TailSpin
                            height={100}
                            width={100}
                            color="#B0D1D8"
                            ariaLabel="tail-spin-loading"
                            radius="1"
                            wrapperStyle={{}}
                            wrapperClass=""
                            visible={true}
                        />
                    </Box>
                ) : (
                    <>
                        {showQr ? (
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
                        ) : (
                            <Box>
                                {errorMessage ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            color: 'error.main',
                                        }}>
                                        <FontAwesomeIcon icon={faExclamationTriangle} fontSize={'3em'} /> <br />
                                        <Typography sx={{ fontSize: '1.4em' }}>{errorMessage}</Typography>
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                            color: 'common.white',
                                        }}>
                                        <FontAwesomeIcon icon={faCamera} color="white" fontSize={'3em'} />
                                        <Typography sx={{ mt: 2, fontWeight: 600 }}>Camera Disabled</Typography>
                                        <Typography variant="body2" sx={{ color: 'common.white' }}>
                                            Tap to Enable
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </>
                )}
            </Box>
            <IconButton
                onClick={() => {
                    setFrontCamera(frontCamera + 1);
                    console.log(frontCamera);
                }}
                sx={{
                    position: 'absolute',
                    right: 20,
                    top: 20,
                    zIndex: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.16)',
                    color: 'common.white',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.24)',
                    },
                }}>
                <FontAwesomeIcon icon={faCameraRotate} size="lg" />
            </IconButton>
        </Box>
    );
};

export default CameraScanner;
