import { useCafe } from '../context/CafeContext';
import {
  Card, CardContent, Typography, Button, Box, Chip,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Tooltip
} from '@mui/material';
import { CheckCircle, Restaurant, ChatBubbleOutline } from '@mui/icons-material';
import { toast } from 'sonner';

export function KitchenQueue() {
  const { kitchenQueue, markItemPrepared } = useCafe();

  // Sort: pending first, then by order time
  const sortedQueue = [...kitchenQueue].sort((a, b) => {
    if (a.isPrepared !== b.isPrepared) return a.isPrepared ? 1 : -1;
    return a.orderTime.localeCompare(b.orderTime);
  });

  const handleMarkPrepared = async (orderID: string) => {
    await markItemPrepared(orderID);
    toast.success(`Order #${orderID} marked as prepared! Customer has been notified.`);
  };

  if (kitchenQueue.length === 0) {
    return (
      <Box className="flex flex-col items-center justify-center h-64">
        <Restaurant className="text-gray-400" style={{ fontSize: 80 }} />
        <Typography variant="h6" color="text.secondary" className="mt-4">
          Kitchen queue is empty
        </Typography>
        <Typography color="text.secondary">All orders have been prepared!</Typography>
      </Box>
    );
  }

  const pendingCount = kitchenQueue.filter(item => !item.isPrepared).length;
  const pendingOrderIDs = [...new Set(
    kitchenQueue.filter(i => !i.isPrepared).map(i => i.orderID)
  )];

  return (
    <Box className="space-y-4">
      <Box className="flex justify-between items-center flex-wrap gap-2">
        <Typography variant="h4">Kitchen Preparation Queue</Typography>
        <Box className="flex gap-2">
          <Chip
            label={`${pendingOrderIDs.length} Pending Order${pendingOrderIDs.length !== 1 ? 's' : ''}`}
            color={pendingCount > 0 ? 'warning' : 'success'}
            icon={<Restaurant />}
          />
          <Chip
            label={`${pendingCount} Item${pendingCount !== 1 ? 's' : ''} to Prepare`}
            color={pendingCount > 0 ? 'error' : 'success'}
            variant="outlined"
          />
        </Box>
      </Box>

      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Item</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">Qty</TableCell>
              <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Prep Time</TableCell>
              <TableCell sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Order ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Special Instructions</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedQueue.map((item, idx) => (
              <TableRow
                key={idx}
                sx={{
                  bgcolor: item.isPrepared ? '#f9fafb' : 'white',
                  opacity: item.isPrepared ? 0.65 : 1,
                  '&:hover': { bgcolor: item.isPrepared ? '#f9fafb' : '#f0f9ff' }
                }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.itemName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.orderDate} · {item.orderTime}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Chip label={`×${item.quantity}`} size="small" variant="outlined" />
                </TableCell>

                <TableCell>
                  <Typography variant="body2">{item.prepTime} min</Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563eb' }}>
                    #{item.orderID}
                  </Typography>
                </TableCell>

                <TableCell sx={{ maxWidth: 200 }}>
                  {item.comment ? (
                    <Tooltip title={item.comment} placement="top" arrow>
                      <Box className="flex items-start gap-1">
                        <ChatBubbleOutline sx={{ fontSize: 14, color: '#f59e0b', flexShrink: 0, mt: 0.3 }} />
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#92400e',
                            bgcolor: '#fffbeb',
                            border: '1px solid #fcd34d',
                            borderRadius: 1,
                            px: 0.75,
                            py: 0.25,
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            lineHeight: 1.4
                          }}
                        >
                          {item.comment}
                        </Typography>
                      </Box>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                      No special instructions
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Chip
                    label={item.isPrepared ? '✓ Done' : '⏳ Pending'}
                    color={item.isPrepared ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  {!item.isPrepared && (
                    <Button
                      size="small" variant="contained" color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => handleMarkPrepared(item.orderID)}
                      sx={{ whiteSpace: 'nowrap' }}
                    >
                      Mark Ready
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary card */}
      <Card>
        <CardContent>
          <Typography variant="h6" className="mb-2">Queue Summary</Typography>
          <Box className="grid grid-cols-3 gap-4">
            {[
              { label: 'Total Items', value: kitchenQueue.length },
              { label: 'Pending', value: pendingCount, color: pendingCount > 0 ? '#d97706' : 'inherit' },
              { label: 'Completed', value: kitchenQueue.length - pendingCount, color: '#16a34a' }
            ].map(({ label, value, color }) => (
              <Box key={label} className="text-center">
                <Typography variant="h5" sx={{ fontWeight: 700, color: color ?? 'inherit' }}>{value}</Typography>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
