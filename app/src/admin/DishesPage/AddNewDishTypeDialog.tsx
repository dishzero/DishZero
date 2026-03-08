import { Box, DialogContent, LinearProgress, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import adminApi from '../adminApi';
import { AdminContainedButton } from '../components/AdminButtons';
import { usePreventReload } from './AddNewDishDialog';
import CustomDialogTitle from './CustomDialogTitle';

interface Props {
    open: boolean;
    setOpen: (open: boolean) => void;
    fetchDishTypes: () => void;
}

export default function AddNewDishTypeDialog({ open, setOpen, fetchDishTypes }: Props) {
    const { sessionToken } = useAuth();

    const [error, setError] = useState<boolean>(false); // dish type is not entered
    const [loading, setLoading] = useState<boolean>(false);
    const [newDishTypeValue, setNewDishTypeValue] = useState<string>('');

    const { enqueueSnackbar } = useSnackbar();

    // prevent page reload when loading
    usePreventReload(loading);

    const resetState = () => {
        setError(false);
        setNewDishTypeValue('');
    };

    const addNewDishType = async () => {
        if (sessionToken) {
            setLoading(true);
            const response = await adminApi.addDishType(sessionToken, newDishTypeValue.toLowerCase());
            if (response && response.status != 200) {
                enqueueSnackbar(`Failed to add dish type: ${response.message}`, { variant: 'error' });
            } else {
                enqueueSnackbar('Successfully added dish type', { variant: 'success' });
                setOpen(false);
                resetState();

                // fetch new dish types
                fetchDishTypes();
            }
            setLoading(false);
        }
    };

    return (
        <CustomDialogTitle
            open={open}
            setOpen={setOpen}
            dialogTitle={'Add New Dish Type'}
            loading={loading}
            onCloseCallback={resetState}>
            <DialogContent sx={{ minWidth: '520px', maxWidth: '520px' }}>
                <Box width="100%" sx={{ textAlign: 'center' }}>
                    <TextField
                        variant="outlined"
                        sx={{ width: '100%', mb: '0.25rem', mt: '0.25rem' }}
                        placeholder="Enter dish type..."
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            const newValue = event.target.value;

                            // only accept letters
                            if (newValue === '' || /[^a-zA-Z]/.test(newValue)) {
                                setError(true);
                            } else {
                                setError(false);
                                setNewDishTypeValue(newValue);
                            }
                        }}
                        disabled={loading}
                        error={error}
                        helperText={error ? 'Cannot be empty or contain numbers & special characters' : ' '}
                    />
                    <AdminContainedButton
                        variant="contained"
                        onClick={() => addNewDishType()}
                        sx={{ width: '90%', mt: '1rem' }}
                        disabled={loading || error || newDishTypeValue == ''}>
                        Add new dish type
                    </AdminContainedButton>
                </Box>
                {loading && (
                    <LinearProgress
                        sx={{
                            mt: '15px',
                            backgroundColor: 'primary.light',
                            '& .MuiLinearProgress-bar': {
                                backgroundColor: 'primary.main',
                            },
                        }}
                    />
                )}
            </DialogContent>
        </CustomDialogTitle>
    );
}
