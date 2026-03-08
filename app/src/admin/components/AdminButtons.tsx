import { Button, ButtonProps, SxProps, Theme } from '@mui/material';

const outlinedButtonSx: SxProps<Theme> = {
    borderRadius: '30px',
    border: '2px solid !important',
    padding: '0.5rem 2rem !important',
};

const containedButtonSx: SxProps<Theme> = {
    borderRadius: '30px',
    color: 'white',
    padding: '0.5rem 2rem',
    margin: '1rem',
};

function mergeSx(baseSx: SxProps<Theme>, sx: ButtonProps['sx']) {
    return Array.isArray(sx) ? [baseSx, ...sx] : [baseSx, sx];
}

export function AdminOutlinedButton({ sx, ...props }: ButtonProps) {
    return <Button {...props} sx={mergeSx(outlinedButtonSx, sx)} />;
}

export function AdminContainedButton({ sx, ...props }: ButtonProps) {
    return <Button {...props} sx={mergeSx(containedButtonSx, sx)} />;
}
