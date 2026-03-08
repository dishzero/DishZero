import { SxProps, Theme } from '@mui/material';
import { DataGrid, DataGridProps } from '@mui/x-data-grid';

const adminDataGridSx: SxProps<Theme> = {
    '& .MuiDataGrid-columnHeaders': {
        '& svg': {
            fill: 'white',
        },
        backgroundColor: 'grey.800',
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
};

export default function AdminDataGrid({ sx, ...props }: DataGridProps) {
    const mergedSx = Array.isArray(sx) ? [adminDataGridSx, ...sx] : [adminDataGridSx, sx];

    return <DataGrid {...props} sx={mergedSx} />;
}
