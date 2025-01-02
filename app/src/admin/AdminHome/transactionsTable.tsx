import { Transaction, generateTransactionColumns } from './constants'
import CustomToolbar from '../DataGrid/customToolbar'
import { StyledDataGrid } from '../DataGrid/constants'
import NoResultsOverlay from '../DataGrid/noResultsOverlay'
import { GridOverlay } from '@mui/x-data-grid'
import { BallTriangle } from 'react-loader-spinner'

interface Props {
    filteredRows: Transaction[]
    loadingTransactions: boolean
    dishTypes: string[]
}

export default function AdminTransactionsTable({ filteredRows, loadingTransactions, dishTypes }: Props) {
    return (
        <>
            <StyledDataGrid
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
    )
}
