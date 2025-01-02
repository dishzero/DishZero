import { alpha, Box, styled, Typography } from '@mui/material'
import leaf_white from '../../assets/leaf-white.svg'

interface Props {
    statTitle: string
    statValue: number
}

const StyledStatBox = styled(Box)(({ theme }) => ({
    borderRadius: '10px',
    backgroundColor: alpha(theme.palette.primary.main, 0.4),
    width: '170px',
    height: '118px',
    marginRight: '40px',
    padding: '16px',
    color: 'black',
    position: 'relative',
    border: '2px solid transparent',
    '&:hover': {
        borderColor: theme.palette.primary.main,
    },
    cursor: 'pointer',
    boxSizing: 'border-box',
}))

export default function AdminStatContainer({ statTitle, statValue }: Props) {
    return (
        <StyledStatBox>
            <img src={leaf_white} style={{ position: 'absolute', top: '16px', right: '16px' }} />
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
        </StyledStatBox>
    )
}
