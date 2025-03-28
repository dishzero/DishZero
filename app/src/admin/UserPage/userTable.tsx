import { User, userColumns } from './constants'
import { useAuth } from '../../contexts/AuthContext'
import adminApi from '../adminApi'
import CustomToolbar from '../DataGrid/customToolbar'
import { StyledDataGrid } from '../DataGrid/constants'
import NoResultsOverlay from '../DataGrid/noResultsOverlay'
import { GridOverlay, GridRowModel } from '@mui/x-data-grid'
import { useSnackbar } from 'notistack'
import { BallTriangle } from 'react-loader-spinner'

interface Props {
    filteredRows: User[]
    loadingUsers: boolean
}

export default function AdminUserTable({ filteredRows, loadingUsers }: Props) {
    const { sessionToken } = useAuth()

    const { enqueueSnackbar } = useSnackbar()

    const modifyUserRole = async (userId: string, newRole: string, email: string) => {
        if (sessionToken) {
            const response = await adminApi.modifyRole(sessionToken, userId, newRole, email)

            return response
        }
    }

    // must return the GridRowModel to update the internal state of the grid
    const processRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {
        if (newRow.role !== oldRow.role) {
            // const oldRole = oldRow.role
            const { role: newRole, userId, email } = newRow
            const response = (await modifyUserRole(userId, newRole, email)) as any

            if (response && response?.status !== 200) {
                enqueueSnackbar(`Failed to modify user: ${response.message}; ${response.response.data.message}`, {
                    variant: 'error',
                })
                return oldRow
            } else {
                enqueueSnackbar(`Successfully updated user`, { variant: 'success' })
                return newRow
            }
        }

        // if no status change, just return the old row
        return oldRow
    }

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
    )
}
