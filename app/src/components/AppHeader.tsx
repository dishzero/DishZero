import { AppBar, Box, Typography } from '@mui/material';
import React from 'react';

interface Props {
    title: string;
}

const AppHeader = ({ title }: Props) => {
    return (
        <Box sx={{ height: { xs: 88, sm: 104 } }}>
            <AppBar
                position="static"
                sx={{
                    backgroundColor: 'primary.main',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                <Typography variant="subtitle1" color="inherit">
                    {title}
                </Typography>
            </AppBar>
        </Box>
    );
};

export default AppHeader;
