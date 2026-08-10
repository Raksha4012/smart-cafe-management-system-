import { useCafe } from '../context/CafeContext';
import {
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Delete, Edit, ShoppingCart } from '@mui/icons-material';
import { useState } from 'react';

export function CartView() {
  const { cart, removeFromCart, updateCartQuantity, updateCartComment } = useCafe();
  const [editDialog, setEditDialog] = useState<{ index: number; type: 'quantity' | 'comment' } | null>(null);
  const [editValue, setEditValue] = useState('');

  if (cart.length === 0) {
    return (
      <Box className="flex flex-col items-center justify-center h-64">
        <ShoppingCart className="text-gray-400" style={{ fontSize: 80 }} />
        <Typography variant="h6" color="text.secondary" className="mt-4">
          Your cart is empty
        </Typography>
        <Typography color="text.secondary">
          Add some delicious items from the menu!
        </Typography>
      </Box>
    );
  }

  const handleEdit = (index: number, type: 'quantity' | 'comment') => {
    const item = cart[index];
    setEditValue(type === 'quantity' ? item.quantity.toString() : item.comment);
    setEditDialog({ index, type });
  };

  const handleSaveEdit = () => {
    if (editDialog) {
      if (editDialog.type === 'quantity') {
        const qty = parseInt(editValue);
        if (qty > 0) {
          updateCartQuantity(editDialog.index, qty);
        }
      } else {
        updateCartComment(editDialog.index, editValue);
      }
      setEditDialog(null);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Box className="space-y-4">
      {cart.map((item, index) => (
        <Card key={index}>
          <CardContent>
            <Box className="flex justify-between items-start">
              <Box className="flex-1">
                <Typography variant="h6">{item.itemName}</Typography>
                <Typography color="text.secondary">
                  ₹{item.price} × {item.quantity} = ₹{(item.price * item.quantity).toFixed(2)}
                </Typography>
                {item.comment && (
                  <Typography variant="body2" color="text.secondary" className="mt-1">
                    📝 Note: {item.comment}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Prep time: ~{item.prepTime * item.quantity} min
                </Typography>
              </Box>

              <Box className="flex gap-1">
                <IconButton
                  size="small"
                  onClick={() => handleEdit(index, 'quantity')}
                  title="Edit quantity"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(index, 'comment')}
                  title="Edit comment"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeFromCart(index)}
                  title="Remove"
                >
                  <Delete />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent>
          <Typography variant="h6">Cart Summary</Typography>
          <Typography>Subtotal: ₹{subtotal.toFixed(2)}</Typography>
          <Typography variant="caption" color="text.secondary">
            Tax and discounts will be calculated at checkout
          </Typography>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onClose={() => setEditDialog(null)}>
        <DialogTitle>
          Edit {editDialog?.type === 'quantity' ? 'Quantity' : 'Comment'}
        </DialogTitle>
        <DialogContent>
          {editDialog?.type === 'quantity' ? (
            <TextField
              fullWidth
              type="number"
              label="Quantity"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              inputProps={{ min: 1 }}
              className="mt-2"
            />
          ) : (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Special Instructions"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="mt-2"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(null)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
