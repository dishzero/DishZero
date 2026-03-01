import { WebAsset } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { GridOverlay } from '@mui/x-data-grid';

interface Props {
    value: string;
}

export default function NoResultsOverlay({ value }: Props) {
    return (
        <GridOverlay style={{ flexDirection: 'column', marginTop: 4, marginBottom: 2 }}>
            <WebAsset color="action" fontSize="large" />
            <Typography mt={1} variant="overline">
                No {value}
            </Typography>
        </GridOverlay>
    );
}
