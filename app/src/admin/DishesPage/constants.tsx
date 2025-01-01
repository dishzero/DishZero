import { Button, Chip, Tooltip, styled } from '@mui/material'
import { GridColDef } from '@mui/x-data-grid'
import { capitalizeFirstLetter } from '../AdminHome/constants'

export type Dish = {
    id: string
    qid: number
    type: string
    status: DishStatus // update DishStatus enum
    condition?: DishCondition // keep this for now
    timesBorrowed: number
    registered: string
    userId: string | null
    borrowedAt: string | null // rename to dateBorrowed?
    // notes: string | null // use to add notes to dish -> future work?
}

export function tagColor(text) {
    switch (text) {
        case 'mug':
            return '#496EA5'
        case 'dish':
            return '#68B49A'
        case 'borrowed':
            return '#68B49A'
        case 'returned':
            return '#29604D'
        case 'available':
            return '#29604D'
        case 'overdue':
            return '#BF4949'
        case 'broken':
            return '#BF4949'
        case 'lost':
            return '#BF4949'
        case 'unavailable':
            return '#BF4949'
        default:
            return ''
    }
}

export enum DishStatus {
    borrowed = 'borrowed',
    available = 'available',
    overdue = 'overdue',
    broken = 'broken',
    lost = 'lost',
    unavailable = 'unavailable',
}

export enum DishCondition {
    smallChip = 'small_crack_chip',
    largeCrack = 'large_crack_chunk',
    shattered = 'shattered',
    good = 'good',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const StyledOutlinedButton = styled(Button)(({ theme }) => ({
    borderRadius: '30px',
    border: `2px solid !important`,
    padding: '0.5rem 2rem !important',
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const StyledContainedButton = styled(Button)(({ theme }) => ({
    borderRadius: '30px',
    color: 'white',
    padding: '0.5rem 2rem',
    margin: '1rem',
}))

export const DishConditionColors = {
    good: '#68B49A',
    small_crack_chip: '#BF4949',
    large_crack_chunk: '#BF4949',
    shattered: '#BF4949',
}

export const generateColumns = (dishTypes: string[]): GridColDef[] => [
    { field: 'qid', headerName: 'Dish Id', minWidth: 100, maxWidth: 100, flex: 1 },
    {
        field: 'type',
        headerName: 'Dish Type',
        minWidth: 100,
        maxWidth: 150,
        flex: 1,
        type: 'singleSelect',
        valueOptions: Object.values(dishTypes) as string[],
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
        field: 'status',
        headerName: 'Status',
        minWidth: 150,
        maxWidth: 150,
        flex: 1,
        editable: true,
        type: 'singleSelect',
        valueOptions: Object.values(DishStatus) as string[],
        valueFormatter({ value }: { value: string }) {
            return capitalizeFirstLetter(value)
        },
        renderCell(params) {
            const color = tagColor(params.value) ?? 'inherit'
            return (
                <>
                    {params && (
                        // TODO: add a border here same as the role from users page!
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
    { field: 'userId', headerName: 'Current User', minWidth: 200, maxWidth: 250, flex: 1 },
    {
        field: 'borrowedAt',
        headerName: 'Date Borrowed',
        minWidth: 200,
        maxWidth: 250,
        flex: 1,
        type: 'date',
        valueFormatter({ value }: { value: string }) {
            return value ? new Date(value).toLocaleString() : null
        },
        renderCell(params) {
            if (!params || !params.value || !params.formattedValue) return null
            const timeSinceBorrowed = Date.now() - new Date(params.value).getTime()
            const daysDifference = Math.floor(timeSinceBorrowed / (1000 * 3600 * 24))
            const overdue = daysDifference >= 2

            if (overdue) {
                return (
                    <Tooltip title={`${daysDifference} days`} placement="top" arrow>
                        <div style={{ color: '#BF4949' }}>{params.formattedValue}</div>
                    </Tooltip>
                )
            }
            return <div>{params.formattedValue}</div>
        },
    },
    {
        field: 'timesBorrowed',
        headerName: 'Times Borrowed',
        minWidth: 100,
        maxWidth: 150,
        flex: 1,
        type: 'number',
        align: 'left',
        headerAlign: 'left',
    },
    {
        field: 'registered',
        headerName: 'Date Added',
        minWidth: 150,
        maxWidth: 250,
        flex: 1,
        type: 'date',
        valueFormatter({ value }: { value: string }) {
            return new Date(value).toLocaleDateString()
        },
    },
]

export const mockDishes: Array<Dish> = [
    {
        id: '1',
        qid: 1,
        type: 'mug',
        status: DishStatus.available,
        condition: DishCondition.good,
        timesBorrowed: 2,
        registered: '2024-02-29T12:57:05.733Z',
        userId: null,
        borrowedAt: null,
    },
    {
        id: '1',
        qid: 1,
        type: 'mug',
        status: DishStatus.borrowed,
        condition: DishCondition.good,
        timesBorrowed: 2,
        registered: '2024-02-29T12:57:05.733Z',
        userId: 'wiskel@ualberta.ca',
        borrowedAt: '2024-02-29T22:57:05.733Z',
    },
]
