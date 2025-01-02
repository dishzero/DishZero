import { Box, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { Transaction } from './constants'
import { searchGrid } from '../DataGrid/constants'
import StyledSearchBox from '../DataGrid/searchBox'
import AdminStatContainer from './statContainer'

function calculateStats(allRows: Transaction[], inUseTransactions: Transaction[]) {
    const totalBorrowed = (allRows.length - inUseTransactions.length) / 2 + inUseTransactions.length
    const currentlyInUse = inUseTransactions.length

    const lost = inUseTransactions.filter(
        (transaction) => Math.floor(Date.now() - new Date(transaction.timestamp).getTime() / (1000 * 3600 * 24)) > 30,
    ).length
    const overdue =
        inUseTransactions.filter(
            (transaction) =>
                Math.floor(Date.now() - new Date(transaction.timestamp).getTime() / (1000 * 3600 * 24)) > 2,
        ).length - lost
    return { 'Total Borrowed': totalBorrowed, 'Currently In Use': currentlyInUse, Overdue: overdue, Lost: lost }
}

interface Props {
    allRows: Transaction[]
    setFilteredRows: React.Dispatch<React.SetStateAction<Transaction[]>>
    inUseTransactions: Transaction[]
}

export default function AdminHomeHeader({ allRows, setFilteredRows, inUseTransactions }: Props) {
    const [searchQuery, setSearchQuery] = useState('')
    const [stats, setStats] = useState({})

    const handleSearch = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const newSearchQuery = e.target.value
        searchGrid(newSearchQuery, allRows, setFilteredRows)
        setSearchQuery(newSearchQuery)
    }

    useEffect(() => {
        setStats(calculateStats(allRows, inUseTransactions))
    }, [allRows, inUseTransactions])

    return (
        <Box sx={{ maxWidth: 1300 }}>
            <Box display="flex">
                {Object.entries(stats).map(([statTitle, statValue]) => (
                    <AdminStatContainer key={statTitle} statTitle={statTitle} statValue={statValue as number} />
                ))}
            </Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mt: '2rem' }}>
                Transactions
            </Typography>
            <Box display="flex" flexDirection="row" sx={{ mb: '1rem', justifyContent: 'space-between' }}>
                <StyledSearchBox searchQuery={searchQuery} handleSearch={handleSearch} />
            </Box>
        </Box>
    )
}
