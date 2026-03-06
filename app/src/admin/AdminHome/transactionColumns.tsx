import { Chip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import { TransactionType } from '../types';
import { capitalizeFirstLetter, tagColor } from '../utils';

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
