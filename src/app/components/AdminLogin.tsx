import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box
} from '@mui/material';
import { AdminPanelSettings, Login as LoginIcon } from '@mui/icons-material';
import { toast } from 'sonner';

interface AdminLoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === 'admin' && password === 'admin123') {
      toast.success('Admin login successful!');
      onLogin();
    } else {
      toast.error('Invalid admin credentials');
    }
  };

  return (
    <Box className="size-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          <Box className="flex items-center justify-center gap-2 mb-6">
            <AdminPanelSettings color="primary" style={{ fontSize: 40 }} />
            <Typography variant="h4" color="primary">
              Admin Login
            </Typography>
          </Box>

          <form onSubmit={handleLogin} className="space-y-4">
            <TextField
              fullWidth
              label="Admin Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              fullWidth
              type="password"
              label="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
            >
              Login as Admin
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={onBack}
            >
              Back to Main Menu
            </Button>

            <Box className="mt-4 p-3 bg-blue-50 rounded">
              <Typography variant="body2" color="text.secondary">
                Default credentials:
              </Typography>
              <Typography variant="caption">
                Username: admin | Password: admin123
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
