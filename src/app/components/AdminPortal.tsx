import { useState } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { KitchenQueue } from './KitchenQueue';
import { OrderManagement } from './OrderManagement';
import { UserManagement } from './UserManagement';
import { FinancialReports } from './FinancialReports';
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Box,
  Button
} from '@mui/material';
import {
  Dashboard,
  Restaurant,
  ShoppingBag,
  People,
  AccountBalance,
  Logout
} from '@mui/icons-material';

interface AdminPortalProps {
  onLogout: () => void;
}

export function AdminPortal({ onLogout }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Box className="size-full flex flex-col bg-gray-50">
      <AppBar position="static">
        <Toolbar>
          <Dashboard className="mr-2" />
          <Typography variant="h6" className="flex-1">
            Admin Control Panel
          </Typography>
          <Button color="inherit" onClick={onLogout} startIcon={<Logout />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Box className="flex-1 flex flex-col overflow-hidden">
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          className="bg-white border-b"
        >
          <Tab
            value="dashboard"
            label="Dashboard"
            icon={<Dashboard />}
            iconPosition="start"
          />
          <Tab
            value="kitchen"
            label="Kitchen Queue"
            icon={<Restaurant />}
            iconPosition="start"
          />
          <Tab
            value="orders"
            label="Orders"
            icon={<ShoppingBag />}
            iconPosition="start"
          />
          <Tab
            value="users"
            label="Users"
            icon={<People />}
            iconPosition="start"
          />
          <Tab
            value="reports"
            label="Financial Reports"
            icon={<AccountBalance />}
            iconPosition="start"
          />
        </Tabs>

        <Box className="flex-1 overflow-auto p-4">
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'kitchen' && <KitchenQueue />}
          {activeTab === 'orders' && <OrderManagement />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'reports' && <FinancialReports />}
        </Box>
      </Box>
    </Box>
  );
}
