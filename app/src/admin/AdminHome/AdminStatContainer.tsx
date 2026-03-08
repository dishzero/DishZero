import { Box, Typography } from '@mui/material';

import leaf_green from '../../assets/leaf-green.svg';

interface Props {
    statTitle: string;
    statValue: number;
}

export default function AdminStatContainer({ statTitle, statValue }: Props) {
    return (
        <Box
            sx={{
                borderRadius: '10px',
                backgroundColor: 'primary.light',
                width: '170px',
                height: '118px',
                marginRight: '40px',
                padding: '16px',
                color: 'black',
                position: 'relative',
                border: '2px solid transparent',
                '&:hover': {
                    borderColor: 'primary.main',
                },
                cursor: 'pointer',
                boxSizing: 'border-box',
            }}>
            <img src={leaf_green} style={{ position: 'absolute', top: '16px', right: '16px' }} alt="" />
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 600,
                    fontSize: '36px',
                    lineHeight: '44px',
                    marginTop: '10px',
                }}>
                {statValue}
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    fontSize: '16px',
                    fontWeight: 600,
                    lineHeight: '19px',
                    textAlign: 'left',
                }}>
                {statTitle}
            </Typography>
        </Box>
    );
}
