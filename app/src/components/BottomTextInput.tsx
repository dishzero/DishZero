/*eslint-disable*/

import { faPaperPlane, faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, IconButton, InputBase, Paper } from '@mui/material';
import React from 'react';

interface BottomTextInputProps {
    disabled?: boolean;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    onSubmit: (value: string) => Promise<void> | void;
}

const BottomTextInput = (props: BottomTextInputProps) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await props.onSubmit(props.value);
        return false;
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                left: '50%',
                bottom: 16,
                transform: 'translateX(-50%)',
                width: '95%',
                maxWidth: 560,
                zIndex: 1200,
            }}>
            <Box component="form" onSubmit={handleSubmit}>
                <Paper
                    elevation={3}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: 6,
                        px: 1.5,
                        py: 0.5,
                        backgroundColor: '#f6f8f5',
                    }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#c2c2c2', mr: 1 }}>
                        <FontAwesomeIcon icon={faSearch} />
                    </Box>
                    <InputBase
                        value={props.value}
                        onChange={props.onChange}
                        type="text"
                        placeholder="Enter dish id #"
                        sx={{
                            flex: 1,
                            color: '#000000',
                            '& input::placeholder': {
                                color: '#c2c2c2',
                                opacity: 1,
                            },
                        }}
                    />
                    <IconButton
                        type="submit"
                        disabled={props.disabled}
                        data-testid="return-btn"
                        sx={{ color: '#68b49a' }}>
                        <FontAwesomeIcon icon={faPaperPlane} fontSize={'1.4em'} />
                    </IconButton>
                </Paper>
            </Box>
        </Box>
    );
};

export default BottomTextInput;
