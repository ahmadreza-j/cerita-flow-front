import React from "react";
import { Button, Container, Typography, Box } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="sm">
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            textAlign="center"
            gap={2}
          >
            <ErrorOutline color="error" sx={{ fontSize: 64 }} />
            <Typography variant="h5" component="h1" gutterBottom>
              متأسفانه خطایی رخ داده است
            </Typography>
            <Typography color="text.secondary" paragraph>
              لطفاً صفحه را مجدداً بارگذاری کنید یا با پشتیبانی تماس بگیرید.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleRetry}
            >
              تلاش مجدد
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
