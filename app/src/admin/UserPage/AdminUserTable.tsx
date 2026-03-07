import EditIcon from '@mui/icons-material/ArrowDropDown';
import { Box, IconButton } from '@mui/material';
import { GridColDef, GridOverlay, GridRowModel, useGridApiContext } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { BallTriangle } from 'react-loader-spinner';

import { useAuth } from '../../contexts/AuthContext';
import adminApi from '../adminApi';
import StyledDataGrid from '../components/StyledDataGrid';
import CustomToolbar from '../DataGrid/CustomToolbar';
import NoResultsOverlay from '../DataGrid/NoResultsOverlay';
import { User, UserRole } from '../types';

interface Props {
    filteredRows: User[];
    loadingUsers: boolean;
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

export default function AdminUserTable({ filteredRows, loadingUsers }: Props) {
    const { sessionToken } = useAuth();

    const { enqueueSnackbar } = useSnackbar();

    const modifyUserRole = async (userId: string, newRole: string, email: string) => {
        if (sessionToken) {
            const response = await adminApi.modifyRole(sessionToken, userId, newRole, email);

            return response;
        }
    };

    // must return the GridRowModel to update the internal state of the grid
    const processRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {
        if (newRow.role !== oldRow.role) {
            // const oldRole = oldRow.role
            const { role: newRole, userId, email } = newRow;
            const response = (await modifyUserRole(userId, newRole, email)) as any;

            if (response && response?.status !== 200) {
                enqueueSnackbar(`Failed to modify user: ${response.message}; ${response.response.data.message}`, {
                    variant: 'error',
                });
                return oldRow;
            } else {
                enqueueSnackbar(`Successfully updated user`, { variant: 'success' });
                return newRow;
            }
        }

        // if no status change, just return the old row
        return oldRow;
    };

    return (
        <>
            <StyledDataGrid
                loading={loadingUsers}
                rows={filteredRows}
                columns={userColumns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                }}
                sx={{ flex: 1, minWidth: 750, maxWidth: 1150 }}
                slots={{
                    loadingOverlay: () => (
                        <GridOverlay style={{ flexDirection: 'column', paddingTop: 10, paddingBottom: 10 }}>
                            <BallTriangle
                                height={80}
                                width={80}
                                radius={5}
                                color="#4fa94d"
                                ariaLabel="ball-triangle-loading"
                                visible={true}
                            />
                        </GridOverlay>
                    ),
                    noRowsOverlay: () => <NoResultsOverlay value={'Users'} />,
                    noResultsOverlay: () => <NoResultsOverlay value={'Users'} />,
                    toolbar: () => (
                        <CustomToolbar>
                            {<></>}
                            {/* <Button disabled={selectedRows.length == 0} onClick={() => setOpen(true)} color="secondary">
                                Delete {selectedRows.length} {selectedRows.length == 1 ? 'dish' : 'dishes'}
                            </Button> */}
                        </CustomToolbar>
                    ),
                }}
                slotProps={{
                    panel: {
                        placement: 'auto-start',
                    },
                }}
                pageSizeOptions={[5, 10, 15]}
                autoHeight
                checkboxSelection
                processRowUpdate={processRowUpdate}
                getRowId={(row) => row.userId}
                experimentalFeatures={{ ariaV7: true }}
                // onRowSelectionModelChange={(newSelection) => {
                //     setSelectedRows(newSelection)
                // }}
            />
        </>
    );
}
