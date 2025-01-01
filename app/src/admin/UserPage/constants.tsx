import { GridColDef, useGridApiContext } from '@mui/x-data-grid'
import { Box, IconButton } from '@mui/material'
import EditIcon from '@mui/icons-material/ArrowDropDown'

export interface User {
    userId: string
    email: string
    inUse: number
    overdue: number
    role: string // TODO: should this be an enum?
}

export enum UserRole {
    customer = 'customer',
    admin = 'admin',
    volunteer = 'volunteer',
}

export const userColumns: GridColDef[] = [
    { field: 'email', headerName: 'Email Address', minWidth: 300, maxWidth: 450, flex: 1 },
    {
        field: 'inUse',
        headerName: 'In Use',
        minWidth: 150,
        maxWidth: 200,
        flex: 1,
        type: 'number',
        align: 'left',
        headerAlign: 'left',
    },
    {
        field: 'overdue',
        headerName: 'Overdue',
        minWidth: 150,
        maxWidth: 200,
        flex: 1,
        type: 'number',
        align: 'left',
        headerAlign: 'left',
    },
    {
        field: 'role',
        headerName: 'Role',
        minWidth: 150,
        maxWidth: 300,
        flex: 1,
        editable: true,
        type: 'singleSelect',
        valueOptions: Object.values(UserRole) as string[],
        renderCell: (params) => {
            const apiRef = useGridApiContext()

            const handleEditClick = (event) => {
                event.stopPropagation() // Prevent row selection
                apiRef.current.startCellEditMode({ id: params.id, field: 'role' })
            }

            return (
                <Box
                    sx={{
                        justifyContent: 'space-between',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        color:
                            params.formattedValue.toLowerCase() === UserRole.volunteer ||
                            params.formattedValue.toLowerCase() === UserRole.admin
                                ? 'primary.main'
                                : 'inherit',
                    }}>
                    {params.formattedValue}
                    <IconButton onClick={handleEditClick} size="small">
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Box>
            )
        },
    },
]

export const mockUsers: Array<User> = [
    {
        userId: '1',
        email: 'AAAAA@ualberta.ca',
        inUse: 2,
        overdue: 30,
        role: UserRole.customer,
    },
    {
        userId: '2',
        email: 'hello1@ualberta.ca',
        inUse: 3,
        overdue: 30,
        role: UserRole.volunteer,
    },
    {
        userId: '3',
        email: 'hello2admin@ualberta.ca',
        inUse: 2,
        overdue: 12,
        role: UserRole.admin,
    },
    {
        userId: '4',
        email: 'BBBB@ualberta.ca',
        inUse: 17,
        overdue: 30,
        role: UserRole.customer,
    },
    {
        userId: '5',
        email: 'hello4@ualberta.ca',
        inUse: 2,
        overdue: 42,
        role: UserRole.volunteer,
    },
    {
        userId: '6',
        email: 'CCCC@ualberta.ca',
        inUse: 2,
        overdue: 30,
        role: UserRole.customer,
    },
    {
        userId: '7',
        email: 'hello6@ualberta.ca',
        inUse: 123,
        overdue: 30,
        role: UserRole.customer,
    },
]
