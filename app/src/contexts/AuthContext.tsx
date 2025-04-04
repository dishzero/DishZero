/*eslint-disable*/

import { createContext, useContext, useEffect, useState } from 'react'
import { auth, googleAuthProvider, provider } from '../firebase'
import { getIdToken, onAuthStateChanged, signInWithPopup } from 'firebase/auth'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useNavigate } from 'react-router-dom'
import LoadingSpinner from '../widgets/loadingSpinner'

type User = {
    id: string
    role: string
    email: string
}

export const enum LoginLocation {
    UniversityOfAlberta = 'University of Alberta',
    Other = 'Other',
}

type AuthContextValue = {
    currentUser: User | null
    sessionToken: string
    login: (loginLocation: LoginLocation) => Promise<void>
    logout: () => Promise<void>
}

// default values to avoid type errors
const AuthContext = createContext<AuthContextValue>({
    currentUser: null,
    sessionToken: '',
    login: async (loginLocation = LoginLocation.Other) => {
        console.log('placeholder')
    },
    logout: async () => {
        console.log('placeholder')
    },
})

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [sessionToken, setSessionToken] = useState<string>(() => {
        const cookie = Cookies.get('session-token')
        return cookie ? cookie : null
    })
    const [loading, setLoading] = useState(true)
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)

    onAuthStateChanged(auth, (user) => {
        if (loading) {
            setLoading(false)
        }
    })

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768)
        }

        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const navigate = useNavigate()

    useEffect(() => {
        if (loading) {
            updateCookie()
        }
    }, [])

    async function updateCookie() {
        // only run once on app start to get information about the current user
        // will run again if current user logs out
        if (currentUser !== null) {
            if (loading) {
                setLoading(false)
            }
            return
        }

        if (sessionToken) {
            try {
                const response = await axios.get(`/api/users/session`, {
                    baseURL: `${process.env.REACT_APP_BACKEND_ADDRESS}`,
                    headers: {
                        'x-api-key': `${process.env.REACT_APP_API_KEY}`,
                        'session-token': sessionToken!,
                    },
                })

                const data = response.data.user
                if (response && response.status === 200) {
                    console.log('setting current user')
                    console.log(data)
                    // if it gets here then current user should be null
                    setCurrentUser({
                        id: data?.id,
                        role: data?.role,
                        email: data?.email,
                    })
                    setLoading(false)
                } else {
                    console.log('no token found or something')
                    logout()
                }
            } catch (error: any) {
                console.error('Failed to call authentication')
                console.error(error)
                if (error.response?.status === 401) {
                    console.log('user unauthorised')
                    logout()
                }
            }
        }
    }

    async function login(loginLocation: LoginLocation) {
        try {
            let credentials
            let idToken
            if (loginLocation === LoginLocation.UniversityOfAlberta) {
                credentials = await signInWithPopup(auth, provider)
                idToken = await getIdToken(credentials.user)
                if (!credentials.user.email?.match('@ualberta.ca')) {
                    credentials.user?.delete()
                    alert('Please login with your University of Alberta CCID')
                    logout()
                    return
                }
            } else {
                credentials = await signInWithPopup(auth, googleAuthProvider)
                idToken = await getIdToken(credentials.user)
            }
            const res = await axios.post(
                `/api/auth/login/`,
                { idToken: idToken },
                {
                    headers: {
                        'x-api-key': `${process.env.REACT_APP_API_KEY}`,
                    },
                    baseURL: `${process.env.REACT_APP_BACKEND_ADDRESS}`,
                },
            )

            const { data } = res
            setSessionToken(data.session)
            Cookies.set('session-token', data.session, { expires: 90 })
            const newUser = data?.user
            if (newUser !== currentUser) {
                setCurrentUser({
                    ...data.user,
                })
            }

            navigate('/home')
        } catch (error: any) {
            console.log(error.message)
            logout()
        }
    }

    async function logout() {
        if (sessionToken) {
            const res = await axios.post(
                `/api/auth/logout/`,
                {},
                {
                    baseURL: `${process.env.REACT_APP_BACKEND_ADDRESS}`,
                    headers: {
                        'x-api-key': `${process.env.REACT_APP_API_KEY}`,
                        'session-token': sessionToken!,
                    },
                },
            )
            auth.signOut()
            console.log('logout response', res)
            setSessionToken('')
            setCurrentUser(null)
            Cookies.remove('session-token')
        }
        navigate('/login')
        setLoading(false)
    }

    const value = {
        currentUser,
        sessionToken,
        login,
        logout,
    }
    return (
        <AuthContext.Provider value={value}>
            {loading ? <LoadingSpinner isMobile={isMobile} /> : children}
        </AuthContext.Provider>
    )
}
