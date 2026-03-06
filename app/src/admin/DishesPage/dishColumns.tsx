import { Chip, Tooltip } from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';

import { DishStatus } from '../../types';
import { capitalizeFirstLetter, tagColor } from '../utils';

export function generateColumns(dishTypes: string[], dishVendors: Record<string, string[]>): GridColDef[] {
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
