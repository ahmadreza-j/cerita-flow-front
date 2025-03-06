import React from "react";
import { Container, Box, Paper, Link, Typography, useTheme } from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/router";
import useAuth from "../src/hooks/useAuth";
import RegisterForm from "../src/components/auth/RegisterForm";
import { RegisterData } from "../src/types/auth";

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const handleRegister = async (values: RegisterData) => {
    try {
      await register(values);
      router.push("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        padding: { xs: 2, md: 0 },
      }}
    >
      <Container maxWidth="md" sx={{ my: "auto" }}>
        <Paper
          elevation={6}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          {/* Left side - Register Form */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 3, sm: 4, md: 5 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              fontWeight="bold"
              color="primary"
              align="center"
              gutterBottom
            >
              ثبت‌نام در سیستم
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              لطفاً اطلاعات خود را برای ثبت‌نام وارد کنید
            </Typography>
            
            <RegisterForm onSubmit={handleRegister} />
            
            <Box sx={{ mt: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                قبلاً ثبت‌نام کرده‌اید؟
              </Typography>
              <Link
                component={NextLink}
                href="/login"
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                وارد شوید
              </Link>
            </Box>
          </Box>
          
          {/* Right side - Image or Decoration */}
          <Box
            sx={{
              flex: 1,
              display: { xs: "none", md: "flex" },
              bgcolor: "primary.dark",
              color: "white",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              p: 5,
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1, textAlign: "center" }}>
              <Typography variant="h3" component="div" fontWeight="bold" gutterBottom>
                سیستم مدیریت کلینیک
              </Typography>
              <Typography variant="h6">
                به خانواده ما خوش آمدید
              </Typography>
            </Box>
            
            {/* Background pattern */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                background: "radial-gradient(circle, rgba(255,255,255,0.3) 2px, transparent 2px)",
                backgroundSize: "20px 20px",
              }}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 