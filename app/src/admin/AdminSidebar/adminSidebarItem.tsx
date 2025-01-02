import { ListItemButton, ListItemIcon, Typography } from '@mui/material'
import { Link } from 'react-router-dom'

interface Props {
    url: string
    icon: React.ReactNode
    text: string
}

export default function AdminSidebarItem({ url, icon, text }: Props) {
    const path = window.location.pathname
    const buttonColor = url === path ? 'primary.main' : 'white'
    return (
        <ListItemButton
            component={Link}
            to={url}
            sx={{
                justifyContent: 'center',
                mb: '0.75rem',
            }}>
            <ListItemIcon sx={{ color: buttonColor, justifyContent: 'center' }}>{icon}</ListItemIcon>
            <Typography variant="body1" color={buttonColor} fontWeight="bold" width="10rem">
                {text}
            </Typography>
        </ListItemButton>
    )
}
