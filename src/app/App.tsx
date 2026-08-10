import { useState } from 'react';
import { CafeProvider, useCafe } from './context/CafeContext';
import { AuthScreen } from './components/AuthScreen';
import { AdminLogin } from './components/AdminLogin';
import { UserPortal } from './components/UserPortal';
import { AdminPortal } from './components/AdminPortal';
import { Toaster } from 'sonner';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box
} from '@mui/material';
import { Person, AdminPanelSettings, Restaurant } from '@mui/icons-material';

type AppMode = 'main' | 'user' | 'admin-login' | 'admin';

function AppContent() {
  const { currentUser } = useCafe();
  const [mode, setMode] = useState<AppMode>('main');
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  if (currentUser) {
    return <UserPortal onMainMenu={() => setMode('main')} />;
  }

  if (mode === 'admin' && adminLoggedIn) {
    return <AdminPortal onLogout={() => {
      setAdminLoggedIn(false);
      setMode('main');
    }} />;
  }

  if (mode === 'admin-login') {
    return (
      <AdminLogin
        onLogin={() => {
          setAdminLoggedIn(true);
          setMode('admin');
        }}
        onBack={() => setMode('main')}
      />
    );
  }

  if (mode === 'user') {
    return <AuthScreen onBack={() => setMode('main')} />;
  }

  // Main menu
  return (
    <Box className="size-full flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-8">
          <Box className="flex flex-col items-center gap-2 mb-8">
            <Restaurant color="primary" style={{ fontSize: 60 }} />
            <Typography variant="h3" color="primary" className="text-center">
              Cafe Management System
            </Typography>
            <Typography variant="body1" color="text.secondary" className="text-center">
              Complete Order & Kitchen Management
            </Typography>
          </Box>

          <Box className="space-y-3">
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Person />}
              onClick={() => setMode('user')}
            >
              Customer Portal
            </Button>

            <Button
              fullWidth
              variant="contained"
              size="large"
              color="secondary"
              startIcon={<AdminPanelSettings />}
              onClick={() => setMode('admin-login')}
            >
              Admin Portal
            </Button>
          </Box>

          <Box className="mt-6 p-4 bg-blue-50 rounded">
            <Typography variant="subtitle2" className="mb-2">
              Quick Start:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Customer Portal: Browse menu, place orders, track history
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Admin Portal: Manage orders, kitchen queue, view reports
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default function App() {
  return (
    <CafeProvider>
      <div className="size-full">
        <AppContent />
        <Toaster position="top-right" richColors />
      </div>
    </CafeProvider>
  );
}