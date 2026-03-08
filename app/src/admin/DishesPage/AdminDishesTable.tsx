import { Box, Button, Chip, CircularProgress, Dialog, DialogContent, Tooltip, Typography } from '@mui/material';
import { GridColDef, GridOverlay, GridRowId, GridRowModel } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';
import { Dish, DishStatus } from '../../types';
import adminApi from '../adminApi';
import { AdminContainedButton, AdminOutlinedButton } from '../components/AdminButtons';
import AdminDataGrid from '../components/AdminDataGrid';
import CustomToolbar from '../DataGrid/CustomToolbar';
import NoResultsOverlay from '../DataGrid/NoResultsOverlay';
import { capitalizeFirstLetter, tagColor } from '../utils';
import CustomDialogTitle from './CustomDialogTitle';

interface Props {
    filteredRows: Dish[];
    dishTypes: string[];
    dishVendors: Record<string, string[]>;
    loadingDishes: boolean;
    fetchDishes: () => void;
}

function generateColumns(dishTypes: string[], dishVendors: Record<string, string[]>): GridColDef[] {
    return [
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
                return capitalizeFirstLetter(value);
            },
            renderCell(params) {
                const color = tagColor(params.value) ?? 'inherit';
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
                );
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
                return capitalizeFirstLetter(value);
            },
            renderCell(params) {
                const color = tagColor(params.value) ?? 'inherit';
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
                );
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
                return value ? new Date(value).toLocaleString() : null;
            },
            renderCell(params) {
                if (!params || !params.value || !params.formattedValue) return null;
                const timeSinceBorrowed = Date.now() - new Date(params.value).getTime();
                const daysDifference = Math.floor(timeSinceBorrowed / (1000 * 3600 * 24));
                const overdue = daysDifference >= 2;

                if (overdue) {
                    return (
                        <Tooltip title={`${daysDifference} days`} placement="top" arrow>
                            <div style={{ color: '#BF4949' }}>{params.formattedValue}</div>
                        </Tooltip>
                    );
                }
                return <div>{params.formattedValue}</div>;
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
                return new Date(value).toLocaleDateString();
            },
        },
        {
            field: 'location',
            headerName: 'Location',
            minWidth: 150,
            maxWidth: 150,
            flex: 1,
            editable: true,
            type: 'singleSelect',
            valueOptions: ['', ...((Object.keys(dishVendors) as string[]) ?? [])],
            valueFormatter: ({ value }: { value: string | null }) => (value ? capitalizeFirstLetter(value) : ''),
        },
        {
            field: 'vendor',
            headerName: 'Vendor',
            minWidth: 150,
            maxWidth: 150,
            flex: 1,
            editable: true,
            type: 'singleSelect',
            valueOptions: (params) => ['', ...(dishVendors[params.row.location] ?? [])],
            valueFormatter: ({ value }: { value: string | null }) => (value ? capitalizeFirstLetter(value) : ''),
        },
    ];
}

export default function AdminDishesTable({ filteredRows, dishTypes, dishVendors, loadingDishes, fetchDishes }: Props) {
    const { sessionToken } = useAuth();
    const [selectedRows, setSelectedRows] = useState<GridRowId[]>([]);
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const { enqueueSnackbar } = useSnackbar();

    const handleDishDelete = async function () {
        if (sessionToken) {
            setDeleting(true);
            const response = await adminApi.deleteDishes(sessionToken, selectedRows);

            if (response && response.status != 200) {
                enqueueSnackbar(`Failed to delete dishes: ${response.status}`, { variant: 'error' });
            } else {
                setOpen(false);
                setSelectedRows([]);
                enqueueSnackbar('Successfully deleted dishes', { variant: 'success' });
                fetchDishes();
            }
            setDeleting(false);
        }
    };

    const modifyDish = async (id: string, field: string, oldValue: string, newValue: string) => {
        if (sessionToken) {
            return await adminApi.modifyDishAttribute(sessionToken, id, field, oldValue, newValue);
        }
    };

    // must return the GridRowModel to update the internal state of the grid
    const processRowUpdate = async (newRow: GridRowModel, oldRow: GridRowModel) => {
        let response;
        if (newRow.status !== oldRow.status) {
            response = (await modifyDish(newRow.id, 'status', oldRow.status, newRow.status)) as any;
        } else if (newRow.location !== oldRow.location) {
            response = (await modifyDish(newRow.id, 'location', oldRow.location, newRow.location)) as any;
            if (response && response.status === 200) {
                newRow.vendor = '';
                response = (await modifyDish(newRow.id, 'vendor', oldRow.vendor, newRow.vendor)) as any;
            }
        } else if (newRow.vendor !== oldRow.vendor) {
            response = (await modifyDish(newRow.id, 'vendor', oldRow.vendor, newRow.vendor)) as any;
        }

        if (!response) {
            return oldRow;
        } else if (response && response?.status !== 200) {
            enqueueSnackbar(`Failed to modify dish: ${response.message}; ${response.response.data.message}`, {
                variant: 'error',
            });
            return oldRow;
        } else {
            enqueueSnackbar(`Successfully modified dish`, { variant: 'success' });
            return newRow;
        }
    };

    return (
        <>
            <AdminDataGrid
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
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={40} color="primary" aria-label="Loading" />
                            </Box>
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
                    setSelectedRows(newSelection);
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
                            <AdminContainedButton
                                variant="contained"
                                onClick={() => handleDishDelete()}
                                sx={{ width: '90%' }}
                                disabled={deleting}>
                                Delete
                            </AdminContainedButton>
                            <AdminOutlinedButton sx={{ width: '90%' }} onClick={() => setOpen(false)}>
                                Exit
                            </AdminOutlinedButton>
                        </Box>
                    </DialogContent>
                </CustomDialogTitle>
            </Dialog>
        </>
    );
}
