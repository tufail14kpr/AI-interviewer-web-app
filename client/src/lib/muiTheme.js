import { alpha, createTheme } from '@mui/material/styles'

export const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#b27c2a'
    },
    secondary: {
      main: '#c4654f'
    },
    success: {
      main: '#5f6b53'
    },
    background: {
      default: '#f7f0e3',
      paper: '#fffaf2'
    },
    text: {
      primary: '#1c2230',
      secondary: '#626676'
    }
  },
  shape: {
    borderRadius: 24
  },
  typography: {
    fontFamily: '"Space Grotesk", "Segoe UI Variable", sans-serif',
    h1: {
      fontFamily: '"IBM Plex Serif", Georgia, serif',
      fontWeight: 600,
      letterSpacing: '-0.04em'
    },
    h2: {
      fontFamily: '"IBM Plex Serif", Georgia, serif',
      fontWeight: 600,
      letterSpacing: '-0.04em'
    },
    h3: {
      fontFamily: '"IBM Plex Serif", Georgia, serif',
      fontWeight: 600,
      letterSpacing: '-0.03em'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f7f0e3',
          color: '#1c2230'
        }
      }
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 999
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 999
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 24px 64px rgba(28, 34, 48, 0.12)',
          backgroundColor: alpha('#fffaf2', 0.92)
        }
      }
    }
  }
})
