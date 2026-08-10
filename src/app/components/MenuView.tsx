import { useState } from 'react';
import { useCafe } from '../context/CafeContext';
import { MenuItem, RatingRecord } from '../types';
import {
  Card, CardContent, Typography, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Grid, Box, Tabs, Tab, InputAdornment, Divider, Rating, List, ListItem, ListItemText
} from '@mui/material';
import { Add, Search, Casino, LocalOffer, Star, RateReview } from '@mui/icons-material';
import { toast } from 'sonner';

export function MenuView() {
  const { addToCart, foodPreference, menuItems, ratings, submitRating, currentUser } = useCafe();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orderDialog, setOrderDialog] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState('');
  const [randomBudget, setRandomBudget] = useState('');
  const [showRandomDialog, setShowRandomDialog] = useState(false);
  const [showComboDialog, setShowComboDialog] = useState(false);
  const [comboItems, setComboItems] = useState<MenuItem[]>([]);

  // Rating & Review State
  const [ratingDialogItem, setRatingDialogItem] = useState<MenuItem | null>(null);
  const [starRating, setStarRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Filter menu items based on food preference
  const preferenceFiltered = (() => {
    if (!foodPreference || foodPreference === 'AllTypes') return menuItems;
    return menuItems.filter(m => {
      if (m.type === 'ALL-TYPE') return true;
      if (foodPreference === 'Vegan') return m.type === 'Vegan';
      if (foodPreference === 'Veg') return m.type === 'Veg' || m.type === 'Vegan';
      if (foodPreference === 'NonVeg') return m.type === 'NonVeg';
      return true;
    });
  })();

  const categories = ['All', ...Array.from(new Set(preferenceFiltered.map(m => m.category)))];
  const effectiveCategory = categories.includes(selectedCategory) ? selectedCategory : 'All';

  const filteredItems = preferenceFiltered.filter(item => {
    const matchesCategory = effectiveCategory === 'All' || item.category === effectiveCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = () => {
    if (orderDialog && quantity > 0) {
      addToCart(orderDialog.name, quantity, comment);
      toast.success(`${orderDialog.name} added to order!`);
      setOrderDialog(null);
      setQuantity(1);
      setComment('');
    }
  };

  const handleSubmitRating = async () => {
    if (!currentUser) {
      toast.error('Please log in to rate dishes.');
      return;
    }
    if (!ratingDialogItem) return;

    setIsSubmittingRating(true);
    const success = await submitRating(ratingDialogItem.name, starRating, reviewComment);
    setIsSubmittingRating(false);

    if (success) {
      toast.success(`Thank you! Rated ${ratingDialogItem.name} ${starRating}⭐`);
      setRatingDialogItem(null);
      setReviewComment('');
      setStarRating(5);
    } else {
      toast.error('Failed to submit rating. Please try again.');
    }
  };

  const generateRandomMeal = () => {
    const budget = parseFloat(randomBudget);
    if (isNaN(budget) || budget <= 0) { toast.error('Please enter a valid budget'); return; }
    let total = 0;
    const randomItems: MenuItem[] = [];
    const shuffled = [...preferenceFiltered].sort(() => Math.random() - 0.5);
    for (const item of shuffled) {
      if (total + item.price <= budget) { randomItems.push(item); total += item.price; }
    }
    if (randomItems.length === 0) {
      toast.error('No items available within your budget!');
    } else {
      randomItems.forEach(item => addToCart(item.name, 1, ''));
      toast.success(`Added ${randomItems.length} items! Total: ₹${total}`);
      setShowRandomDialog(false);
      setRandomBudget('');
    }
  };

  const generateCombo = () => {
    const starters = preferenceFiltered.filter(m => m.category === 'Starter');
    const mains = preferenceFiltered.filter(m => m.category === 'Main' || m.category === 'Pizza');
    const drinks = preferenceFiltered.filter(m => m.category === 'Drink');
    if (starters.length === 0 || mains.length === 0 || drinks.length === 0) {
      toast.error('Cannot generate combo — try changing your food preference');
      return;
    }
    const starter = starters[Math.floor(Math.random() * starters.length)];
    const main = mains[Math.floor(Math.random() * mains.length)];
    const drink = drinks[Math.floor(Math.random() * drinks.length)];
    setComboItems([starter, main, drink]);
    setShowComboDialog(true);
  };

  const addComboToCart = () => {
    comboItems.forEach(item => addToCart(item.name, 1, 'Combo item'));
    const total = comboItems.reduce((sum, item) => sum + item.price, 0);
    toast.success(`Combo added! ₹${total} → ₹${(total * 0.85).toFixed(2)} (15% off applied at checkout)`);
    setShowComboDialog(false);
  };

  const getTypeColor = (type: string): 'success' | 'primary' | 'error' | 'default' => {
    switch (type) {
      case 'Vegan': return 'success';
      case 'Veg': return 'primary';
      case 'NonVeg': return 'error';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    if (type === 'ALL-TYPE') return 'All Types';
    return type;
  };

  const itemReviews = (ratingDialogItem ? ratings.filter(r => r.itemName.toLowerCase() === ratingDialogItem.name.toLowerCase()) : []);

  return (
    <Box>
      <Box className="mb-4 space-y-3">
        <Box className="flex gap-2 flex-wrap">
          <Button variant="contained" size="small" startIcon={<Casino />} onClick={() => setShowRandomDialog(true)}>
            Random Meal
          </Button>
          <Button variant="contained" size="small" startIcon={<LocalOffer />} onClick={generateCombo}>
            {"Today's Combo (15% OFF)"}
          </Button>
        </Box>

        <TextField
          fullWidth size="small"
          placeholder="Search for dishes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
        />

        <Tabs
          value={effectiveCategory}
          onChange={(_, val) => setSelectedCategory(val)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {categories.map(cat => <Tab key={cat} label={cat} value={cat} />)}
        </Tabs>
      </Box>

      {filteredItems.length === 0 ? (
        <Box className="text-center py-12">
          <Typography variant="h6" color="text.secondary">No items found</Typography>
          <Typography variant="body2" color="text.secondary">Try a different search or category</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredItems.map((item) => {
            const itemAvg = item.avgRating || 4.5;
            const count = item.reviewCount || 0;
            return (
              <Grid item xs={12} sm={6} md={4} key={item.name}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Box className="flex justify-between items-start mb-2">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, pr: 1, lineHeight: 1.3 }}>
                        {item.name}
                      </Typography>
                      <Chip label={getTypeLabel(item.type)} size="small" color={getTypeColor(item.type)} />
                    </Box>

                    {/* Star Rating Badge */}
                    <Box className="flex items-center gap-1 mb-2">
                      <Chip
                        icon={<Star sx={{ color: '#f59e0b !important', fontSize: 16 }} />}
                        label={`${itemAvg}★ (${count} ${count === 1 ? 'review' : 'reviews'})`}
                        size="small"
                        variant="outlined"
                        onClick={() => { setRatingDialogItem(item); setStarRating(5); setReviewComment(''); }}
                        sx={{ cursor: 'pointer', fontWeight: 600, borderColor: '#fde047', bgcolor: '#fefce8' }}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" className="mb-2">
                      {item.category}
                    </Typography>

                    <Box className="flex justify-between items-center mb-3">
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>₹{item.price}</Typography>
                      <Typography variant="caption" color="text.secondary">⏱ {item.prepTime} min</Typography>
                    </Box>

                    <Box className="flex gap-2">
                      <Button
                        fullWidth variant="contained" size="small" startIcon={<Add />}
                        onClick={() => { setOrderDialog(item); setQuantity(1); setComment(''); }}
                      >
                        Add
                      </Button>
                      <Button
                        variant="outlined" size="small" startIcon={<RateReview />}
                        onClick={() => { setRatingDialogItem(item); setStarRating(5); setReviewComment(''); }}
                        title="Rate & View Reviews"
                      >
                        Rate
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add to Order Dialog */}
      <Dialog open={!!orderDialog} onClose={() => setOrderDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Add {orderDialog?.name}</DialogTitle>
        <DialogContent>
          <Box className="space-y-3 pt-1">
            <Box className="flex justify-between">
              <Typography variant="body2" color="text.secondary">Price per item</Typography>
              <Typography color="primary" sx={{ fontWeight: 700 }}>₹{orderDialog?.price}</Typography>
            </Box>
            <Box className="flex items-center gap-3">
              <Button variant="outlined" size="small" onClick={() => setQuantity(q => Math.max(1, q - 1))}
                sx={{ minWidth: 36, height: 36, p: 0 }}>−</Button>
              <Typography variant="h6" sx={{ fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{quantity}</Typography>
              <Button variant="outlined" size="small" onClick={() => setQuantity(q => q + 1)}
                sx={{ minWidth: 36, height: 36, p: 0 }}>+</Button>
              <Typography variant="body2" color="text.secondary">
                = ₹{((orderDialog?.price || 0) * quantity).toFixed(2)}
              </Typography>
            </Box>
            <TextField
              fullWidth multiline rows={2} size="small"
              label="Special Instructions (Optional)"
              value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="e.g., Extra spicy, no onions..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderDialog(null)}>Cancel</Button>
          <Button onClick={handleAddToCart} variant="contained">Add to Order</Button>
        </DialogActions>
      </Dialog>

      {/* Rate & View Reviews Dialog */}
      <Dialog open={!!ratingDialogItem} onClose={() => setRatingDialogItem(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box className="flex justify-between items-center">
            <span>Rate & Reviews for {ratingDialogItem?.name}</span>
            <Chip
              icon={<Star sx={{ color: '#f59e0b !important' }} />}
              label={`${ratingDialogItem?.avgRating || 4.5}★`}
              color="warning"
              size="small"
            />
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box className="space-y-4 pt-2">
            {/* Submit Rating Form */}
            <Box className="p-3 bg-blue-50 rounded-xl space-y-2">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Leave your Rating & Review:</Typography>
              <Rating
                value={starRating}
                onChange={(_, val) => val && setStarRating(val)}
                precision={1}
                size="large"
              />
              <TextField
                fullWidth size="small" multiline rows={2}
                placeholder="Write your review about taste, quality, portion..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
              <Button
                variant="contained" size="small"
                onClick={handleSubmitRating}
                disabled={isSubmittingRating}
              >
                Submit Review
              </Button>
            </Box>

            <Divider />

            {/* Customer Reviews List */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Customer Reviews ({itemReviews.length})</Typography>
            {itemReviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No reviews yet. Be the first to leave a review!
              </Typography>
            ) : (
              <List disablePadding>
                {itemReviews.map((rev) => (
                  <ListItem key={rev.ratingID} divider sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box className="flex justify-between items-center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{rev.username}</Typography>
                          <Rating value={rev.stars} readOnly size="small" />
                        </Box>
                      }
                      secondary={
                        <Box className="mt-1">
                          <Typography variant="body2" color="text.primary">{rev.comment || 'Rated ' + rev.stars + ' stars'}</Typography>
                          <Typography variant="caption" color="text.secondary">{rev.timestamp}</Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialogItem(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Random Meal Dialog */}
      <Dialog open={showRandomDialog} onClose={() => setShowRandomDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Random Meal Generator</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter your budget and we will pick the best combination for you!
          </Typography>
          <TextField fullWidth type="number" label="Your Budget (₹)"
            value={randomBudget} onChange={(e) => setRandomBudget(e.target.value)} inputProps={{ min: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRandomDialog(false)}>Cancel</Button>
          <Button onClick={generateRandomMeal} variant="contained">Generate</Button>
        </DialogActions>
      </Dialog>

      {/* Combo Dialog */}
      <Dialog open={showComboDialog} onClose={() => setShowComboDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{"Today's Combo — 15% OFF"}</DialogTitle>
        <DialogContent>
          <Box className="space-y-2 mt-1">
            {comboItems.map((item, idx) => (
              <Box key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <Box>
                  <Typography variant="body1">{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{item.category}</Typography>
                </Box>
                <Typography>₹{item.price}</Typography>
              </Box>
            ))}
            <Divider />
            <Box className="flex justify-between">
              <Typography color="text.secondary">Original Price</Typography>
              <Typography sx={{ textDecoration: 'line-through' }}>
                ₹{comboItems.reduce((s, i) => s + i.price, 0)}
              </Typography>
            </Box>
            <Box className="flex justify-between">
              <Typography variant="h6" color="primary">Combo Price (15% off)</Typography>
              <Typography variant="h6" color="primary">
                ₹{(comboItems.reduce((s, i) => s + i.price, 0) * 0.85).toFixed(2)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowComboDialog(false)}>Cancel</Button>
          <Button onClick={addComboToCart} variant="contained">Add Combo to Order</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
