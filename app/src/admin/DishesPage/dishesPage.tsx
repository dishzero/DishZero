import { useAuth } from '../../contexts/AuthContext'
import adminApi from '../adminApi'
import { Dish } from './constants'
import AdminDishesHeader from './dishesHeader'
import AdminDishesTable from './dishesTable'
import { Box } from '@mui/material'
import { useEffect, useState } from 'react'

export default function AdminDishesPage() {
    const { sessionToken } = useAuth()

    const [filteredRows, setFilteredRows] = useState<Dish[]>([]) // rows visible in table
    const [allRows, setAllRows] = useState<Dish[]>([]) // all rows fetched from backend
    const [dishTypes, setDishTypes] = useState<string[]>([])
    const [dishVendors, setDishVendors] = useState<Record<string, string[]>>({})
    const [loadingDishes, setLoadingDishes] = useState(true)

    const fetchDishes = async () => {
        let dishData: Dish[] = []
        if (sessionToken) {
            setLoadingDishes(true)
            dishData = await adminApi.getAllDishes(sessionToken, true)
            setLoadingDishes(false)
        }
        setAllRows(dishData)
    }

    const fetchDishTypes = async () => {
        let dishTypes: string[] = []
        if (sessionToken) {
            dishTypes = await adminApi.getDishTypes(sessionToken)
        }
        setDishTypes(dishTypes)
    }

    const fetchDishVendors = async () => {
        let dishVendors: Record<string, string[]> = {}
        if (sessionToken) {
            dishVendors = await adminApi.getDishVendors(sessionToken)
        }
        setDishVendors(dishVendors)
    }

    useEffect(() => {
        fetchDishes()
        fetchDishTypes()
        fetchDishVendors()
    }, [])

    // update visible rows if all rows changes
    useEffect(() => {
        setFilteredRows(allRows)
    }, [allRows])

    return (
        <Box sx={{ m: '20px', flex: 1 }}>
            <AdminDishesHeader
                allRows={allRows}
                setFilteredRows={setFilteredRows}
                dishTypes={dishTypes}
                fetchDishTypes={fetchDishTypes}
                fetchDishes={fetchDishes}
            />
            <AdminDishesTable
                filteredRows={filteredRows}
                fetchDishes={fetchDishes}
                loadingDishes={loadingDishes}
                dishTypes={dishTypes}
                dishVendors={dishVendors}
            />
        </Box>
    )
}
