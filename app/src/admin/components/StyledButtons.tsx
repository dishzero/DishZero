import { Button, styled } from '@mui/material';

export const StyledOutlinedButton = styled(Button)(() => ({
    borderRadius: '30px',
    border: `2px solid !important`,
    padding: '0.5rem 2rem !important',
}));

export const StyledContainedButton = styled(Button)(() => ({
    borderRadius: '30px',
    color: 'white',
    padding: '0.5rem 2rem',
    margin: '1rem',
}));
