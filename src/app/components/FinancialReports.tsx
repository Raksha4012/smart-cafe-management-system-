import { useCafe } from '../context/CafeContext';
import { menuItems } from '../data/menuData';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  Receipt,
  Category,
  FileDownload
} from '@mui/icons-material';

export function FinancialReports() {
  const { orders, users, trendingDishes, totalRevenue, totalProfit } = useCafe();

  const handleDownloadCsv = (type: string) => {
    window.open(`/api/export/csv/${type}`, '_blank');
  };

  const completedOrders = orders.filter(o => o.isCompleted).length;
  const pendingOrders = orders.length - completedOrders;
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  // Today's sales
  const today = new Date().toLocaleDateString();
  const todayOrders = orders.filter(o => o.orderDate === today);
  const todayRevenue = todayOrders.reduce((sum, o) => sum + o.finalAmount, 0);

  // Payment method breakdown
  const paymentBreakdown = orders.reduce((acc, order) => {
    acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paymentAmount = orders.reduce((acc, order) => {
    acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + order.finalAmount;
    return acc;
  }, {} as Record<string, number>);

  // Category-wise sales
  const categorySales: Record<string, { count: number; amount: number }> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      const menuItem = menuItems.find(m => m.name === item.itemName);
      if (menuItem) {
        if (!categorySales[menuItem.category]) {
          categorySales[menuItem.category] = { count: 0, amount: 0 };
        }
        categorySales[menuItem.category].count += item.quantity;
        categorySales[menuItem.category].amount += item.price * item.quantity;
      }
    });
  });

  // Top customers
  const topCustomers = Object.values(users)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return (
    <Box className="space-y-4">
      <Box className="flex justify-between items-center flex-wrap gap-2">
        <Typography variant="h4">Financial Reports</Typography>
        <Box className="flex gap-2 flex-wrap">
          <Button variant="outlined" size="small" color="success" startIcon={<FileDownload />} onClick={() => handleDownloadCsv('orders')}>
            Orders.csv
          </Button>
          <Button variant="outlined" size="small" color="success" startIcon={<FileDownload />} onClick={() => handleDownloadCsv('users')}>
            Users.csv
          </Button>
          <Button variant="outlined" size="small" color="success" startIcon={<FileDownload />} onClick={() => handleDownloadCsv('ratings')}>
            Ratings.csv
          </Button>
          <Button variant="outlined" size="small" color="success" startIcon={<FileDownload />} onClick={() => handleDownloadCsv('menu')}>
            Menu.csv
          </Button>
        </Box>
      </Box>

      {/* Revenue Overview */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h5">₹{totalRevenue.toFixed(2)}</Typography>
                </Box>
                <AttachMoney color="primary" style={{ fontSize: 40 }} />
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
                  <Typography variant="h5">₹{totalProfit.toFixed(2)}</Typography>
                </Box>
                <TrendingUp color="primary" style={{ fontSize: 40 }} />
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
                    Profit Margin
                  </Typography>
                  <Typography variant="h5">{profitMargin.toFixed(1)}%</Typography>
                </Box>
                <Receipt color="primary" style={{ fontSize: 40 }} />
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
                    Avg Order Value
                  </Typography>
                  <Typography variant="h5">₹{avgOrderValue.toFixed(2)}</Typography>
                </Box>
                <Category color="primary" style={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Order Statistics */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-3">Order Statistics</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography color="text.secondary">Total Orders</Typography>
              <Typography variant="h5">{orders.length}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography color="text.secondary">Completed Orders</Typography>
              <Typography variant="h5">{completedOrders}</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography color="text.secondary">Pending Orders</Typography>
              <Typography variant="h5">{pendingOrders}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Today's Sales */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-2">Today's Sales</Typography>
          <Typography color="text.secondary">Date: {today}</Typography>
          <Box className="mt-3 space-y-1">
            <Box className="flex justify-between">
              <Typography>Total Orders:</Typography>
              <Typography>{todayOrders.length}</Typography>
            </Box>
            <Box className="flex justify-between">
              <Typography>Total Revenue:</Typography>
              <Typography>₹{todayRevenue.toFixed(2)}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Payment Method Breakdown */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-3">Payment Method Breakdown</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Payment Method</TableCell>
                  <TableCell>Number of Orders</TableCell>
                  <TableCell>Total Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(paymentBreakdown).map(([method, count]) => (
                  <TableRow key={method}>
                    <TableCell>{method}</TableCell>
                    <TableCell>{count}</TableCell>
                    <TableCell>₹{(paymentAmount[method] || 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Category-wise Sales */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-3">Category-wise Sales</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Items Sold</TableCell>
                  <TableCell>Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(categorySales)
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .map(([category, data]) => (
                    <TableRow key={category}>
                      <TableCell>{category}</TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell>₹{data.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Top 5 Customers */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-3">Top 5 Customers</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Total Spent</TableCell>
                  <TableCell>Orders</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topCustomers.map((customer, idx) => (
                  <TableRow key={customer.username}>
                    <TableCell>#{idx + 1}</TableCell>
                    <TableCell>{customer.username}</TableCell>
                    <TableCell>₹{customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>{customer.orderHistory.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
