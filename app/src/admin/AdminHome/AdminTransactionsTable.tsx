import { Chip } from '@mui/material';
import { GridColDef, GridOverlay } from '@mui/x-data-grid';
import { BallTriangle } from 'react-loader-spinner';

import AdminDataGrid from '../components/AdminDataGrid';
import CustomToolbar from '../DataGrid/CustomToolbar';
import NoResultsOverlay from '../DataGrid/NoResultsOverlay';
import { Transaction, TransactionType } from '../types';
import { capitalizeFirstLetter, tagColor } from '../utils';

interface Props {
    filteredRows: Transaction[];
    loadingTransactions: boolean;
    dishTypes: string[];
}

export function generateTransactionColumns(dishTypes: string[]): GridColDef[] {
    return [
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
            field: 'transactionType',
            headerName: 'Transaction Type',
            minWidth: 150,
            maxWidth: 200,
            flex: 1,
            type: 'singleSelect',
            valueOptions: Object.values(TransactionType),
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
        { field: 'userEmail', headerName: 'User', minWidth: 200, maxWidth: 250, flex: 1 },
        {
            field: 'timestamp',
            headerName: 'Transaction Date',
            minWidth: 200,
            maxWidth: 300,
            flex: 1,
            type: 'date',
            valueFormatter({ value }: { value: string }) {
                return value ? new Date(value).toLocaleString() : null;
            },
        },
    ];
}

export default function AdminTransactionsTable({ filteredRows, loadingTransactions, dishTypes }: Props) {
    return (
        <>
            <AdminDataGrid
                loading={loadingTransactions}
                rows={filteredRows}
                columns={generateTransactionColumns(dishTypes)}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                    sorting: {
                        sortModel: [
                            {
                                field: 'timestamp',
                                sort: 'desc',
                            },
                        ],
                    },
                }}
                sx={{ flex: 1, minWidth: 850, maxWidth: 1100 }}
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
                    noRowsOverlay: () => <NoResultsOverlay value={'Transactions'} />,
                    noResultsOverlay: () => <NoResultsOverlay value={'Transactions'} />,
                    toolbar: () => <CustomToolbar>{<></>}</CustomToolbar>,
                }}
                slotProps={{
                    panel: {
                        placement: 'auto-start',
                    },
                }}
                pageSizeOptions={[5, 10, 15]}
                autoHeight
                checkboxSelection
                getRowId={(row) => `${row.id}-${row.transactionType}`}
                experimentalFeatures={{ ariaV7: true }}
            />
        </>
    );
}
