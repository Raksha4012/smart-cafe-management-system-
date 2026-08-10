import { useState } from 'react';
import { useCafe } from '../context/CafeContext';
import {
  Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Box, Chip, List, ListItem, ListItemText,
  Badge, InputAdornment, IconButton, Alert
} from '@mui/material';
import {
  AccountBalanceWallet, Notifications, CheckCircle,
  Lock, Visibility, VisibilityOff, LockOpen
} from '@mui/icons-material';
import { toast } from 'sonner';

type PinMode = 'verify' | 'set';

export function UserProfile() {
  const { currentUser, orders, addWalletBalance, markNotificationsRead, setWalletPin } = useCafe();

  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Wallet PIN security
  const [balanceRevealed, setBalanceRevealed] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinMode, setPinMode] = useState<PinMode>('verify');
  const [pinInput, setPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  if (!currentUser) return null;

  const completedOrders = orders.filter(o => o.username === currentUser.username && o.isCompleted);
  const unreadNotifications = currentUser.notifications.filter(n => !n.isRead).length;
  const hasPin = !!currentUser.walletPin;

  const handleAddWallet = async () => {
    const amount = parseFloat(walletAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    await addWalletBalance(amount);
    toast.success(`₹${amount} added to wallet successfully!`);
    setShowWalletDialog(false);
    setWalletAmount('');
  };

  const openRevealBalance = () => {
    if (balanceRevealed) {
      setBalanceRevealed(false);
      return;
    }
    setPinMode(hasPin ? 'verify' : 'set');
    setPinInput('');
    setNewPin('');
    setConfirmPin('');
    setShowPin(false);
    setShowPinDialog(true);
  };

  const handlePinSubmit = async () => {
    if (pinMode === 'verify') {
      if (pinInput === currentUser.walletPin) {
        setBalanceRevealed(true);
        setShowPinDialog(false);
        setPinInput('');
        toast.success('Wallet balance revealed');
      } else {
        toast.error('Incorrect PIN. Try again.');
        setPinInput('');
      }
    } else {
      // Set mode
      if (newPin.length < 4) {
        toast.error('PIN must be 4 digits');
        return;
      }
      if (newPin !== confirmPin) {
        toast.error('PINs do not match');
        setConfirmPin('');
        return;
      }
      await setWalletPin(newPin);
      setBalanceRevealed(true);
      setShowPinDialog(false);
      toast.success('Wallet PIN set! Balance is now visible.');
    }
  };

  const handleOpenNotifications = async () => {
    setShowNotifications(true);
    await markNotificationsRead();
  };

  return (
    <Box className="max-w-2xl mx-auto space-y-4">
      <Typography variant="h4">My Profile</Typography>

      {/* Account Info */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-3">Account Information</Typography>
          <Box className="space-y-2">
            {[
              { label: 'Username', value: currentUser.username },
              { label: 'Email', value: currentUser.email },
              { label: 'Phone', value: currentUser.phoneNumber }
            ].map(({ label, value }) => (
              <Box key={label} className="flex justify-between items-center py-1 border-b last:border-0">
                <Typography color="text.secondary" variant="body2">{label}</Typography>
                <Typography sx={{ fontWeight: 500 }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Wallet — balance protected by PIN */}
      <Card>
        <CardContent>
          <Box className="flex justify-between items-center mb-3">
            <Box className="flex items-center gap-2">
              <AccountBalanceWallet color="primary" />
              <Typography variant="h6">Wallet</Typography>
              {hasPin && (
                <Chip
                  icon={<Lock sx={{ fontSize: 14 }} />}
                  label="PIN Protected"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
            <Button variant="contained" size="small" onClick={() => setShowWalletDialog(true)}>
              Add Funds
            </Button>
          </Box>

          {/* Balance display — hidden until PIN verified */}
          <Box className="flex items-center gap-3 mb-2">
            {balanceRevealed ? (
              <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                ₹{currentUser.walletBalance.toFixed(2)}
              </Typography>
            ) : (
              <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: 4, color: '#94a3b8' }}>
                ₹ ••••
              </Typography>
            )}
            <IconButton onClick={openRevealBalance} title={balanceRevealed ? 'Hide balance' : 'Reveal balance'}>
              {balanceRevealed ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </Box>

          {!balanceRevealed && (
            <Button
              variant="outlined" size="small" startIcon={<LockOpen />}
              onClick={openRevealBalance}
            >
              {hasPin ? 'Enter PIN to View Balance' : 'Set PIN & View Balance'}
            </Button>
          )}

          {!hasPin && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>Demo PIN:</strong> 1234 — Set your own PIN to protect your wallet balance.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-3">Order Statistics</Typography>
          <Box className="grid grid-cols-2 gap-4">
            {[
              { label: 'Total Orders', value: currentUser.orderHistory.length },
              { label: 'Completed', value: completedOrders.length },
              { label: 'Total Spent', value: `₹${currentUser.totalSpent.toFixed(2)}` },
              {
                label: 'Avg. Order Value',
                value: currentUser.orderHistory.length > 0
                  ? `₹${(currentUser.totalSpent / currentUser.orderHistory.length).toFixed(2)}`
                  : '₹0.00'
              }
            ].map(({ label, value }) => (
              <Box key={label} className="p-3 bg-gray-50 rounded-lg">
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardContent>
          <Box className="flex justify-between items-center mb-2">
            <Typography variant="h6">Notifications</Typography>
            <Badge badgeContent={unreadNotifications} color="error">
              <Button variant="outlined" startIcon={<Notifications />} onClick={handleOpenNotifications}>
                View All
              </Button>
            </Badge>
          </Box>
          <Typography color="text.secondary" variant="body2">
            {currentUser.notifications.length === 0
              ? 'No notifications yet'
              : unreadNotifications > 0
                ? `${unreadNotifications} unread notification${unreadNotifications !== 1 ? 's' : ''}`
                : 'All caught up!'}
          </Typography>
        </CardContent>
      </Card>

      {/* Completed Orders only */}
      <Card>
        <CardContent>
          <Box className="flex items-center gap-2 mb-3">
            <CheckCircle color="success" />
            <Typography variant="h6">Completed Orders</Typography>
          </Box>
          {completedOrders.length === 0 ? (
            <Box className="text-center py-6">
              <Typography color="text.secondary">No completed orders yet</Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">
                Your finished orders will appear here
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {completedOrders.map((order) => (
                <ListItem key={order.orderID} divider sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box className="flex items-center justify-between flex-wrap gap-2">
                        <Box className="flex items-center gap-2 flex-wrap">
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            Order #{order.orderID}
                          </Typography>
                          <Chip label="Completed" color="success" size="small" />
                          {order.splitPeople && (
                            <Chip label={`Split ÷${order.splitPeople}`} color="info" size="small" variant="outlined" />
                          )}
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Box className="mt-1 space-y-0.5">
                        <Typography variant="body2">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
                          <strong>₹{order.finalAmount.toFixed(2)}</strong>
                          {order.splitPeople && order.perPersonAmount && (
                            <span style={{ color: '#2563eb' }}>
                              {' '}(₹{order.perPersonAmount.toFixed(2)}/person)
                            </span>
                          )}
                          {' '}· {order.paymentMethod}
                        </Typography>
                        <Box className="flex justify-between items-center mt-1">
                          <Typography variant="caption" color="text.secondary">
                            {order.orderDate} at {order.orderTime}
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Add Wallet Dialog */}
      <Dialog open={showWalletDialog} onClose={() => setShowWalletDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Funds to Wallet</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {balanceRevealed
              ? `Current Balance: ₹${currentUser.walletBalance.toFixed(2)}`
              : 'Current Balance: ₹ ••••'}
          </Typography>
          <Box className="flex gap-2 mb-3 flex-wrap">
            {[100, 200, 500, 1000].map(amt => (
              <Chip
                key={amt} label={`+₹${amt}`} clickable
                onClick={() => setWalletAmount(String(amt))}
                color={walletAmount === String(amt) ? 'primary' : 'default'}
              />
            ))}
          </Box>
          <TextField
            fullWidth type="number" label="Custom Amount (₹)"
            value={walletAmount} onChange={e => setWalletAmount(e.target.value)}
            inputProps={{ min: 1, step: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWalletDialog(false)}>Cancel</Button>
          <Button onClick={handleAddWallet} variant="contained">Add Funds</Button>
        </DialogActions>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onClose={() => setShowNotifications(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent>
          {currentUser.notifications.length === 0 ? (
            <Typography color="text.secondary">No notifications</Typography>
          ) : (
            <List>
              {currentUser.notifications.slice().reverse().map((notif, idx) => (
                <ListItem key={idx} divider sx={{ px: 0 }}>
                  <ListItemText
                    primary={notif.message}
                    secondary={notif.timestamp}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNotifications(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Wallet PIN Dialog */}
      <Dialog open={showPinDialog} onClose={() => setShowPinDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <Box className="flex items-center gap-2">
            <Lock color="primary" />
            {pinMode === 'verify' ? 'Enter Wallet PIN' : 'Set Wallet PIN'}
          </Box>
        </DialogTitle>
        <DialogContent>
          {pinMode === 'verify' ? (
            <Box className="space-y-3 pt-1">
              <Typography variant="body2" color="text.secondary">
                Enter your 4-digit wallet PIN to view your balance.
              </Typography>
              <TextField
                fullWidth
                label="4-Digit PIN"
                value={pinInput}
                onChange={e => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                type={showPin ? 'text' : 'password'}
                inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPin(s => !s)} edge="end">
                        {showPin ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
                autoFocus
              />
              <Alert severity="info">
                Demo PIN: <strong>1234</strong>
              </Alert>
              <Button
                variant="text" size="small" onClick={() => { setPinMode('set'); setPinInput(''); }}
              >
                Forgot PIN? Reset it
              </Button>
            </Box>
          ) : (
            <Box className="space-y-3 pt-1">
              <Typography variant="body2" color="text.secondary">
                Create a 4-digit PIN to protect your wallet balance.
              </Typography>
              <TextField
                fullWidth label="New 4-Digit PIN"
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                type="password" inputProps={{ maxLength: 4, inputMode: 'numeric' }}
              />
              <TextField
                fullWidth label="Confirm PIN"
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                type="password" inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                onKeyDown={e => e.key === 'Enter' && handlePinSubmit()}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPinDialog(false)}>Cancel</Button>
          <Button
            onClick={handlePinSubmit} variant="contained"
            disabled={pinMode === 'verify' ? pinInput.length < 4 : (newPin.length < 4 || confirmPin.length < 4)}
          >
            {pinMode === 'verify' ? 'Verify' : 'Set PIN'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
