/*eslint-disable*/

import { faCameraRotate, faClose, faSearch, faVideoCamera } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppBar, Box, IconButton, InputBase, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import QrReader from 'react-qr-scanner';

const Header = ({ handleClose, title, style }) => {
    return (
        <AppBar
            position="static"
            sx={{
                ...style,
                backgroundColor: 'background.paper',
                color: 'text.primary',
                boxShadow: 'none',
                px: 2,
                py: 1.5,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
            <Box />
            <Typography variant="subtitle1">{title}</Typography>
            <Box sx={{ cursor: 'pointer' }} onClick={handleClose}>
                <FontAwesomeIcon icon={faClose} />
            </Box>
        </AppBar>
    );
};

const BottomTextInput = ({ onSubmit }) => {
    const [input, setInput] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(input);
        return false;
    };
    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 16,
                px: 4,
            }}>
            <Paper
                elevation={3}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    maxWidth: 640,
                    mx: 'auto',
                    borderRadius: 6,
                    px: 2,
                    py: 1,
                }}>
                <Box sx={{ color: 'text.secondary', mr: 1 }}>
                    <FontAwesomeIcon icon={faSearch} />
                </Box>
                <InputBase
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    type="text"
                    placeholder="Enter dish id #"
                    sx={{ flex: 1 }}
                />
                <IconButton type="submit" data-testid="enter-btn" sx={{ color: 'primary.main' }}>
                    Enter
                </IconButton>
            </Paper>
        </Box>
    );
};

const CameraInput = ({ onSubmit }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [showQr, setShowQr] = useState(false);
    const [frontCamera, setFrontCamera] = useState(false);

    const style = { height: '100%' };
    const handleError = (err: any) => {
        console.error(err.message);
        if (err.message === 'Permission denied') {
            setErrorMessage('Camera Permission Denied');
        }
        setShowQr(false);
    };
    const handleScan = (data: any) => {
        if (data === null) {
            return;
        }
        onSubmit(data.text);
        console.log(data);
    };
    return (
        <Box
            sx={{
                position: 'relative',
                minHeight: 420,
                mt: 2,
                borderRadius: 4,
                backgroundColor: 'grey.800',
                overflow: 'hidden',
            }}>
            <Box sx={style}>
                <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
                    <IconButton
                        sx={{
                            color: 'common.white',
                            backgroundColor: 'rgba(255,255,255,0.16)',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.24)' },
                        }}
                        onClick={() => setFrontCamera(!frontCamera)}>
                        <FontAwesomeIcon icon={faCameraRotate} />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'common.white',
                    }}
                    onClick={() => setShowQr(!showQr)}>
                    {showQr ? (
                        <QrReader
                            delay={100}
                            style={style}
                            onError={handleError}
                            onScan={handleScan}
                            // TODO: determine based off https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/facingMode
                            facingMode={frontCamera ? 'user' : 'environment'}
                        />
                    ) : (
                        <Box>
                            {' '}
                            {errorMessage ? (
                                errorMessage
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faVideoCamera} /> Camera Disabled <br />{' '}
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Tap to Enable
                                    </Typography>
                                    {errorMessage}
                                </>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

function Scanner({ mode, onScan, onClose }) {
    const onSubmit = (id: string) => onScan(id);

    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'background.default',
            }}>
            <Box sx={{ height: '100vh', width: '80%', maxWidth: 720, mx: 'auto', display: 'block' }}>
                <Header title={mode} style={{ width: '100%' }} handleClose={onClose} />
                <CameraInput onSubmit={onSubmit} />
                <BottomTextInput onSubmit={onSubmit} />
            </Box>
        </Box>
    );
}

export default Scanner;
