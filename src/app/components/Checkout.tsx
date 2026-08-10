import { useState, useEffect } from 'react';
import { useCafe } from '../context/CafeContext';
import {
  Typography, Button, TextField, Box, Divider, Alert,
  ToggleButton, ToggleButtonGroup, Collapse, Paper
} from '@mui/material';
import {
  Payment, CheckCircle, Person, Group,
  CreditCard, PhoneAndroid, AccountBalanceWallet, AttachMoney
} from '@mui/icons-material';
import { toast } from 'sonner';

interface CheckoutProps {
  onClose?: () => void;
}

type PaymentMode = 'full-self' | 'split';
type FullPayMethod = 'Card' | 'UPI' | 'Wallet';
type SplitPayMethod = 'Card' | 'UPI' | 'Wallet' | 'Cash';

interface PersonPayment {
  method: SplitPayMethod;
  detail: string;
}

interface PlacedOrderInfo {
  id: string;
  perPerson: number;
  prepTime: number;
  orderItems: Array<{ name: string; qty: number; price: number }>;
  subtotal: number;
  tax: number;
  discount: number;
  finalAmount: number;
  splitPeople: number;
}

export function Checkout({ onClose }: CheckoutProps) {
  const { cart, currentUser, createOrder } = useCafe();

  // --- all hooks must be declared before any early returns ---
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('full-self');
  const [splitPeople, setSplitPeople] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState<FullPayMethod>('Card');
  const [cardNumber, setCardNumber] = useState('');
  const [upiId, setUpiId] = useState('');
  const [personPayments, setPersonPayments] = useState<PersonPayment[]>([
    { method: 'Card', detail: '' },
    { method: 'Card', detail: '' }
  ]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrderInfo | null>(null);

  // Keep personPayments array in sync with splitPeople count
  useEffect(() => {
    if (paymentMode !== 'split') return;
    setPersonPayments(prev => {
      if (prev.length === splitPeople) return prev;
      if (prev.length < splitPeople) {
        return [
          ...prev,
          ...Array.from({ length: splitPeople - prev.length }, () => ({ method: 'Card' as const, detail: '' }))
        ];
      }
      return prev.slice(0, splitPeople);
    });
  }, [splitPeople, paymentMode]);

  if (!currentUser) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.05;
  const discount = subtotal > 500 ? subtotal * 0.10 : 0;
  const finalAmount = subtotal + tax - discount;

  const isSplit = paymentMode === 'split';
  const effectivePeople = isSplit ? Math.max(2, splitPeople) : 1;
  const perPersonAmount = finalAmount / effectivePeople;
  const amountToPay = isSplit ? perPersonAmount : finalAmount;
  const canPayByWallet = currentUser.walletBalance >= amountToPay;

  const updatePersonPayment = (idx: number, updates: Partial<PersonPayment>) => {
    setPersonPayments(prev => prev.map((p, i) => i === idx ? { ...p, ...updates } : p));
  };

  const handleCheckout = async () => {
    // Capture cart data NOW — createOrder will clear the cart on next render
    const capturedItems = cart.map(i => ({ name: i.itemName, qty: i.quantity, price: i.price }));
    const capturedPrepTime = cart.reduce((sum, item) => sum + item.prepTime * item.quantity, 0);

    if (isSplit) {
      // Validate each person's payment
      for (let i = 0; i < personPayments.length; i++) {
        const p = personPayments[i];
        if (p.method === 'Card' && p.detail.length < 4) {
          toast.error(`Person ${i + 1}: Enter last 4 digits of card`);
          return;
        }
        if (p.method === 'UPI' && !p.detail.trim()) {
          toast.error(`Person ${i + 1}: Enter UPI ID`);
          return;
        }
      }
      if (personPayments[0]?.method === 'Wallet' && !canPayByWallet) {
        toast.error(`Insufficient wallet balance. Need ₹${perPersonAmount.toFixed(2)}, have ₹${currentUser.walletBalance.toFixed(2)}`);
        return;
      }

      const myMethod = personPayments[0]?.method;
      const apiMethod: FullPayMethod = (myMethod === 'Cash' ? 'Card' : myMethod) as FullPayMethod;
      const order = await createOrder(apiMethod, effectivePeople, perPersonAmount);

      if (order) {
        setPlacedOrder({
          id: order.orderID, perPerson: perPersonAmount, prepTime: capturedPrepTime,
          orderItems: capturedItems, subtotal, tax, discount, finalAmount, splitPeople: effectivePeople
        });
        setShowReceipt(true);
        toast.success(`Order placed! Each person pays ₹${perPersonAmount.toFixed(2)}`);
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    } else {
      // Full-self validation
      if (paymentMethod === 'Card' && cardNumber.length < 4) {
        toast.error('Enter last 4 digits of your card');
        return;
      }
      if (paymentMethod === 'UPI' && !upiId.trim()) {
        toast.error('Enter your UPI ID');
        return;
      }
      if (paymentMethod === 'Wallet' && !canPayByWallet) {
        toast.error(`Insufficient wallet balance. Need ₹${finalAmount.toFixed(2)}, have ₹${currentUser.walletBalance.toFixed(2)}`);
        return;
      }

      const order = await createOrder(paymentMethod, 1, finalAmount);
      if (order) {
        setPlacedOrder({
          id: order.orderID, perPerson: finalAmount, prepTime: capturedPrepTime,
          orderItems: capturedItems, subtotal, tax, discount, finalAmount, splitPeople: 1
        });
        setShowReceipt(true);
        toast.success('Order placed successfully!');
      } else {
        toast.error('Failed to place order. Please try again.');
      }
    }
  };

  // --- Receipt screen (uses captured data, not emptied cart) ---
  if (showReceipt && placedOrder) {
    return (
      <Box className="p-6 text-center space-y-4">
        <CheckCircle sx={{ fontSize: 72, color: '#22c55e' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Order Placed!</Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Order ID: <strong>{placedOrder.id}</strong>
        </Typography>

        <Box className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
          {placedOrder.orderItems.map((item, idx) => (
            <Box key={idx} className="flex justify-between">
              <Typography variant="body2">{item.name} ×{item.qty}</Typography>
              <Typography variant="body2">₹{(item.price * item.qty).toFixed(2)}</Typography>
            </Box>
          ))}
          <Divider />
          <Box className="flex justify-between">
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2">₹{placedOrder.subtotal.toFixed(2)}</Typography>
          </Box>
          <Box className="flex justify-between">
            <Typography variant="body2" color="text.secondary">Tax (5%)</Typography>
            <Typography variant="body2">₹{placedOrder.tax.toFixed(2)}</Typography>
          </Box>
          {placedOrder.discount > 0 && (
            <Box className="flex justify-between" sx={{ color: '#16a34a' }}>
              <Typography variant="body2">Discount (10%)</Typography>
              <Typography variant="body2">-₹{placedOrder.discount.toFixed(2)}</Typography>
            </Box>
          )}
          <Divider />
          <Box className="flex justify-between">
            <Typography sx={{ fontWeight: 700 }}>Total Bill</Typography>
            <Typography sx={{ fontWeight: 700 }}>₹{placedOrder.finalAmount.toFixed(2)}</Typography>
          </Box>
          {placedOrder.splitPeople > 1 && (
            <Box className="flex justify-between bg-blue-50 rounded-lg p-2">
              <Typography variant="body2" color="primary">
                Your share (÷{placedOrder.splitPeople} people)
              </Typography>
              <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
                ₹{placedOrder.perPerson.toFixed(2)}
              </Typography>
            </Box>
          )}
        </Box>

        <Alert severity="info" sx={{ textAlign: 'left' }}>
          {placedOrder.prepTime > 0
            ? `Sent to kitchen! Estimated prep time: ~${placedOrder.prepTime} minutes`
            : 'Sent to kitchen! Prep time will be confirmed shortly.'}
        </Alert>

        <Button
          fullWidth variant="contained" size="large"
          onClick={() => {
            setShowReceipt(false);
            setPlacedOrder(null);
            setCardNumber('');
            setUpiId('');
            if (onClose) onClose();
          }}
        >
          Back to Menu
        </Button>
      </Box>
    );
  }

  // --- Checkout form ---
  return (
    <Box>
      {/* Order Summary */}
      <Box className="p-4 bg-gray-50">
        <Typography variant="overline" color="text.secondary">Order Summary</Typography>
        {cart.map((item, idx) => (
          <Box key={idx} className="flex justify-between mb-1 mt-1">
            <Typography variant="body2">{item.itemName} ×{item.quantity}</Typography>
            <Typography variant="body2">₹{(item.price * item.quantity).toFixed(2)}</Typography>
          </Box>
        ))}
        <Divider sx={{ my: 1.5 }} />
        <Box className="space-y-1">
          <Box className="flex justify-between">
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="body2">₹{subtotal.toFixed(2)}</Typography>
          </Box>
          <Box className="flex justify-between">
            <Typography variant="body2" color="text.secondary">Tax (5%)</Typography>
            <Typography variant="body2">₹{tax.toFixed(2)}</Typography>
          </Box>
          {discount > 0 && (
            <Box className="flex justify-between" sx={{ color: '#16a34a' }}>
              <Typography variant="body2">Discount (10% on orders &gt; ₹500)</Typography>
              <Typography variant="body2">-₹{discount.toFixed(2)}</Typography>
            </Box>
          )}
          <Divider sx={{ my: 1 }} />
          <Box className="flex justify-between">
            <Typography sx={{ fontWeight: 700 }}>Total Bill</Typography>
            <Typography sx={{ fontWeight: 700 }}>₹{finalAmount.toFixed(2)}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            ⏱ Est. prep time: ~{cart.reduce((s, i) => s + i.prepTime * i.quantity, 0)} min
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Payment Mode Selection */}
      <Box className="p-4">
        <Typography variant="overline" color="text.secondary">How would you like to pay?</Typography>
        <Box className="flex flex-col gap-2 mt-2">

          {/* Pay Full Amount by Yourself */}
          <Box
            onClick={() => setPaymentMode('full-self')}
            sx={{
              border: '2px solid',
              borderColor: paymentMode === 'full-self' ? 'primary.main' : 'divider',
              borderRadius: 2, p: 2, cursor: 'pointer',
              bgcolor: paymentMode === 'full-self' ? '#eff6ff' : 'background.paper',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: 'primary.main' }
            }}
          >
            <Box className="flex items-center gap-3">
              <Person color={paymentMode === 'full-self' ? 'primary' : 'action'} />
              <Box className="flex-1">
                <Typography sx={{ fontWeight: 600 }}>Pay Full Amount by Yourself</Typography>
                <Typography variant="body2" color="text.secondary">
                  You cover the entire bill — ₹{finalAmount.toFixed(2)}
                </Typography>
              </Box>
              {paymentMode === 'full-self' && <CheckCircle color="primary" fontSize="small" />}
            </Box>
          </Box>

          {/* Split Payment */}
          <Box
            onClick={() => setPaymentMode('split')}
            sx={{
              border: '2px solid',
              borderColor: paymentMode === 'split' ? 'primary.main' : 'divider',
              borderRadius: 2, p: 2, cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: 'primary.main' }
            }}
          >
            <Box className="flex items-center gap-3">
              <Group color={paymentMode === 'split' ? 'primary' : 'action'} />
              <Box className="flex-1">
                <Typography sx={{ fontWeight: 600 }}>Split Payment with Others</Typography>
                <Typography variant="body2" color="text.secondary">
                  Each person pays an equal share
                </Typography>
              </Box>
              {paymentMode === 'split' && <CheckCircle color="primary" fontSize="small" />}
            </Box>

            <Collapse in={paymentMode === 'split'}>
              <Box className="mt-3 pt-3 border-t" onClick={e => e.stopPropagation()}>
                {/* People count selector */}
                <Box className="flex items-center gap-3 mb-3">
                  <Typography variant="body2" color="text.secondary">Split between:</Typography>
                  <Button variant="outlined" size="small"
                    onClick={() => setSplitPeople(p => Math.max(2, p - 1))}
                    sx={{ minWidth: 32, height: 32, p: 0 }}>−</Button>
                  <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 28, textAlign: 'center' }}>
                    {splitPeople}
                  </Typography>
                  <Button variant="outlined" size="small"
                    onClick={() => setSplitPeople(p => Math.min(10, p + 1))}
                    sx={{ minWidth: 32, height: 32, p: 0 }}>+</Button>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                    = ₹{perPersonAmount.toFixed(2)} each
                  </Typography>
                </Box>

                {/* Per-person payment sections — one card per person */}
                <Box className="space-y-2">
                  {personPayments.map((p, idx) => (
                    <Paper key={idx} variant="outlined" sx={{
                      p: 2, borderRadius: 2,
                      bgcolor: idx === 0 ? '#eff6ff' : '#fafafa',
                      borderColor: idx === 0 ? 'primary.main' : 'divider'
                    }}>
                      <Box className="flex justify-between items-center mb-1.5">
                        <Typography variant="subtitle2" sx={{
                          fontWeight: 700,
                          color: idx === 0 ? 'primary.main' : 'text.primary'
                        }}>
                          {idx === 0 ? '👤 You (Person 1)' : `👤 Person ${idx + 1}`}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          ₹{perPersonAmount.toFixed(2)}
                        </Typography>
                      </Box>

                      <ToggleButtonGroup
                        value={p.method} exclusive size="small"
                        onChange={(_, val) => val && updatePersonPayment(idx, { method: val as SplitPayMethod, detail: '' })}
                        sx={{ mb: 1.5 }}
                      >
                        <ToggleButton value="Card" sx={{ fontSize: 11, py: 0.5, gap: 0.3 }}>
                          <CreditCard sx={{ fontSize: 14 }} /> Card
                        </ToggleButton>
                        <ToggleButton value="UPI" sx={{ fontSize: 11, py: 0.5, gap: 0.3 }}>
                          <PhoneAndroid sx={{ fontSize: 14 }} /> UPI
                        </ToggleButton>
                        {idx === 0 ? (
                          <ToggleButton value="Wallet" sx={{ fontSize: 11, py: 0.5, gap: 0.3 }}>
                            <AccountBalanceWallet sx={{ fontSize: 14 }} /> Wallet
                          </ToggleButton>
                        ) : (
                          <ToggleButton value="Cash" sx={{ fontSize: 11, py: 0.5, gap: 0.3 }}>
                            <AttachMoney sx={{ fontSize: 14 }} /> Cash
                          </ToggleButton>
                        )}
                      </ToggleButtonGroup>

                      {p.method === 'Card' && (
                        <TextField size="small" fullWidth
                          label="Last 4 digits of card"
                          value={p.detail}
                          onChange={e => updatePersonPayment(idx, { detail: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                          inputProps={{ maxLength: 4, inputMode: 'numeric' }}
                        />
                      )}
                      {p.method === 'UPI' && (
                        <TextField size="small" fullWidth
                          label="UPI ID" value={p.detail}
                          onChange={e => updatePersonPayment(idx, { detail: e.target.value })}
                          placeholder="name@upi"
                        />
                      )}
                      {p.method === 'Wallet' && idx === 0 && (
                        <Box sx={{ p: 1, borderRadius: 1, bgcolor: canPayByWallet ? '#f0fdf4' : '#fff5f5' }}>
                          <Typography variant="caption" sx={{ color: canPayByWallet ? '#16a34a' : '#dc2626' }}>
                            Balance: ₹{currentUser.walletBalance.toFixed(2)} · Deduct: ₹{perPersonAmount.toFixed(2)}
                            {!canPayByWallet && ' — Insufficient!'}
                          </Typography>
                        </Box>
                      )}
                      {p.method === 'Cash' && (
                        <Typography variant="caption" color="text.secondary">
                          Cash will be collected at the counter
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Box>
              </Box>
            </Collapse>
          </Box>
        </Box>

        {/* Amount callout */}
        <Box className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200 flex justify-between items-center">
          <Typography variant="body2" sx={{ color: '#15803d', fontWeight: 600 }}>
            {isSplit ? 'Your share to pay:' : 'Amount to pay:'}
          </Typography>
          <Typography variant="h6" sx={{ color: '#15803d', fontWeight: 700 }}>
            ₹{amountToPay.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Full-self payment method (only shown for non-split mode) */}
      {!isSplit && (
        <Box className="p-4">
          <Typography variant="overline" color="text.secondary">Payment Method</Typography>
          <ToggleButtonGroup
            value={paymentMethod} exclusive
            onChange={(_, val) => val && setPaymentMethod(val as FullPayMethod)}
            fullWidth sx={{ mt: 1.5, mb: 2 }}
          >
            <ToggleButton value="Card" sx={{ gap: 0.5, fontSize: 13 }}>
              <CreditCard fontSize="small" /> Card
            </ToggleButton>
            <ToggleButton value="UPI" sx={{ gap: 0.5, fontSize: 13 }}>
              <PhoneAndroid fontSize="small" /> UPI
            </ToggleButton>
            <ToggleButton value="Wallet" sx={{ gap: 0.5, fontSize: 13 }}>
              <AccountBalanceWallet fontSize="small" /> Wallet
            </ToggleButton>
          </ToggleButtonGroup>

          <Collapse in={paymentMethod === 'Card'}>
            <TextField fullWidth label="Last 4 digits of card" value={cardNumber}
              onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 4))}
              inputProps={{ maxLength: 4, inputMode: 'numeric' }} placeholder="e.g. 4242" sx={{ mb: 1 }} />
          </Collapse>
          <Collapse in={paymentMethod === 'UPI'}>
            <TextField fullWidth label="UPI ID" value={upiId}
              onChange={e => setUpiId(e.target.value)} placeholder="yourname@upi" sx={{ mb: 1 }} />
          </Collapse>
          <Collapse in={paymentMethod === 'Wallet'}>
            <Box className="p-3 bg-gray-50 rounded-lg space-y-1">
              <Box className="flex justify-between">
                <Typography variant="body2" color="text.secondary">Wallet Balance</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>₹{currentUser.walletBalance.toFixed(2)}</Typography>
              </Box>
              <Box className="flex justify-between">
                <Typography variant="body2" color="text.secondary">Amount to Deduct</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: canPayByWallet ? 'inherit' : '#dc2626' }}>
                  ₹{amountToPay.toFixed(2)}
                </Typography>
              </Box>
              {!canPayByWallet && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  Insufficient balance. Add ₹{(amountToPay - currentUser.walletBalance).toFixed(2)} more via Profile &gt; Add Funds.
                </Alert>
              )}
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Place Order Button */}
      <Box className="p-4 pt-0">
        <Button
          fullWidth variant="contained" size="large" startIcon={<Payment />}
          onClick={handleCheckout}
          disabled={
            !isSplit
              ? paymentMethod === 'Wallet' && !canPayByWallet
              : personPayments[0]?.method === 'Wallet' && !canPayByWallet
          }
          sx={{ py: 1.5, fontWeight: 700, fontSize: 15 }}
        >
          {isSplit
            ? `Confirm My Share — ₹${amountToPay.toFixed(2)}`
            : `Pay Full Amount — ₹${amountToPay.toFixed(2)}`}
        </Button>
        {isSplit && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
            Others in your group pay their ₹{perPersonAmount.toFixed(2)} via their chosen method
          </Typography>
        )}
      </Box>
    </Box>
  );
}
