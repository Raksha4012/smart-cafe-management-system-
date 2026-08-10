import { useCafe } from '../context/CafeContext';
import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import {
  People,
  ShoppingBag,
  AttachMoney,
  Restaurant,
  TrendingUp,
  CheckCircle,
  HourglassEmpty
} from '@mui/icons-material';

export function AdminDashboard() {
  const { users, orders, kitchenQueue, trendingDishes, totalRevenue, totalProfit } = useCafe();

  const userCount = Object.keys(users).length;
  const pendingKitchenItems = kitchenQueue.filter(item => !item.isPrepared).length;
  const completedOrders = orders.filter(o => o.isCompleted).length;
  const pendingOrders = orders.length - completedOrders;

  const topDishes = Object.entries(trendingDishes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const totalNotifications = Object.values(users).reduce(
    (sum, user) => sum + user.notifications.filter(n => !n.isRead).length,
    0
  );

  return (
    <Box className="space-y-4">
      <Typography variant="h4">Admin Dashboard</Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Users
                  </Typography>
                  <Typography variant="h4">{userCount}</Typography>
                </Box>
                <People color="primary" style={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Orders
                  </Typography>
                  <Typography variant="h4">{orders.length}</Typography>
                </Box>
                <ShoppingBag color="primary" style={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">₹{totalRevenue.toFixed(0)}</Typography>
                </Box>
                <AttachMoney color="primary" style={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Profit
                  </Typography>
                  <Typography variant="h4">₹{totalProfit.toFixed(0)}</Typography>
                </Box>
                <TrendingUp color="primary" style={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Kitchen Status */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-3">Kitchen Status</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box className="flex items-center gap-2">
                <HourglassEmpty color="warning" />
                <Box>
                  <Typography variant="h5">{pendingKitchenItems}</Typography>
                  <Typography color="text.secondary">Items Pending</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box className="flex items-center gap-2">
                <Restaurant color="action" />
                <Box>
                  <Typography variant="h5">{kitchenQueue.length}</Typography>
                  <Typography color="text.secondary">Total Queue</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Order Status */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-3">Order Status</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box className="flex items-center gap-2">
                <CheckCircle color="success" />
                <Box>
                  <Typography variant="h5">{completedOrders}</Typography>
                  <Typography color="text.secondary">Completed Orders</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box className="flex items-center gap-2">
                <HourglassEmpty color="warning" />
                <Box>
                  <Typography variant="h5">{pendingOrders}</Typography>
                  <Typography color="text.secondary">Pending Orders</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Top 3 Dishes */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-3">Top 3 Dishes</Typography>
          {topDishes.length === 0 ? (
            <Typography color="text.secondary">No orders yet</Typography>
          ) : (
            <Box className="space-y-2">
              {topDishes.map(([dish, count], idx) => (
                <Box key={dish} className="flex justify-between items-center">
                  <Box className="flex items-center gap-2">
                    <Typography variant="h6" color="primary">
                      #{idx + 1}
                    </Typography>
                    <Typography>{dish}</Typography>
                  </Box>
                  <Typography color="text.secondary">
                    {count} orders
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardContent>
          <Typography variant="h6">Pending Notifications</Typography>
          <Typography variant="h4" color="primary">
            {totalNotifications}
          </Typography>
          <Typography color="text.secondary">Unread notifications</Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
