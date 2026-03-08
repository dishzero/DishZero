import { Search, Send } from '@mui/icons-material';
import { Box, IconButton, InputBase, Paper } from '@mui/material';
import React from 'react';

interface BottomTextInputProps {
    disabled?: boolean;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onSubmit: (value: string) => Promise<void> | void;
}

export default function BottomTextInput(props: BottomTextInputProps) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await props.onSubmit(props.value);
        return false;
    };

    return (
        <Box sx={{ width: '95%', maxWidth: 560 }} component="form" onSubmit={handleSubmit}>
            <Paper
                elevation={3}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: 6,
                    px: 1.5,
                    py: 0.5,
                    bgcolor: 'grey.100',
                }}>
                <Search sx={{ color: 'grey.500', mr: 1, fontSize: 22 }} />
                <InputBase
                    value={props.value}
                    onChange={props.onChange}
                    type="text"
                    placeholder="Enter dish id #"
                    sx={{
                        flex: 1,
                        color: 'text.primary',
                        '& input::placeholder': { color: 'grey.500', opacity: 1 },
                    }}
                />
                <IconButton type="submit" disabled={props.disabled} data-testid="return-btn" color="primary">
                    <Send />
                </IconButton>
            </Paper>
        </Box>
    );
}
