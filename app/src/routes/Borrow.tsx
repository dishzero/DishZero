/*eslint-disable*/
import { faCoffee, faExclamation, faLeaf } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

import AppHeader from '../components/AppHeader';
import BottomTextInput from '../components/BottomTextInput';
import { BACKEND_ADDRESS } from '../config/env';
import { useAuth } from '../contexts/AuthContext';

const Borrow = () => {
    const [scanId, setScanId] = useState('');
    const { currentUser, sessionToken } = useAuth();
    const [confirm, setConfirm] = useState(false);
    const [borrowDishResult, setBorrowDishResult] = useState({
        show: false,
        success: false,
    });
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const previousURL = queryParams.get('previousURL');
        if (previousURL?.includes('dishzero.ca')) {
            const dishID = (previousURL.match(/dishID=([^&]+)/) || '')[1];
            setConfirm(true);
            onConfirm(dishID);
        }
    }, []);

    const onConfirm = async (scanId: string) => {
        setConfirm(false);
        setScanId(scanId);
        const user = currentUser?.id || null;
        console.log('USER: ' + user);
        console.log('scanid', scanId);

        axios
            .post(
                `${BACKEND_ADDRESS}/api/dish/borrow`,
                {},
                {
                    headers: { 'session-token': sessionToken },
                    params: { qid: scanId },
                },
            )
            .then(function (response) {
                //eslint-disable-line @typescript-eslint/no-unused-vars
                setBorrowDishResult({ show: true, success: true });
            })
            .catch(function (error) {
                setBorrowDishResult({ show: true, success: false });
                console.log(error);
            });
    };

    const onCancel = () => {
        setScanId('');
        setConfirm(false);
        setBorrowDishResult({ ...borrowDishResult, show: false });
    };

    return (
        <>
            <Box
                sx={{
                    height: '100vh',
                    flexDirection: 'column',
                    backgroundColor: '#464646',
                    color: 'common.white',
                    position: 'relative',
                }}>
                <AppHeader title={'Borrow Dishes'} />
                <Box
                    sx={{
                        px: 3,
                        pt: 8,
                        pb: 16,
                        display: 'flex',
                        flexGrow: 1,
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}>
                    <Box sx={{ mb: 3 }}>
                        <FontAwesomeIcon icon={faLeaf} color="white" fontSize="2.5em" />
                    </Box>
                    <Typography variant="h5" sx={{ maxWidth: 480, color: '#d6d6d6' }}>
                        Use phone camera to scan QR Code or type in the ID in the box below
                    </Typography>
                </Box>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        position: 'absolute',
                        left: 0,
                        bottom: 32,
                    }}>
                    <BottomTextInput
                        disabled={false}
                        value={scanId}
                        onChange={(e) => setScanId(e.target.value)}
                        onSubmit={async () => {
                            await onConfirm(scanId);
                        }}
                    />
                </Box>
            </Box>

            <Dialog open={borrowDishResult.show} onClose={onCancel} maxWidth="xs" fullWidth>
                <DialogTitle>{borrowDishResult.success ? 'Borrow Complete' : 'Borrow Failed'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ width: '100%', display: 'flex', gap: 2, alignItems: 'flex-start', py: 1 }}>
                        {borrowDishResult.success ? (
                            <>
                                <FontAwesomeIcon icon={faCoffee} size="4x" />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography>Successfully borrowed</Typography>
                                    <Typography>Dish # {scanId}</Typography>
                                    <Typography variant="body2" sx={{ color: '#000000' }}>
                                        Please return your dish within two days to the nearest DishZero Return Station
                                    </Typography>
                                </Box>
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon style={{ color: '#BF4949' }} icon={faExclamation} size="4x" />
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Typography>Failed to borrow</Typography>
                                    <Typography>Dish # {scanId}</Typography>
                                    <Typography>Please scan and try again</Typography>
                                </Box>
                            </>
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default Borrow;
