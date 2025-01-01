import { Box, Typography } from '@mui/material'
import { useState } from 'react'
import { searchGrid } from '../DataGrid/constants'
import StyledSearchBox from '../DataGrid/searchBox'
import { User } from './constants'

interface Props {
    allRows: User[]
    setFilteredRows: React.Dispatch<React.SetStateAction<User[]>>
}

export default function AdminUserHeader({ allRows, setFilteredRows }: Props) {
    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const newSearchQuery = e.target.value
        searchGrid(newSearchQuery, allRows, setFilteredRows)
        setSearchQuery(newSearchQuery)
    }

    return (
        <Box sx={{ maxWidth: 1300 }}>
            <Typography variant="h4" fontWeight="bold">
                Users
            </Typography>
            <Box display="flex" flexDirection="row" sx={{ mb: '1rem', justifyContent: 'space-between' }}>
                <StyledSearchBox searchQuery={searchQuery} handleSearch={handleSearch} />
            </Box>
        </Box>
    )
}
