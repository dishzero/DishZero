import { styled } from '@mui/material';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';

const StyledDataGrid = styled(DataGrid)<DataGridProps>(({ theme }) => ({
    '& .MuiDataGrid-columnHeaders': {
        '& svg': {
            fill: 'white',
        },
        backgroundColor: theme.palette.grey[800],
        color: 'white',
    },
    '& .MuiDataGrid-columnHeaderTitleContainerContent span': {
        color: 'white',
    },
    '& .MuiTablePagination-selectLabel': {
        marginBottom: '0px',
    },
    '& .MuiTablePagination-displayedRows': {
        marginBottom: '0px',
    },
    '& .MuiDataGrid-row': {
        cursor: 'pointer',
    },
}));

export default StyledDataGrid;
