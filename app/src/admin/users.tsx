////////////////////////// Import Dependencies //////////////////////////
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Dialog,
    Select,
    FormControl,
    MenuItem,
    InputLabel,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TableSortLabel,
    Button,
    Avatar,
    Typography,
    Box,
    Paper,
    InputBase,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow
} from '@mui/material';
import DishzeroSidebarLogo from '../assets/dishzero-sidebar-logo.png';
import 'typeface-poppins';
import { 
    FilterList as FilterListIcon,
    Home as HomeIcon,
    DinnerDiningOutlined as DinnerDiningOutlinedIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';
//////////////////////////////////////////////////////////////////////////////

//////////////////////////// Declarations ////////////////////////////
interface HeadCell {
    id: 'emailAddress' | 'inUse' | 'overdue' | 'role';
    label: string;
    minWidth?: number;
    align?: 'right' | 'left';
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    { 
        id: 'emailAddress', 
        label: 'Email Address', 
        minWidth: 200,
        numeric: false,
        align: 'left'
    },
    { 
        id: 'inUse', 
        label: 'In Use', 
        minWidth: 170,
        numeric: true,
        align: 'right'
    },
    {
        id: 'overdue',
        label: 'Overdue',
        minWidth: 90,
        numeric: true,
        align: 'right'
    },
    {
        id: 'role',
        label: 'Role',
        minWidth: 170,
        numeric: false,
        align: 'right'
    }
];

interface Data {
    emailAddress: string;
    inUse: number;
    overdue: number;
    role: string;
}

function createData(
    emailAddress: string,
    inUse: number,
    overdue: number,
    role: string
  ): Data {
    return { emailAddress, inUse, overdue, role };
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
    const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) {
        return order;
      }
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}
 
interface EnhancedTableProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
    order: Order;
    orderBy: string;
    handleRoleFilterOpen: () => void;
}

interface Rows {
    data: Array<Data>;
    cache: Array<Data>;
}
 
interface MainframeProps {
    rows: Rows;
    handleRoleFilterOpen: () => void;
    handleRoleUpdate: (arg0: String) => void;
}

interface RoleFilterDialogProps {
    open: boolean;
    handleClose: () => void;
    role: String;
    handleRoleChange: (arg0: String) => void;
}
//////////////////////////////////////////////////////////////

/////////////////////////////// Sub-components ///////////////////////////////
const Tab = ({ children, route }) => {
    const navigate = useNavigate();

    return (
        <Button sx={ route === "/admin/users" ? styles.tabActive : styles.tabInactive } variant="text"  onClick={() => navigate(route)} disableElevation>
            { children }
        </Button>
    );
}

const Sidebar = () => {
    return (
      <Box sx={styles.sidebar}>
        <Box sx={styles.logoFrame}>
            <Avatar src={DishzeroSidebarLogo} sx={styles.dishzeroSidebarLogo} />
            <Typography sx={styles.dishzeroName}>DishZero</Typography>
        </Box>
        <Box sx={styles.tabsFrame}>
            <Typography sx={styles.adminPanelText}>Admin panel</Typography>
            <Tab route="/home">
                <HomeIcon sx={styles.tabIcon}/>
                <Typography sx={styles.tabName}>Home</Typography>
            </Tab>
            <Tab route="/admin/dishes">
                <DinnerDiningOutlinedIcon sx={styles.tabIcon}/>
                <Typography sx={styles.tabName}>Dishes</Typography>
            </Tab>
            <Tab route="/admin/users">
                <PersonIcon sx={styles.tabIcon}/>
                <Typography sx={styles.tabName}>Users</Typography>
            </Tab>
            <Tab route="/admin/email">
                <EmailIcon sx={styles.tabIcon}/>
                <Typography sx={styles.tabName}>Email</Typography>
            </Tab>
        </Box>
      </Box>
    )
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } =
      props;
    const createSortHandler =
      (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
      };
  
    return (
      <TableHead >
        <TableRow>
          {headCells.map((headCell) => (
            <TableCell
              key={headCell.id}
              align={headCell.align}
              padding={'normal'}
              sortDirection={orderBy === headCell.id ? order : false}
              sx={{ backgroundColor: '#68B49A', color: 'white' }}
            >
                {
                    headCell.id !== 'role' ?
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                            sx={{ 
                                '&:hover': {
                                    color: 'white',
                                    '& .MuiTableSortLabel-icon': {
                                        color: '#dddddd',
                                    },
                                },
                                color: 'white'
                            }}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                            <Box component="span" sx={visuallyHidden}>
                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                            </Box>
                            ) : null}
                        </TableSortLabel>
                    :
                        <Box sx={styles.roleTableCell}>
                            {headCell.label}
                            <FilterListIcon sx={styles.roleFilterIcon} onClick={props.handleRoleFilterOpen}/>
                        </Box>
                }
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
    );
}

const MainFrame = (props: MainframeProps) => {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<keyof Data>('inUse');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const handleRoleUpdate = props.handleRoleUpdate;

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof Data,
      ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - props.rows.data.length) : 0;

    const [ data, setData ] = useState(
        stableSort(props.rows.data, getComparator(order, orderBy)).slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        )
    );

    useEffect(() => {
        setData(
            stableSort(props.rows.data, getComparator(order, orderBy)).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage,
            )
        );
    }, [order, orderBy, page, rowsPerPage]);

    const [ searchedEmail, setSearchedEmail ] = useState('');

    function handleEmailSearch(text) {
        if (text.length > 0) {
            const filteredRows = data.filter((row) => {
                return row.emailAddress.toLowerCase().includes(text.toLowerCase());
            });
            setSearchedEmail(text);
            setData(filteredRows);
        } else {
            setSearchedEmail(text);
            setData(
                stableSort(props.rows.data, getComparator(order, orderBy)).slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage,
                )
            );
        }
    }

    return (
        <Box sx={styles.main}>
            <Typography sx={styles.pageName}>Users</Typography>
            <Box sx={styles.searchFrame}>
                <Paper
                    component="form"
                    sx={styles.searchField}
                >
                    <SearchIcon />
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        value={searchedEmail}
                        onChange={(e) => handleEmailSearch(e.target.value)}
                        placeholder="search email..."
                        inputProps={{ 'aria-label': 'search email address' }}
                    />
                </Paper>
            </Box>
            <Paper sx={styles.dataPaper}>
                <TableContainer sx={styles.dataTable}>
                    <Table stickyHeader aria-label="sticky table">
                        <EnhancedTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            handleRoleFilterOpen={props.handleRoleFilterOpen}
                        />
                        <TableBody>
                            {
                                data.map((row, index) => {
                                    const labelId = `enhanced-table-checkbox-${index}`;
                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={row.emailAddress} sx={{ cursor: 'pointer' }}>
                                            <TableCell
                                                component="th"
                                                id={labelId}
                                                scope="row"
                                                padding="normal"
                                            >
                                                {row.emailAddress}
                                            </TableCell>
                                            <TableCell align="right">{row.inUse}</TableCell>
                                            <TableCell align="right">{row.overdue}</TableCell>
                                            <TableCell align="right">
                                                <Box sx={{ height: '50px' }}>
                                                    <FormControl sx={{ width: '150px' }}>
                                                        <Select
                                                            labelId="demo-simple-select-label"
                                                            id="demo-simple-select"
                                                            value={row.role}
                                                            label="Role"
                                                            displayEmpty
                                                            inputProps={{ 'aria-label': 'Without label' }}
                                                            onChange={(e) => handleRoleUpdate(e.target.value)}
                                                            renderValue={(selected) => {
                                                                if (selected.length === 0) {
                                                                  return <em>{row.role}</em>;
                                                                }
                                                                return selected
                                                            }}
                                                        >
                                                            <MenuItem value={10}>BASIC</MenuItem>
                                                            <MenuItem value={20}>ADMIN</MenuItem>
                                                            <MenuItem value={30}>VOLUNTEER</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            }
                            {
                                emptyRows > 0 && (
                                    <TableRow style={{ height: 53 * emptyRows }}>
                                        <TableCell colSpan={6} />
                                    </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={props.rows.data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
};

function RoleFilterDialog(props: RoleFilterDialogProps) {
    const open = props.open;
    const handleClose = props.handleClose;
    const role = props.role;
    const handleRoleChange = props.handleRoleChange;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
        >
            <DialogTitle>Filter role</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Display only the users whose role is:
                </DialogContentText>
                <Box
                    noValidate
                    component="form"
                    sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    m: 'auto',
                    width: 'fit-content',
                    }}
                >
                    <FormControl sx={{ mt: 2, minWidth: 120 }}>
                        <InputLabel htmlFor="max-width">Role</InputLabel>
                        <Select
                            autoFocus
                            value={role}
                            onChange={(e) => handleRoleChange(e.target.value)}
                            label="maxWidth"
                        >
                            <MenuItem value="ALL">ALL</MenuItem>
                            <MenuItem value="BASIC">BASIC</MenuItem>
                            <MenuItem value="ADMIN">ADMIN</MenuItem>
                            <MenuItem value="VOLUNTEER">VOLUNTEER</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Done</Button>
            </DialogActions>
        </Dialog>
    );
}
/////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////// Main component //////////////////////////////
export default function Users() {
    const [ isLoading, setIsLoading ] = useState(true);
    const [ rows, setRows ] = useState<Rows>({
        data: [],
        cache: []
    });

    const fetchRows = async () => {
        const masterData = [
            createData("bhphan@ualberta.ca", 3, 4, "BASIC"),
            createData("phucphnvn@yahoo.com", 5, 6, "VOLUNTEER")
        ]; // replace this with an api call to retrieve data and then use the createData function before calling setRows
        setRows({
            data: masterData,
            cache: masterData
        });
    };

    useEffect(() => {
        fetchRows();
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isLoading) {
            setIsLoading(false);
        }
    }, [JSON.stringify(rows)]);

    const [ role, setRole ] = useState<String>('ALL');

    const [openedRoleFilter, setOpenedRoleFilter] = React.useState(false);

    const handleRoleFilterOpen = () => {
        setOpenedRoleFilter(true);
    };
    
    const handleRoleFilterClose = () => {
        setOpenedRoleFilter(false);
    };

    function handleRoleChange(data: String) {
        setRole(data);
    }

    function handleRoleFilter() {
        const filteredRows = rows.cache.filter((row) => {
            return row.role === role;
        });
        setRows({
            data: filteredRows,
            cache: rows.cache
        });
    }

    useEffect(() => {
        if (role !== 'ALL') {
            setIsLoading(true);
            handleRoleFilter();
        } else {
            setIsLoading(true);
            fetchRows();
        }
    }, [role]);

    function handleRoleUpdate(newRole: String) {}

    return (
        <Box sx={styles.root}>
            <Sidebar />
            {
                isLoading ?
                    null
                : <MainFrame 
                    rows={rows} 
                    handleRoleFilterOpen={handleRoleFilterOpen} 
                    handleRoleUpdate={handleRoleUpdate}
                />
            }
            <RoleFilterDialog 
                open={openedRoleFilter}
                handleClose={handleRoleFilterClose}
                role={role}
                handleRoleChange={handleRoleChange}
            />
        </Box>
    );
}
/////////////////////////////////////////////////////////////////////////

//////////////////////////// Styles ////////////////////////////
const styles = {
    root: {
        width: '100%',
        height: `${window.innerHeight}px`,
        display: 'flex',
        flexDirection: 'row'
    },

    sidebar: {
        width: '20%',
        height: '100%',
        backgroundColor: "#464646",
        display: 'flex',
        flexDirection: 'column'
    },

    logoFrame: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '25px',
        marginLeft: '25px',
    },

    dishzeroSidebarLogo: {
        width: '40px',
        height: '40px'
    },

    dishzeroName: {
        fontSize: '1.425rem',
        fontFamily: 'Poppins, sans-serif',
        color: 'white',
        marginLeft: '20px'
    },

    tabsFrame: {
        width: '100%',
        marginTop: '45px',
        display: 'flex',
        flexDirection: 'column'
    },

    adminPanelText: {
        fontSize: '1.025rem',
        fontFamily: 'Poppins, sans-serif',
        color: '#C2C2C2',
        marginBottom: '37px',
        marginLeft: '25px'
    },

    tabInactive: {
        width: '100%',
        height: '53px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingLeft: '25px',
        alignItems: 'center',
        marginBottom: '26px',
        backgroundColor: '#464646',
        '&:hover': {
            backgroundColor: '#5E5E5E', // Change this to the desired hover color
        },
    },

    tabActive: {
        width: '100%',
        height: '53px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingLeft: '25px',
        alignItems: 'center',
        marginBottom: '26px',
        backgroundColor: '#5E5E5E',
        '&:hover': {
            backgroundColor: '#5E5E5E', // Change this to the desired hover color
        },
    },

    tabIcon: {
        fontSize: '2rem',
        color: '#F6F8F5'
    },

    tabName: {
        marginTop: '2px',
        marginLeft: '16px',
        fontSize: '1.125rem',
        color: '#F6F8F5',
    },

    main: {
        width: '80%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: '50px'
    },

    pageName: {
        fontSize: '2rem',
        fontWeight: 'bold',
        marginTop: '40px'
    },

    searchFrame: {
        marginTop: '20px',
        width: '400px',
        height: '50px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },

    searchField: { 
        p: '2px 12px', 
        display: 'flex',
        alignItems: 'center', 
        width: '65%',
        height: '80%',
        boxShadow: '0',
        borderWidth: '1.3px',
        borderStyle: 'solid',
        borderColor: '#68B49A',
        borderRadius: '20px'
    },

    dataPaper: { 
        width: '95.5%', 
        overflow: 'hidden',
        marginTop: '35px',
        boxShadow: '0'
    },

    dataTable: {
        maxHeight: `${window.innerHeight - 300}px`
    },

    roleTableCell: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        color: 'white'
    },

    roleFilterIcon: {
        fontSize: '1.065rem',
        marginLeft: '8px',
        '&:hover': {
            color: '#dddddd',
        },
        cursor: 'pointer'
    },

    roleCell: {
        width: '100px'
    }
};
///////////////////////////////////////////////////////////////////////