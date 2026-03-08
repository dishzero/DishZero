import { Box, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

import container from '../assets/dish_icon_contained.svg';
import mug from '../assets/mug_icon_contained.svg';
import { BACKEND_ADDRESS } from '../config/env';

function DishCard({ dish, token }) {
    const [dishAPI, setDishAPI] = useState([]);
    const twoDaysInMs = 86400000 * 2;
    useEffect(() => {
        axios
            .get(`/api/dish`, {
                headers: { 'session-token': token },
                baseURL: BACKEND_ADDRESS,
                params: { id: dish.dish },
            })
            .then(function (response) {
                setDishAPI(response.data.dish);
            })
            .catch(function (error) {
                console.log(error);
            });
    }, []);

    // const icon = dishAPI['type'] == 'mug' ? mug : container
    const icon = dishAPI && dishAPI['type'] === 'mug' ? mug : container;
    const iconAltText = dishAPI && dishAPI['type'] === 'mug' ? 'Mug Icon' : 'Container Icon';
    const dishTypeLabel = dishAPI?.['type'] ? `${dishAPI['type']} # ${dishAPI['qid']}` : '';

    const dishCheckOut = new Date(dish.timestamp);
    const dishDue = new Date(dishCheckOut.getTime() + twoDaysInMs);
    return (
        <Paper
            data-testid="dish-card"
            elevation={3}
            sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                p: 2,
                mb: 2,
                borderRadius: 2.5,
            }}>
            <Box>
                <img src={icon} alt={iconAltText}></img>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography variant="caption" color="text.primary">
                    Return before {dishDue.toLocaleDateString('en-US')}
                </Typography>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                    {dishTypeLabel}
                </Typography>
                <Typography variant="caption" color="text.primary">
                    Checked out on {dishCheckOut.toLocaleDateString('en-US')}
                </Typography>
            </Box>
        </Paper>
    );
}

export default DishCard;
