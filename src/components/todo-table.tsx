import {
  Box,
  Button,
  Checkbox,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  darken,
  lighten,
} from "@mui/material";
import { FC, useMemo, useState } from "react";
import useData from "./useData";
import {
  MRT_Cell,
  MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { Todo, TodoResponse } from "./types";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

const TodoTable: FC = () => {
  const { data, setData } = useData<TodoResponse>(
    "https://dummyjson.com/todos",
    { todos: [], total: 0, skip: 0, limit: 0 }
  );
  const [rowSelection, setRowSelection] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [open, setOpen] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newTodo, setNewTodo] = useState<Todo>({
    id: 0,
    todo: "",
    completed: false,
    userId: 0,
    active: true,
  });

  const handleOpen = (todo?: Todo) => {
    if (todo) {
      setNewTodo(todo);
      setEditMode(true);
    } else {
      setNewTodo({
        id: 0,
        todo: "",
        completed: false,
        userId: 0,
        active: true,
      });
      setEditMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTodo({
      ...newTodo,
      [e.target.name]:
        e.target.name === "completed" ? e.target.checked : e.target.value,
    });
  };

  const handleSave = () => {
    if (editMode) {
      setData((prevData) => ({
        ...prevData,
        todos: prevData.todos.map((todo) =>
          todo.id === newTodo.id
            ? {
                ...newTodo,
                id: Number(newTodo.id),
                userId: Number(newTodo.userId),
              }
            : todo
        ),
      }));
    } else {
      setData((prevData) => ({
        ...prevData,
        todos: [
          ...prevData.todos,
          {
            ...newTodo,
            id: Number(newTodo.id),
            userId: Number(newTodo.userId),
          },
        ],
      }));
    }
    setOpen(false);
  };

  // const handleDeactivate = () => {
  //     const selectedRows = table.getSelectedRowModel().rows.map(row => row.original.id);
  //     setData(prevData => ({
  //       ...prevData,
  //       todos: prevData.todos.map(todo =>
  //         selectedRows.includes(todo.id) ? { ...todo, active: false } : todo
  //       ),
  //     }));
  //   };

  const handleToggleActivation = (activate: boolean) => {
    setData((prevData) => ({
      ...prevData,
      todos: prevData.todos.map((todo) =>
        rowSelection[todo.id] ? { ...todo, active: activate } : todo
      ),
    }));
    setRowSelection({});
  };
  const filterSelectOptions = ["Active", "Deactivated"];

  const columns = useMemo<MRT_ColumnDef<Todo>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        filterVariant: "range",
        filterFn: "between",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        size: 120,
      },
      {
        accessorKey: "todo",
        header: "Todo",
        // filterVariant: 'select',
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        size: 120,
      },
      {
        accessorKey: "userId",
        header: "User Id",
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        size: 120,
      },
      {
        accessorKey: "completed",
        accessorFn: (originalRow) => originalRow.completed,
        header: "Completed",
        enableColumnFilter: false,
        Cell: ({ cell }) => (cell.getValue() ? <CheckIcon /> : <CloseIcon />),
        muiTableHeadCellProps: {
          align: "center",
        },
        muiTableBodyCellProps: {
          align: "center",
        },
        size: 100,
      },
      {
        accessorKey: "active",
        header: "Active",
        enableColumnFilter: false,
        Cell: ({ row }) => (row.original.active ? "Active" : "Deactivated"),
      },
      {
        accessorKey: "actions",
        header: "Actions",
        enableColumnFilter: false,
        enableSorting: false,
        Cell: ({ row }) => (
          <Box sx={{ display: "flex", gap: "0.5rem" }}>
            <IconButton onClick={() => handleOpen(row.original)}>
              <EditIcon />
            </IconButton>
          </Box>
        ),
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data: data.todos,
    getRowId: (row: Todo) => row.id.toString(),
    muiTableBodyRowProps: ({ row }) => ({
      onClick: () =>
        setRowSelection((prev) => ({
          ...prev,
          [row.id]: !prev[row.id],
        })),
      selected: !!rowSelection[row.id],
      sx: {
        cursor: "pointer",
        backgroundColor: row.original.active ? undefined : "#ababab", // Grey for deactivated rows
      },
    }),
    initialState: {
      showGlobalFilter: true,
    },
    state: { rowSelection },
    columnFilterDisplayMode: "popover",
    autoResetPageIndex: false,
    paginationDisplayMode: "pages",

    muiSearchTextFieldProps: {
      size: "small",
      variant: "outlined",
    },
    muiPaginationProps: {
      color: "primary",
      rowsPerPageOptions: [10, 20, 30],
      shape: "rounded",
      variant: "outlined",
    },
    // mrtTheme: () => ({
    //   baseBackgroundColor: '',
    // }),
    renderTopToolbar: ({ table }) => {
      return (
        <Box
          sx={(theme) => ({
            backgroundColor: lighten(theme.palette.background.default, 0.05),
            display: "flex",
            gap: "0.5rem",
            p: "8px",
            justifyContent: "space-between",
          })}
        >
          <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <MRT_GlobalFilterTextField table={table} />
          </Box>
          <Box>
            <Box sx={{ display: "flex", gap: "0.5rem", p: 2 }}>
              <Button
                color="error"
                disabled={!Object.keys(rowSelection).length}
                onClick={() => handleToggleActivation(false)}
                variant="contained"
              >
                Deactivate
              </Button>
              <Button
                color="success"
                disabled={!Object.keys(rowSelection).length}
                onClick={() => handleToggleActivation(true)}
                variant="contained"
              >
                Activate
              </Button>
              <Button
                color="primary"
                onClick={() => handleOpen()}
                variant="contained"
              >
                Add
              </Button>
            </Box>
            <Dialog open={open} onClose={handleClose}>
              <DialogTitle>Add New Todo</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  margin="dense"
                  name="id"
                  label="ID"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={newTodo.id}
                  onChange={handleChange}
                />
                <TextField
                  margin="dense"
                  name="userId"
                  label="User ID"
                  type="number"
                  fullWidth
                  variant="standard"
                  value={newTodo.userId}
                  onChange={handleChange}
                />
                <TextField
                  margin="dense"
                  name="todo"
                  label="Todo"
                  type="text"
                  fullWidth
                  variant="standard"
                  value={newTodo.todo}
                  onChange={handleChange}
                />
                <Checkbox
                  name="completed"
                  checked={newTodo.completed}
                  onChange={handleChange}
                />{" "}
                Completed
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
      );
    },
  });

  return (
    <Container sx={{ height: "calc(100vh - 200px)", p: 4 }}>
      {/* <Button onClick={handleClick}>Show Table</Button> */}

      <MaterialReactTable table={table} />
      {/* </> */}
      {/* )} */}
    </Container>
  );
};

export default TodoTable;
