import { Box, Button, CircularProgress, Link as LinkMUI, Paper, Typography } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';

import external_link from '../assets/external_link.svg';
import leaf_green from '../assets/leaf-green.svg';
import MobileBackground from '../assets/leaf-mobile-background.png';
import scan_icon from '../assets/scan.svg';
import AppHeader from '../components/AppHeader';
import DishCard from '../components/DishCard';
import { BACKEND_ADDRESS } from '../config/env';
import { useAuth } from '../contexts/AuthContext';

// Display DishCard for unreturned dishes
const DishLog = ({ dishes }) => {
    const { sessionToken } = useAuth();
    if (!dishes) {
        dishes = [];
    }
    return (
        <Box id="dish-log" sx={{ mt: 3 }}>
            {dishes.map((dish) => {
                if (dish.returned.timestamp == '') {
                    return <DishCard dish={dish} token={sessionToken} key={dish.id} />;
                }
            })}
        </Box>
    );
};

// Get user dishes status to be displayed in the homepage
const GetDishes = (dishesUsed) => {
    const checkedOutDishes = dishesUsed?.filter((dish) => dish.returned.timestamp == '').length;
    return (
        <Box id="dishes" sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="subtitle2">My Dishes</Typography>
                <Typography variant="caption" sx={{ mt: 0.5 }}>
                    {checkedOutDishes} in use
                </Typography>
            </Box>

            {checkedOutDishes != 0 ? (
                <DishLog dishes={dishesUsed} />
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
                        <img src={leaf_green} style={{ transform: 'rotate(-90deg)' }} />
                        <img src={leaf_green} style={{ transform: 'rotate(-45deg)', marginTop: '-16px' }} />
                        <img src={leaf_green} />
                    </Box>
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                        <Typography variant="caption" align="center" sx={{ maxWidth: 244 }}>
                            You don't have any dishes borrowed at the moment. Start borrowing to make an impact!
                        </Typography>
                    </Box>
                    <Button
                        component={ReactRouterLink}
                        to="/borrow"
                        variant="contained"
                        sx={{ alignSelf: 'center', mt: 2, minWidth: 150, height: 40 }}>
                        Borrow
                    </Button>
                </Box>
            )}
        </Box>
    );
};

const InfoCard = ({ title, description, href }: { title: string; description: string; href: string }) => (
    <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Paper
            sx={{
                mt: 2,
                p: 3,
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 2,
                borderRadius: 2.5,
                backgroundColor: 'primary.light',
            }}>
            <Typography variant="caption" sx={{ maxWidth: 198 }}>
                {description}
            </Typography>
            <LinkMUI href={href} sx={{ display: 'flex', alignItems: 'center' }}>
                <img src={external_link} alt="External Link" />
            </LinkMUI>
        </Paper>
    </Box>
);

const ImpactCard = ({
    value,
    suffix,
    label,
    testId,
}: {
    value: number;
    suffix?: string;
    label: string;
    testId?: string;
}) => (
    <Paper
        sx={{
            flex: 1,
            p: 2,
            borderRadius: 2.5,
            backgroundColor: 'primary.light',
            position: 'relative',
        }}
        elevation={0}>
        <Box component="img" src={leaf_green} alt="leaf" sx={{ position: 'absolute', top: 16, right: 16 }} />
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            <Typography variant="h4" data-testid={testId}>
                {value}
            </Typography>
            {suffix ? (
                <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                    {suffix}
                </Typography>
            ) : null}
        </Box>
        <Typography variant="subtitle2">{label}</Typography>
    </Paper>
);

// Display homepage for new users
const NewUser = (dishesUsed) => {
    const content = GetDishes(dishesUsed);
    return (
        <Box sx={{ px: 3, py: 3 }}>
            <InfoCard
                title="How It Works"
                description="More details about the process behind borrowing and returning dishes."
                href="https://www.dishzero.ca/how-it-works-1"
            />
            <InfoCard
                title="Our Impact"
                description="Learn more about the impact we are leaving on the environment."
                href="https://www.dishzero.ca/impact"
            />
            {content}
        </Box>
    );
};

// Display homepage for existing users
const ExistingUser = (dishesUsed) => {
    const content = GetDishes(dishesUsed);
    const returnedDishes = dishesUsed?.filter((dish) => dish.returned.timestamp != '').length;
    return (
        <Box sx={{ px: 3, py: 3 }}>
            <Typography id="impact" variant="subtitle2">
                My Impact
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <ImpactCard value={returnedDishes} label="Dishes Used" testId="returned-dishes-count" />
                <ImpactCard
                    value={returnedDishes * 0.5}
                    suffix="Lbs"
                    label="Waste Diverted"
                    testId="waste-diverted-amt"
                />
            </Box>
            {content}
        </Box>
    );
};

const Footer = () => {
    return (
        <Box sx={{ p: 3, position: 'fixed', bottom: 0, right: 0 }}>
            <Box component={ReactRouterLink} to="/borrow" sx={{ display: 'inline-flex' }}>
                <img src={scan_icon} alt="scan icon" />
            </Box>
        </Box>
    );
};

function Home() {
    //Show spinner as soon as page is refreshed
    const [isLoading, setIsLoading] = useState(true);
    const { currentUser, sessionToken } = useAuth();
    const [dishesUsed, setDishesUsed] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); //eslint-disable-line @typescript-eslint/no-unused-vars
    let content;
    // Fetch dishes transaction for the user
    useEffect(() => {
        const redirectURL = sessionStorage.getItem('previousURL');
        if (redirectURL) {
            // Redirect to the borrow page
            window.location.href = redirectURL;
        } else {
            axios
                .get(`/api/transactions`, {
                    headers: { 'session-token': sessionToken! },
                    baseURL: BACKEND_ADDRESS,
                })
                .then(function (response) {
                    setDishesUsed(response.data.transactions);
                    setIsLoading(false);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }

        // Clear the temporary storage
        sessionStorage.removeItem('previousURL');
    }, []);

    const user = currentUser;

    if (user) {
        // User is defined
        if (Number(dishesUsed) === 0) {
            content = NewUser(dishesUsed);
        } else {
            content = ExistingUser(dishesUsed);
        }
    }
    if (isLoading) {
        return (
            <Box
                data-testid="ball-triangle-loading"
                sx={{
                    width: '100%',
                    height: '100%',
                    minHeight: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden',
                }}>
                <CircularProgress size={56} color="primary" aria-label="Loading" />
            </Box>
        );
    }
    return (
        <Box>
            <AppHeader title="Home" />
            {content}
            <Footer />
        </Box>
    );
}

export default Home;

const styles = {
    rootDesktop: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rootMobileLoader: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: `url(${MobileBackground})`,
        backgroundSize: 'cover',
    },
};
