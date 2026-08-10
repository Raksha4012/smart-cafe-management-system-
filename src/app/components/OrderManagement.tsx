import { useState } from 'react';
import { useCafe } from '../context/CafeContext';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
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
  Divider
} from '@mui/material';
import { ShoppingBag, Visibility } from '@mui/icons-material';
import { OrderRecord } from '../types';

export function OrderManagement() {
  const { orders } = useCafe();
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  if (orders.length === 0) {
    return (
      <Box className="flex flex-col items-center justify-center h-64">
        <ShoppingBag className="text-gray-400" style={{ fontSize: 80 }} />
        <Typography variant="h6" color="text.secondary" className="mt-4">
          No orders found
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="space-y-4">
      <Typography variant="h4">Order Management</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.orderID}>
                <TableCell>{order.orderID}</TableCell>
                <TableCell>{order.username}</TableCell>
                <TableCell>₹{order.finalAmount.toFixed(2)}</TableCell>
                <TableCell>{order.paymentMethod}</TableCell>
                <TableCell>{order.orderDate}</TableCell>
                <TableCell>{order.orderTime}</TableCell>
                <TableCell>
                  <Chip
                    label={order.isCompleted ? '✓ Ready' : '⏳ Prep'}
                    color={order.isCompleted ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => setSelectedOrder(order)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>Order Details - #{selectedOrder.orderID}</DialogTitle>
            <DialogContent>
              <Box className="space-y-3">
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Customer Information
                  </Typography>
                  <Typography>Name: {selectedOrder.username}</Typography>
                  <Typography>Email: {selectedOrder.email}</Typography>
                  <Typography>Phone: {selectedOrder.phoneNumber}</Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Order Date & Time
                  </Typography>
                  <Typography>
                    {selectedOrder.orderDate} {selectedOrder.orderTime}
                  </Typography>
                  <Typography variant="caption">
                    Estimated prep time: {selectedOrder.estimatedPrepTime} minutes
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                    Items
                  </Typography>
                  {selectedOrder.items.map((item, idx) => (
                    <Box key={idx} className="mb-2">
                      <Box className="flex justify-between">
                        <Typography>
                          {item.itemName} x{item.quantity}
                        </Typography>
                        <Typography>₹{(item.price * item.quantity).toFixed(2)}</Typography>
                      </Box>
                      {item.comment && (
                        <Typography variant="body2" color="text.secondary">
                          Note: {item.comment}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" className="mb-2">
                    Bill Summary
                  </Typography>
                  <Box className="space-y-1">
                    <Box className="flex justify-between">
                      <Typography>Subtotal:</Typography>
                      <Typography>₹{selectedOrder.subtotal.toFixed(2)}</Typography>
                    </Box>
                    <Box className="flex justify-between">
                      <Typography>Tax (5%):</Typography>
                      <Typography>₹{selectedOrder.tax.toFixed(2)}</Typography>
                    </Box>
                    {selectedOrder.discount > 0 && (
                      <Box className="flex justify-between text-green-600">
                        <Typography>Discount:</Typography>
                        <Typography>-₹{selectedOrder.discount.toFixed(2)}</Typography>
                      </Box>
                    )}
                    <Divider />
                    <Box className="flex justify-between">
                      <Typography variant="h6">Final Amount:</Typography>
                      <Typography variant="h6">₹{selectedOrder.finalAmount.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Payment & Status
                  </Typography>
                  <Typography>Payment Method: {selectedOrder.paymentMethod}</Typography>
                  <Chip
                    label={selectedOrder.isCompleted ? '✓ READY FOR DELIVERY' : '⏳ BEING PREPARED'}
                    color={selectedOrder.isCompleted ? 'success' : 'warning'}
                    className="mt-2"
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedOrder(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
