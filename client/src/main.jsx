import React from 'react'
import ReactDOM from 'react-dom/client'
import { HeroUIProvider } from '@heroui/system'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { muiTheme } from './lib/muiTheme.js'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="light text-foreground">
      <ThemeProvider theme={muiTheme}>
        <CssBaseline enableColorScheme />
        <HeroUIProvider>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </HeroUIProvider>
      </ThemeProvider>
    </div>
  </React.StrictMode>
)
