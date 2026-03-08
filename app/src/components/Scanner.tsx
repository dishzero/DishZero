import { Cameraswitch, Close, Search, Videocam } from '@mui/icons-material';
import { AppBar, Box, IconButton, InputBase, Paper, Typography } from '@mui/material';
import { useState } from 'react';
import QrReader from 'react-qr-scanner';

const Header = ({ handleClose, title, style }: { handleClose: () => void; title: string; style?: object }) => (
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
        <IconButton onClick={handleClose} aria-label="Close" size="small">
            <Close />
        </IconButton>
    </AppBar>
);

const BottomTextInput = ({ onSubmit }: { onSubmit: (value: string) => void }) => {
    const [input, setInput] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(input);
        return false;
    };
    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ position: 'fixed', left: 0, right: 0, bottom: 16, px: 4 }}>
            <Paper elevation={3} sx={{ display: 'flex', alignItems: 'center', maxWidth: 640, mx: 'auto', borderRadius: 6, px: 2, py: 1 }}>
                <Search sx={{ color: 'text.secondary', mr: 1 }} />
                <InputBase
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    type="text"
                    placeholder="Enter dish id #"
                    sx={{ flex: 1 }}
                />
                <IconButton type="submit" data-testid="enter-btn" color="primary">
                    Enter
                </IconButton>
            </Paper>
        </Box>
    );
};

const CameraInput = ({ onSubmit }: { onSubmit: (value: string) => void }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [showQr, setShowQr] = useState(false);
    const [frontCamera, setFrontCamera] = useState(false);
    const style = { height: '100%' };

    const handleError = (err: Error) => {
        console.error(err.message);
        if (err.message === 'Permission denied') setErrorMessage('Camera Permission Denied');
        setShowQr(false);
    };
    const handleScan = (data: { text?: string } | null) => {
        if (data?.text) onSubmit(data.text);
    };

    return (
        <Box sx={{ position: 'relative', minHeight: 420, mt: 2, borderRadius: 4, bgcolor: 'grey.800', overflow: 'hidden' }}>
            <Box sx={style}>
                <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
                    <IconButton
                        sx={{ color: 'common.white', bgcolor: 'rgba(255,255,255,0.16)', '&:hover': { bgcolor: 'rgba(255,255,255,0.24)' } }}
                        onClick={() => setFrontCamera(!frontCamera)}
                        aria-label="Switch camera">
                        <Cameraswitch />
                    </IconButton>
                </Box>
                <Box
                    sx={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'common.white' }}
                    onClick={() => setShowQr(!showQr)}>
                    {showQr ? (
                        <QrReader
                            delay={100}
                            style={style}
                            onError={handleError}
                            onScan={handleScan}
                            facingMode={frontCamera ? 'user' : 'environment'}
                        />
                    ) : errorMessage ? (
                        <Typography>{errorMessage}</Typography>
                    ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <Videocam sx={{ fontSize: 48 }} />
                            <Typography variant="body2" sx={{ mt: 1 }}>Camera Disabled</Typography>
                            <Typography variant="body2">Tap to Enable</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

interface ScannerProps {
    mode: string;
    onScan: (id: string) => void;
    onClose: () => void;
}

export default function Scanner({ mode, onScan, onClose }: ScannerProps) {
    return (
        <Box sx={{ position: 'fixed', inset: 0, width: '100%', height: '100%', bgcolor: 'background.default' }}>
            <Box sx={{ height: '100vh', width: '80%', maxWidth: 720, mx: 'auto', display: 'block' }}>
                <Header title={mode} style={{ width: '100%' }} handleClose={onClose} />
                <CameraInput onSubmit={onScan} />
                <BottomTextInput onSubmit={onScan} />
            </Box>
        </Box>
    );
}
