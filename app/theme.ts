"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1463a5",
      dark: "#0d426d"
    },
    secondary: {
      main: "#2f8f5b"
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff"
    },
    success: {
      main: "#27834f"
    },
    warning: {
      main: "#b66b00"
    }
  },
  shape: {
    borderRadius: 8
  },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
    h1: {
      fontWeight: 700
    },
    h2: {
      fontWeight: 700
    },
    h3: {
      fontWeight: 700
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700
        }
      }
    }
  }
});
