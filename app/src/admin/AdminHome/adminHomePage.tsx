import { useAuth } from '../../contexts/AuthContext'
import adminApi from '../adminApi'
import { Transaction } from './constants'
import { Box } from '@mui/material'
import { useEffect, useState } from 'react'
import AdminHomeHeader from './adminHomeHeader'
import AdminTransactionsTable from './transactionsTable'

function splitTransactions(transactionData) {
    const inUseTransactions: Transaction[] = []
    let inUse = false
    const transactionRows = transactionData.flatMap((transaction) => {
        const list: Transaction[] = []
        inUse = true

        if (transaction.returned.timestamp && transaction.returned.timestamp != '') {
            // get the return transaction
            list.push({
                id: transaction.id,
                qid: transaction.dish.qid,
                dishType: transaction.dish.type,
                userEmail: transaction.returned.email ?? 'dishzero@ualberta.ca',
                transactionType: 'returned',
                timestamp: transaction.returned.timestamp,
            })
            inUse = false
        }
        // get the borrow transaction
        list.push({
            id: transaction.id,
            qid: transaction.dish.qid,
            dishType: transaction.dish.type,
            userEmail: transaction.user.email,
            transactionType: 'borrowed',
            timestamp: transaction.timestamp,
        })
        if (inUse) {
            inUseTransactions.push({
                id: transaction.id,
                qid: transaction.dish.qid,
                dishType: transaction.dish.type,
                userEmail: transaction.user.email,
                transactionType: 'borrowed',
                timestamp: transaction.timestamp,
            })
        }
        return list
    }) as Transaction[]
    return { transactionRows, inUseTransactions }
}

export default function AdminHomePage() {
    const { sessionToken } = useAuth()

    const [filteredRows, setFilteredRows] = useState<Transaction[]>([]) // rows visible in table
    const [allRows, setAllRows] = useState<Transaction[]>([]) // all rows fetched from backend
    const [inUseTransactions, setInUseTransactions] = useState<Transaction[]>([])
    const [loadingTransactions, setLoadingTransactions] = useState(true)
    const [dishTypes, setDishTypes] = useState<string[]>([])

    const fetchTransactions = async () => {
        let transactionData: Transaction[] = []
        let inUseTransactions: Transaction[] = []
        if (sessionToken) {
            setLoadingTransactions(true)
            const result = splitTransactions(await adminApi.getTransactions(sessionToken))
            // const result = splitTransactions(mockTransactions)
            transactionData = result.transactionRows
            inUseTransactions = result.inUseTransactions
            setLoadingTransactions(false)
        }
        setAllRows(transactionData)
        setInUseTransactions(inUseTransactions)
    }

    const fetchDishTypes = async () => {
        let dishTypes: string[] = []
        if (sessionToken) {
            dishTypes = await adminApi.getDishTypes(sessionToken)
        }
        setDishTypes(dishTypes)
    }

    useEffect(() => {
        fetchTransactions()
        fetchDishTypes()
    }, [])

    useEffect(() => {
        setFilteredRows(allRows)
    }, [allRows])

    return (
        <Box sx={{ m: '20px', flex: 1 }}>
            <AdminHomeHeader
                allRows={allRows}
                setFilteredRows={setFilteredRows}
                inUseTransactions={inUseTransactions}
            />
            <AdminTransactionsTable
                filteredRows={filteredRows}
                loadingTransactions={loadingTransactions}
                dishTypes={dishTypes}
            />
        </Box>
    )
}
