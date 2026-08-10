import { useState, useEffect, useRef } from 'react';
import { useCafe, FoodPreference } from '../context/CafeContext';
import { MenuView } from './MenuView';
import { Checkout } from './Checkout';
import { UserProfile } from './UserProfile';
import {
  Button, Tabs, Tab, Box, AppBar, Toolbar, Typography,
  Dialog, DialogContent, DialogTitle, DialogActions, Paper, Chip, Slide
} from '@mui/material';
import {
  Restaurant, Person, Logout,
  LocalDining, CheckCircle, ShoppingBag
} from '@mui/icons-material';
import { toast } from 'sonner';

type NonNullFoodPref = 'Veg' | 'NonVeg' | 'Vegan' | 'AllTypes';

const prefLabel: Record<NonNullFoodPref, string> = {
  Veg: '🥦 Veg',
  NonVeg: '🍗 Non-Veg',
  Vegan: '🌱 Vegan',
  AllTypes: '🍽️ All Foods'
};

export function UserPortal({ onMainMenu }: { onMainMenu?: () => void }) {
  const { currentUser, cart, logoutUser, foodPreference, setFoodPreference } = useCafe();
  const [activeTab, setActiveTab] = useState('menu');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderReadyDialog, setOrderReadyDialog] = useState<{ orderID: string; message: string } | null>(null);
  const prevNotifCount = useRef(currentUser?.notifications.length ?? 0);

  // Watch for new order-completion notifications and show popup dialog
  useEffect(() => {
    const notifs = currentUser?.notifications ?? [];
    const currentCount = notifs.length;
    if (currentCount > prevNotifCount.current) {
      const latest = notifs[notifs.length - 1];
      if (latest && latest.message.includes('completed successfully')) {
        setOrderReadyDialog({ orderID: latest.orderID, message: latest.message });
      }
    }
    prevNotifCount.current = currentCount;
  }, [currentUser?.notifications]);

  if (!currentUser) return null;

  // Show food preference selection on every fresh login
  if (foodPreference === null) {
    return <FoodPreferenceScreen onSelect={setFoodPreference} username={currentUser.username} />;
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const unreadNotifications = currentUser.notifications.filter(n => !n.isRead).length;
  const activePref = foodPreference as NonNullFoodPref;

  return (
    <Box className="size-full flex flex-col bg-gray-50">
      <AppBar position="static">
        <Toolbar className="gap-2">
          <Restaurant className="mr-1" />
          <Typography variant="h6" className="flex-1 truncate">
            Welcome, {currentUser.username}!
          </Typography>
          {/* Wallet hidden for security — use Profile to view balance */}
          <Chip
            label={prefLabel[activePref]}
            size="small"
            onClick={() => setFoodPreference(null)}
            title="Tap to change food preference"
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}
          />
          <Button color="inherit" onClick={logoutUser} startIcon={<Logout />} size="small">
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box className="flex-1 flex flex-col overflow-hidden relative">
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          className="bg-white border-b"
        >
          <Tab value="menu" label="Menu" icon={<Restaurant />} iconPosition="start" />
          <Tab
            value="profile"
            label={
              unreadNotifications > 0
                ? <Box className="flex items-center gap-1">
                    Profile
                    <Chip label={unreadNotifications} size="small" color="error" sx={{ height: 18, fontSize: 10 }} />
                  </Box>
                : 'Profile'
            }
            icon={<Person />}
            iconPosition="start"
          />
        </Tabs>

        <Box className="flex-1 overflow-auto p-4 pb-24">
          {activeTab === 'menu' && <MenuView />}
          {activeTab === 'profile' && <UserProfile />}
        </Box>

        {/* Sticky checkout bar — slides up when cart has items */}
        {cart.length > 0 && (
          <Slide direction="up" in mountOnEnter unmountOnExit>
            <Paper
              elevation={8}
              className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between gap-3"
              sx={{ borderRadius: '12px 12px 0 0', bgcolor: 'primary.main' }}
            >
              <Box className="flex items-center gap-2">
                <ShoppingBag sx={{ color: 'white' }} />
                <Typography sx={{ color: 'white', fontWeight: 600 }}>
                  {cart.length} item{cart.length !== 1 ? 's' : ''}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: 14 }}>
                  · ₹{cartTotal.toFixed(2)}
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => setCheckoutOpen(true)}
                sx={{
                  bgcolor: 'white', color: 'primary.main', fontWeight: 700,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
              >
                Proceed to Pay
              </Button>
            </Paper>
          </Slide>
        )}
      </Box>

      {/* Checkout Dialog */}
      <Dialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { m: 1, maxHeight: '95vh' } }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box className="flex items-center gap-2">
            <LocalDining color="primary" />
            <Typography variant="h6">Complete Your Order</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflowY: 'auto' }}>
          <Checkout onClose={() => setCheckoutOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Order Ready Popup */}
      <Dialog
        open={!!orderReadyDialog}
        onClose={() => setOrderReadyDialog(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            textAlign: 'center'
          }
        }}
      >
        {/* Green header strip */}
        <Box sx={{ bgcolor: '#22c55e', py: 4, px: 3 }}>
          <CheckCircle sx={{ fontSize: 72, color: 'white', mb: 1 }} />
          <Typography variant="h5" sx={{ color: 'white', fontWeight: 800 }}>
            Order Ready!
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', mt: 0.5 }}>
            Your order is prepared and waiting for you
          </Typography>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <Box sx={{
            bgcolor: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 2, px: 2, py: 1.5, mb: 2
          }}>
            <Typography variant="caption" color="text.secondary">Order ID</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#15803d', fontFamily: 'monospace' }}>
              #{orderReadyDialog?.orderID}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Please collect your order from the counter. Thank you for dining with us! 🙏
          </Typography>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => setOrderReadyDialog(null)}
            sx={{
              bgcolor: '#22c55e', fontWeight: 700, borderRadius: 2,
              '&:hover': { bgcolor: '#16a34a' }
            }}
          >
            Got it, Thanks!
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function FoodPreferenceScreen({
  onSelect,
  username
}: {
  onSelect: (pref: FoodPreference) => void;
  username: string;
}) {
  const preferences = [
    {
      key: 'Veg' as const,
      emoji: '🥦',
      label: 'Vegetarian',
      desc: 'Plant-based dishes, dairy & eggs included',
      color: '#16a34a', bg: '#f0fdf4'
    },
    {
      key: 'Vegan' as const,
      emoji: '🌱',
      label: 'Vegan',
      desc: 'Strictly plant-based, no animal products',
      color: '#059669', bg: '#ecfdf5'
    },
    {
      key: 'NonVeg' as const,
      emoji: '🍗',
      label: 'Non-Vegetarian',
      desc: 'Meat & seafood dishes only',
      color: '#dc2626', bg: '#fff5f5'
    },
    {
      key: 'AllTypes' as const,
      emoji: '🍽️',
      label: 'All Food Types',
      desc: 'Show everything — no restrictions',
      color: '#7c3aed', bg: '#f5f3ff'
    }
  ];

  return (
    <Box
      className="min-h-screen flex flex-col items-center justify-center p-6"
      sx={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)' }}
    >
      <Box className="max-w-md w-full">
        <Box className="text-center mb-8">
          <Typography sx={{ fontSize: 48, mb: 1 }}>🍽️</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 1 }}>
            Welcome, {username}!
          </Typography>
          <Typography variant="body1" sx={{ color: '#555' }}>
            What kind of food would you like today?
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', mt: 0.5 }}>
            Your menu will be filtered to match your preference
          </Typography>
        </Box>

        <Box className="flex flex-col gap-3">
          {preferences.map(pref => (
            <Paper
              key={pref.key}
              elevation={2}
              onClick={() => onSelect(pref.key)}
              sx={{
                p: 2.5, cursor: 'pointer',
                border: '2px solid transparent',
                borderRadius: 3, bgcolor: pref.bg,
                transition: 'all 0.18s ease',
                '&:hover': {
                  borderColor: pref.color,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 24px ${pref.color}28`
                },
                '&:active': { transform: 'scale(0.99)' }
              }}
            >
              <Box className="flex items-center gap-3">
                <Typography sx={{ fontSize: 36, lineHeight: 1 }}>{pref.emoji}</Typography>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: pref.color, mb: 0.25, fontSize: '1rem' }}>
                    {pref.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    {pref.desc}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: '#aaa' }}>
          Tap the preference chip in the top bar anytime to change this
        </Typography>
      </Box>
    </Box>
  );
}
