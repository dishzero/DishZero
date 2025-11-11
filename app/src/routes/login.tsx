import { useEffect, useState } from 'react'
import { Button, Typography, Box, Avatar, Tooltip } from '@mui/material'
import desktopLogo from '../assets/dishzero-logo-desktop.png'
import mobileLogo from '../assets/dishzero-logo-mobile.png'
import signInButtonLogo from '../assets/sign-in-button-logo.png'
import MobileBackground from '../assets/leaf-mobile-background.png'
import 'typeface-poppins'
import { LoginLocation, useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../widgets/loadingSpinner'
import { HelpOutline } from '@mui/icons-material'

export default function Login() {
    const { login } = useAuth()
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

    //Show spinner as soon as page is refreshed
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        window.addEventListener('resize', handleResize)
        sessionStorage.removeItem('previousURL')
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    // fired on button click while the user is not signed in.
    // logs in the user and navigates to home screen if successfully logged in
    const handleSignIn = async (loginLocation = LoginLocation.Other) => {
        setIsLoading(true)
        // Get the 'previousURL' parameter from the query string
        const urlParams = new URLSearchParams(window.location.search)
        const previousURL = urlParams.get('previousURL')

        // Save the original URL to sessionStorage
        sessionStorage.setItem('previousURL', previousURL || '')

        await login(loginLocation)
    }
    //Hide spinner as soon as Auth state has changed i.e. auth state has been read

    //As auth state is being read, display loader spinner
    if (isLoading) {
        return <LoadingSpinner isMobile={isMobile} />
    }
    return (
        <Box sx={isMobile ? styles.rootMobile : styles.rootDesktop}>
            <Box sx={isMobile ? styles.logoMobile : styles.logoDesktop} />
            <Box sx={isMobile ? styles.rightFrameMobile : styles.rightFrameDesktop}>
                <Typography variant="h1" sx={styles.dishZeroHeading}>
                    DishZero
                </Typography>
                <Typography variant="subtitle1" sx={styles.subheading}>
                    The last dish you'll ever need
                </Typography>
                <Button
                    variant="contained"
                    sx={styles.signInButtonGmail}
                    onClick={() => handleSignIn(LoginLocation.Other)}
                    disabled={isLoading}>
                    <Typography sx={styles.signInButtonTextGmail}>Gmail Sign In</Typography>
                </Button>
                <Box
                    sx={{
                        display: 'flex',
                        marginTop: '50px',
                        alignItems: 'center',
                        gap: '10px',
                    }}>
                    <Button
                        variant="outlined"
                        sx={styles.signInButtonUofA}
                        onClick={() => handleSignIn(LoginLocation.UniversityOfAlberta)}
                        disabled={isLoading}>
                        <Avatar src={signInButtonLogo} sx={styles.signInButtonLogo} alt="Sign In Button Logo" />
                        <Typography sx={styles.signInButtonTextUofA}>Sign in with CCID</Typography>
                    </Button>
                    <Tooltip
                        title="Use this if you're borrowing a dish on the University of Alberta campus"
                        placement="top"
                        arrow
                        enterTouchDelay={0}>
                        <HelpOutline sx={{ color: '#68B49A' }} />
                    </Tooltip>
                </Box>
            </Box>
        </Box>
    )
}

export const styles = {
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

    rootMobile: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundImage: `url(${MobileBackground})`,
        backgroundSize: 'cover',
    },

    logoMobile: {
        width: '42vw',
        height: '34vw',
        marginTop: '130px',
        marginBottom: '15px',
        backgroundImage: `url(${mobileLogo})`,
        backgroundSize: 'cover',
    },

    logoDesktop: {
        width: '28vw',
        height: '28vw',
        borderRadius: '10px',
        marginRight: '50px',
        backgroundImage: `url(${desktopLogo})`,
        backgroundSize: 'cover',
    },

    rightFrameMobile: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: '15px',
        alignItems: 'center',
        justifyContent: 'center',
    },

    rightFrameDesktop: {
        display: 'flex',
        flexDirection: 'column',
        marginLeft: '50px',
        justifyContent: 'center',
    },

    dishZeroHeading: {
        fontSize: '3.5rem',
        fontWeight: 'bold',
        fontFamily: 'Poppins, sans-serif',
        color: '#4c4242',
    },

    subheading: {
        fontSize: '1.25rem',
        fontFamily: 'Poppins, sans-serif',
        color: '#4c4242',
        marginTop: '7px',
        paddingLeft: 0.5,
        paddingRight: 2.5,
        textAlign: 'right',
    },
    signInButtonGmail: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '300px',
        height: '50px',
        borderRadius: '20px',
        backgroundColor: '#68B49A',
        borderWidth: '0',
        marginTop: '50px',
        '&:hover': {
            backgroundColor: '#68B49A',
        },
    },

    signInButtonUofA: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '250px',
        height: '40px',
        borderRadius: '20px',
        borderWidth: '3px',
        borderColor: '#68B49A',
        textColor: '#68B49A',
        variant: 'outlined',
        '&:hover': {
            borderWidth: '3px',
            borderColor: '#68B49A',
            backgroundColor: '#68B49A22',
        },
    },

    signInButtonLogo: {
        width: '25px',
        height: '30px',
        marginRight: '7px',
    },

    signInButtonTextGmail: {
        fontSize: '1.025rem',
        fontFamily: 'Poppins, sans-serif',
        color: 'white',
        marginLeft: '7px',
    },
    
    signInButtonTextUofA: {
        fontSize: '1.025rem',
        fontFamily: 'Poppins, sans-serif',
        color: '#68B49A',
        marginLeft: '7px',
    }
}
