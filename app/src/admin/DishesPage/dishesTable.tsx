import { useState } from 'react'
import { Dish, StyledContainedButton, StyledOutlinedButton, generateColumns } from './constants'
import { useAuth } from '../../contexts/AuthContext'
import adminApi from '../adminApi'
import CustomToolbar from '../DataGrid/customToolbar'
import { StyledDataGrid } from '../DataGrid/constants'
import NoResultsOverlay from '../DataGrid/noResultsOverlay'
import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material'
import { GridOverlay, GridRowId, GridRowModel } from '@mui/x-data-grid'
import { useSnackbar } from 'notistack'
import CustomDialogTitle from './customDialogTitle'
import { BallTriangle } from 'react-loader-spinner'

interface Props {
    filteredRows: Dish[]
    dishTypes: string[]
    dishVendors: Record<string, string[]>
    loadingDishes: boolean
    fetchDishes: () => void
}

export default function AdminDishesTable({ filteredRows, dishTypes, dishVendors, loadingDishes, fetchDishes }: Props) {
    const { sessionToken } = useAuth()
    const [selectedRows, setSelectedRows] = useState<GridRowId[]>([])
    const [open, setOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const { enqueueSnackbar } = useSnackbar()

    const handleDishDelete = async function () {
        if (sessionToken) {
            setDeleting(true)
            const response = await adminApi.deleteDishes(sessionToken, selectedRows)

            if (response && response.status != 200) {
                enqueueSnackbar(`Failed to delete dishes: ${response.status}`, { variant: 'error' })
            } else {
                setOpen(false)
                setSelectedRows([])
                enqueueSnackbar('Successfully deleted dishes', { variant: 'success' })
                fetchDishes()
            }
            setDeleting(false)
        }
    }

    const modifyDishStatus = async (id: string, oldStatus: string, newStatus: string) => {
        if (sessionToken) {
            const response = await adminApi.modifyDishStatus(sessionToken, id, oldStatus, newStatus)
            return response
        }
    }

    // must return the GridRowModel to update the internal state of the grid
    const processRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {
        if (newRow.status !== oldRow.status) {
            const oldStatus = oldRow.status
            const { status: newStatus, id } = newRow
            const response = (await modifyDishStatus(id, oldStatus, newStatus)) as any

            if (response && response?.status !== 200) {
                enqueueSnackbar(
                    `Failed to modify dish status: ${response.message}; ${response.response.data.message}`,
                    { variant: 'error' },
                )
                return oldRow
            } else {
                enqueueSnackbar(`Successfully modified dish status`, { variant: 'success' })
                return newRow
            }
        }

        // if no status change, just return the old row
        return oldRow
    }

    return (
        <>
            <StyledDataGrid
                loading={loadingDishes}
                rows={filteredRows}
                columns={generateColumns(dishTypes, dishVendors)}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                }}
                sx={{ flex: 1, minWidth: 1300, maxWidth: 1600 }}
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
                    noRowsOverlay: () => <NoResultsOverlay value={'Dishes'} />,
                    noResultsOverlay: () => <NoResultsOverlay value={'Dishes'} />,
                    toolbar: () => (
                        <CustomToolbar>
                            <Button disabled={selectedRows.length == 0} onClick={() => setOpen(true)} color="secondary">
                                Delete {selectedRows.length} {selectedRows.length == 1 ? 'dish' : 'dishes'}
                            </Button>
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
                getRowId={(row) => row.qid}
                experimentalFeatures={{ ariaV7: true }}
                onRowSelectionModelChange={(newSelection) => {
                    setSelectedRows(newSelection)
                }}
            />
            <Dialog
                open={open}
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: '20px',
                    },
                }}>
                <CustomDialogTitle
                    open={open}
                    setOpen={setOpen}
                    dialogTitle={`Confirm deletion of ${selectedRows.length} ${
                        selectedRows.length == 1 ? 'dish' : 'dishes'
                    } `}
                    loading={deleting}>
                    <DialogContent sx={{ minWidth: '420px' }}>
                        <Box width="100%" sx={{ textAlign: 'center' }}>
                            <Typography variant="body1" sx={{ color: (theme) => theme.palette.warning.main }}>
                                This cannot be undone!
                            </Typography>
                            <StyledContainedButton
                                variant="contained"
                                onClick={() => handleDishDelete()}
                                sx={{ width: '90%' }}
                                disabled={deleting}>
                                Delete
                            </StyledContainedButton>
                            <StyledOutlinedButton sx={{ width: '90%' }} onClick={() => setOpen(false)}>
                                Exit
                            </StyledOutlinedButton>
                        </Box>
                    </DialogContent>
                </CustomDialogTitle>
            </Dialog>
        </>
    )
}
