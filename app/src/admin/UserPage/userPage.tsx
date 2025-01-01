import { useAuth } from '../../contexts/AuthContext'
import adminApi from '../adminApi'
import { User } from './constants'
import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import AdminUserHeader from './userHeader'
import AdminUserTable from './userTable'

export default function AdminUserPage() {
    const { sessionToken } = useAuth()

    const [filteredRows, setFilteredRows] = useState<User[]>([]) // rows visible in table
    const [allRows, setAllRows] = useState<User[]>([]) // all rows fetched from backend
    const [loadingUsers, setLoadingUsers] = useState(true)

    const fetchUsers = async () => {
        let userData: User[] = []
        if (sessionToken) {
            setLoadingUsers(true)
            userData = await adminApi.getDishesStatusForEachUser(sessionToken)
            // userData = mockUsers
            setLoadingUsers(false)
        }
        setAllRows(userData)
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    // update visible rows if all rows changes
    useEffect(() => {
        setFilteredRows(allRows)
    }, [allRows])

    return (
        <Box sx={{ m: '20px', flex: 1 }}>
            <AdminUserHeader allRows={allRows} setFilteredRows={setFilteredRows} />
            <AdminUserTable filteredRows={filteredRows} loadingUsers={loadingUsers} />
        </Box>
    )
}
