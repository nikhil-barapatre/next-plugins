'use client';

import { useEffect, useState } from 'react';
import { getCustomerStats } from '../_lib/api-client';

interface CustomerStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  inactiveCustomers: number;
}

export default function CustomerOverviewCards() {
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getCustomerStats();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
    fetchStats();
  }, []);

  if (error) {
    return <div className="text-red-500">Error loading customer stats: {error}</div>;
  }

  if (!stats) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card p-4 rounded-lg shadow-sm animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-card p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-muted-foreground">Total Customers</h3>
        <p className="text-3xl font-bold">{stats.totalCustomers}</p>
      </div>
      <div className="bg-card p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-muted-foreground">New Customers This Month</h3>
        <p className="text-3xl font-bold">+{stats.newCustomersThisMonth}</p>
      </div>
      <div className="bg-card p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-muted-foreground">Active</h3>
        <p className="text-3xl font-bold">{stats.activeCustomers}</p>
      </div>
      <div className="bg-card p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-muted-foreground">Inactive</h3>
        <p className="text-3xl font-bold">{stats.inactiveCustomers}</p>
      </div>
    </div>
  );
}
