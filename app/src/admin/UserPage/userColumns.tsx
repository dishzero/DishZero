import EditIcon from '@mui/icons-material/ArrowDropDown';
import { Box, IconButton } from '@mui/material';
import { GridColDef, useGridApiContext } from '@mui/x-data-grid';

import { UserRole } from '../types';

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
            const apiRef = useGridApiContext();

            const handleEditClick = (event: React.MouseEvent) => {
                event.stopPropagation();
                apiRef.current.startCellEditMode({ id: params.id, field: 'role' });
            };

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
            );
        },
    },
];
