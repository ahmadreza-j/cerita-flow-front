import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { useFormik } from "formik";
import * as yup from "yup";
import { Role } from "../../types/auth";

interface User {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  phone: string;
  isActive: boolean;
  createdAt: string;
}

const roles = [
  { value: Role.DOCTOR, label: "پزشک" },
  { value: Role.SECRETARY, label: "منشی" },
  { value: Role.OPTICIAN, label: "عینک‌ساز" },
];

const validationSchema = yup.object({
  username: yup.string().required("نام کاربری الزامی است"),
  password: yup.string().min(6, "رمز عبور باید حداقل 6 کاراکتر باشد"),
  fullName: yup.string().required("نام و نام خانوادگی الزامی است"),
  role: yup.string().required("نقش الزامی است"),
  phone: yup.string().matches(/^09\d{9}$/, "شماره موبایل نامعتبر است"),
  nationalId: yup.string().matches(/^\d{10}$/, "کد ملی نامعتبر است"),
});

const UserManagement = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery(["users", selectedTab], async () => {
    const path =
      selectedTab === "all"
        ? "/api/admin/users"
        : `/api/admin/users/${selectedTab}`;
    const res = await axios.get(path);
    return res.data;
  });

  const createUser = useMutation(
    (userData: any) => axios.post("/api/admin/users", userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
        setSnackbar({
          open: true,
          message: "کاربر با موفقیت ایجاد شد",
          severity: "success",
        });
        handleCloseDialog();
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: "خطا در ایجاد کاربر",
          severity: "error",
        });
      },
    }
  );

  const updateUser = useMutation(
    (userData: any) => axios.put(`/api/admin/users/${userData.id}`, userData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
        setSnackbar({
          open: true,
          message: "کاربر با موفقیت بروزرسانی شد",
          severity: "success",
        });
        handleCloseDialog();
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: "خطا در بروزرسانی کاربر",
          severity: "error",
        });
      },
    }
  );

  const toggleUserActive = useMutation(
    (userId: number) => axios.patch(`/api/admin/users/${userId}/toggle-active`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
        setSnackbar({
          open: true,
          message: "وضعیت کاربر با موفقیت تغییر کرد",
          severity: "success",
        });
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: "خطا در تغییر وضعیت کاربر",
          severity: "error",
        });
      },
    }
  );

  const deleteUser = useMutation(
    (userId: number) => axios.delete(`/api/admin/users/${userId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
        setSnackbar({
          open: true,
          message: "کاربر با موفقیت حذف شد",
          severity: "success",
        });
      },
      onError: () => {
        setSnackbar({
          open: true,
          message: "خطا در حذف کاربر",
          severity: "error",
        });
      },
    }
  );

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      fullName: "",
      role: "",
      phone: "",
      nationalId: "",
    },
    validationSchema,
    onSubmit: (values) => {
      if (editingUser) {
        updateUser.mutate({ id: editingUser.id, ...values });
      } else {
        createUser.mutate(values);
      }
    },
  });

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      formik.setValues({
        username: user.username,
        password: "",
        fullName: user.fullName,
        role: user.role,
        phone: user.phone,
        nationalId: "",
      });
    } else {
      setEditingUser(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    formik.resetForm();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          مدیریت کاربران
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          افزودن کاربر جدید
        </Button>
      </Box>

      <Tabs
        value={selectedTab}
        onChange={(_, newValue) => setSelectedTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab value="all" label="همه کاربران" />
        <Tab value="doctor" label="پزشکان" />
        <Tab value="secretary" label="منشی‌ها" />
        <Tab value="optician" label="عینک‌سازها" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>نام کاربری</TableCell>
              <TableCell>نام و نام خانوادگی</TableCell>
              <TableCell>نقش</TableCell>
              <TableCell>شماره تماس</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell>عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>
                  {roles.find((r) => r.value === user.role)?.label}
                </TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.isActive ? "فعال" : "غیرفعال"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => toggleUserActive.mutate(user.id)}>
                    {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                  </IconButton>
                  <IconButton onClick={() => deleteUser.mutate(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {editingUser ? "ویرایش کاربر" : "افزودن کاربر جدید"}
          </DialogTitle>
          <DialogContent>
            <Box display="grid" gap={2} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                name="username"
                label="نام کاربری"
                value={formik.values.username}
                onChange={formik.handleChange}
                error={
                  formik.touched.username && Boolean(formik.errors.username)
                }
                helperText={formik.touched.username && formik.errors.username}
                disabled={Boolean(editingUser)}
              />
              <TextField
                fullWidth
                name="password"
                label="رمز عبور"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
              />
              <TextField
                fullWidth
                name="fullName"
                label="نام و نام خانوادگی"
                value={formik.values.fullName}
                onChange={formik.handleChange}
                error={
                  formik.touched.fullName && Boolean(formik.errors.fullName)
                }
                helperText={formik.touched.fullName && formik.errors.fullName}
              />
              <TextField
                fullWidth
                select
                name="role"
                label="نقش"
                value={formik.values.role}
                onChange={formik.handleChange}
                error={formik.touched.role && Boolean(formik.errors.role)}
                helperText={formik.touched.role && formik.errors.role}
              >
                {roles.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                name="phone"
                label="شماره موبایل"
                value={formik.values.phone}
                onChange={formik.handleChange}
                error={formik.touched.phone && Boolean(formik.errors.phone)}
                helperText={formik.touched.phone && formik.errors.phone}
              />
              <TextField
                fullWidth
                name="nationalId"
                label="کد ملی"
                value={formik.values.nationalId}
                onChange={formik.handleChange}
                error={
                  formik.touched.nationalId && Boolean(formik.errors.nationalId)
                }
                helperText={
                  formik.touched.nationalId && formik.errors.nationalId
                }
                disabled={Boolean(editingUser)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>انصراف</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingUser ? "بروزرسانی" : "ایجاد"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagement;
