import { useCafe } from '../context/CafeContext';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

export function TrendingDishes() {
  const { trendingDishes } = useCafe();

  const sortedTrends = Object.entries(trendingDishes)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count], index) => ({ name, count, rank: index + 1 }));

  if (sortedTrends.length === 0) {
    return (
      <Box className="flex flex-col items-center justify-center h-64">
        <TrendingUp className="text-gray-400" style={{ fontSize: 80 }} />
        <Typography variant="h6" color="text.secondary" className="mt-4">
          No trending dishes yet
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="max-w-2xl mx-auto space-y-4">
      <Typography variant="h4">Trending Dishes</Typography>

      <Box className="space-y-3">
        {sortedTrends.map((item) => (
          <Card key={item.name}>
            <CardContent>
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-3 flex-1">
                  <Chip
                    label={`#${item.rank}`}
                    color={item.rank === 1 ? 'primary' : item.rank === 2 ? 'secondary' : 'default'}
                  />
                  <Typography variant="h6">{item.name}</Typography>
                </Box>

                <Box className="text-right">
                  <Typography variant="h5" color="primary">
                    {item.count}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    orders
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
