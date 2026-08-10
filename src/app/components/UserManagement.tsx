import { useState } from 'react';
import { useCafe } from '../context/CafeContext';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { People, Visibility, ShoppingBag } from '@mui/icons-material';
import { User } from '../types';

export function UserManagement() {
  const { users, orders } = useCafe();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const userList = Object.values(users);

  if (userList.length === 0) {
    return (
      <Box className="flex flex-col items-center justify-center h-64">
        <People className="text-gray-400" style={{ fontSize: 80 }} />
        <Typography variant="h6" color="text.secondary" className="mt-4">
          No users found
        </Typography>
      </Box>
    );
  }

  const getUserOrders = (username: string) => {
    return orders.filter(o => o.username === username);
  };

  return (
    <Box className="space-y-4">
      <Typography variant="h4">User Management</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Wallet</TableCell>
              <TableCell>Total Spent</TableCell>
              <TableCell>Orders</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userList.map((user) => (
              <TableRow key={user.username}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>₹{user.walletBalance.toFixed(2)}</TableCell>
                <TableCell>₹{user.totalSpent.toFixed(2)}</TableCell>
                <TableCell>{user.orderHistory.length}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => setSelectedUser(user)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Details Dialog */}
      <Dialog
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedUser && (
          <>
            <DialogTitle>User Details - {selectedUser.username}</DialogTitle>
            <DialogContent>
              <Box className="space-y-3">
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                      Account Information
                    </Typography>
                    <Box className="space-y-1">
                      <Box className="flex justify-between">
                        <Typography>Email:</Typography>
                        <Typography>{selectedUser.email}</Typography>
                      </Box>
                      <Box className="flex justify-between">
                        <Typography>Phone:</Typography>
                        <Typography>{selectedUser.phoneNumber}</Typography>
                      </Box>
                      <Box className="flex justify-between">
                        <Typography>Wallet Balance:</Typography>
                        <Typography>₹{selectedUser.walletBalance.toFixed(2)}</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                      Order Statistics
                    </Typography>
                    <Box className="space-y-1">
                      <Box className="flex justify-between">
                        <Typography>Total Orders:</Typography>
                        <Typography>{selectedUser.orderHistory.length}</Typography>
                      </Box>
                      <Box className="flex justify-between">
                        <Typography>Total Amount Spent:</Typography>
                        <Typography>₹{selectedUser.totalSpent.toFixed(2)}</Typography>
                      </Box>
                      <Box className="flex justify-between">
                        <Typography>Average Order Value:</Typography>
                        <Typography>
                          ₹{selectedUser.orderHistory.length > 0
                            ? (selectedUser.totalSpent / selectedUser.orderHistory.length).toFixed(2)
                            : '0.00'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                      Order History
                    </Typography>
                    {selectedUser.orderHistory.length === 0 ? (
                      <Typography color="text.secondary">No orders yet</Typography>
                    ) : (
                      <List dense>
                        {getUserOrders(selectedUser.username).map((order) => (
                          <ListItem key={order.orderID} divider>
                            <ListItemText
                              primary={
                                <Box className="flex items-center gap-2">
                                  <ShoppingBag fontSize="small" />
                                  <Typography>#{order.orderID}</Typography>
                                  <Chip
                                    label={order.isCompleted ? 'Completed' : 'Pending'}
                                    color={order.isCompleted ? 'success' : 'warning'}
                                    size="small"
                                  />
                                </Box>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2">
                                    Amount: ₹{order.finalAmount.toFixed(2)} • {order.paymentMethod}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {order.orderDate} {order.orderTime}
                                  </Typography>
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedUser(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
