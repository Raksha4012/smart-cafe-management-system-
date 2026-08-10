import { useState } from 'react';
import { useCafe } from '../context/CafeContext';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  Alert
} from '@mui/material';
import { Restaurant, Login as LoginIcon, PersonAdd, ArrowBack } from '@mui/icons-material';
import { toast } from 'sonner';

export function AuthScreen({ onBack }: { onBack?: () => void }) {
  const { registerUser, loginUser } = useCafe();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const success = await loginUser(username, password);
    if (success) {
      toast.success('Login successful!');
    } else {
      toast.error('Invalid username or password');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password || !email || !phone) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      toast.error('Invalid email format');
      return;
    }

    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    const success = await registerUser(username, password, email, phone);
    if (success) {
      toast.success('Registration successful! You can now login.');
      setMode('login');
      setUsername('');
      setPassword('');
      setEmail('');
      setPhone('');
    } else {
      toast.error('Username already exists');
    }
  };

  return (
    <Box className="size-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6">
          {onBack && (
            <Box className="mb-4">
              <Button startIcon={<ArrowBack />} onClick={onBack} size="small" color="inherit">
                Back to Main
              </Button>
            </Box>
          )}
          <Box className="flex items-center justify-center gap-2 mb-6">
            <Restaurant color="primary" style={{ fontSize: 40 }} />
            <Typography variant="h4" color="primary">
              Cafe Management
            </Typography>
          </Box>

          <Tabs value={mode} onChange={(_, val) => setMode(val)} className="mb-4" centered>
            <Tab label="Login" value="login" />
            <Tab label="Register" value="register" />
          </Tabs>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <TextField
                fullWidth
                type="password"
                label="Password"
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
                Login
              </Button>

              <Alert severity="info">
                <Typography variant="body2">Demo Users:</Typography>
                <Typography variant="caption">
                  Username: Raksha / Priya / John | Password: pass123
                </Typography>
              </Alert>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <TextField
                fullWidth
                type="password"
                label="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                fullWidth
                label="Phone Number (10 digits)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputProps={{ maxLength: 10 }}
                required
              />
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                startIcon={<PersonAdd />}
              >
                Register
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
