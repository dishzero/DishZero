import { Chip } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import { tagColor } from '../DishesPage/constants'

export const capitalizeFirstLetter = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export type Transaction = {
    id: string
    qid: string
    dishType: string
    transactionType: string
    userEmail: string
    timestamp: string
}

export enum TransactionType {
    BORROWED = 'borrowed',
    RETURNED = 'returned',
}

export const generateTransactionColumns = (dishTypes: string[]): GridColDef[] => [
    { field: 'qid', headerName: 'Dish Id', minWidth: 150, maxWidth: 150, flex: 1 },
    {
        field: 'dishType',
        headerName: 'Dish Type',
        minWidth: 150,
        maxWidth: 200,
        flex: 1,
        type: 'singleSelect',
        valueOptions: dishTypes,
        valueFormatter({ value }: { value: string }) {
            return capitalizeFirstLetter(value)
        },
        renderCell(params) {
            const color = tagColor(params.value) ?? 'inherit'
            return (
                <>
                    {params && (
                        <Chip
                            variant="outlined"
                            sx={{
                                color: `${color}`,
                                border: `2px solid ${color}`,
                            }}
                            label={params.formattedValue}
                        />
                    )}
                </>
            )
        },
    },
    {
        field: 'transactionType',
        headerName: 'Transaction Type',
        minWidth: 150,
        maxWidth: 200,
        flex: 1,
        type: 'singleSelect',
        valueOptions: Object.values(TransactionType),
        valueFormatter({ value }: { value: string }) {
            return capitalizeFirstLetter(value)
        },
        renderCell(params) {
            const color = tagColor(params.value) ?? 'inherit'
            return (
                <>
                    {params && (
                        <Chip
                            variant="outlined"
                            sx={{
                                color: `${color}`,
                                border: `2px solid ${color}`,
                            }}
                            label={params.formattedValue}
                        />
                    )}
                </>
            )
        },
    },
    { field: 'userEmail', headerName: 'User', minWidth: 200, maxWidth: 250, flex: 1 },
    {
        field: 'timestamp',
        headerName: 'Transaction Date',
        minWidth: 200,
        maxWidth: 300,
        flex: 1,
        type: 'date',
        valueFormatter({ value }: { value: string }) {
            return value ? new Date(value).toLocaleString() : null
        },
    },
]

export const mockTransactions: Array<any> = [
    {
        id: 'fu0YMMoe5x3tiN89DG81',
        dish: {
            id: 'GN8OBatk1sqPI6XOkbS0',
            qid: 273,
            type: 'mug',
        },
        returned: {
            condition: 'good',
            timestamp: '2024-02-29T22:57:05.733Z',
            email: 'wiskel@ualberta.ca',
        },
        timestamp: '2024-02-13T00:18:05.450Z',
        user: {
            email: 'smah2@ualberta.ca',
            id: 'yxtEmER3mNaj65uHTdOOaKtZGTm2',
            role: 'customer',
        },
    },
    {
        id: 'fu0YMMoe5x3tiN89DG82',
        dish: {
            id: 'RUIqaJHTrntV5sC8TKhc',
            qid: 137,
            type: 'container',
        },
        returned: {
            condition: 'good',
            timestamp: '',
        },
        timestamp: '2024-12-17T20:06:56.858Z',
        user: {
            email: 'mimi2@ualberta.ca',
            id: 'P4DZn7d0hZhPSNqsQaGGFvzPpIA3',
            role: 'customer',
        },
    },
]
