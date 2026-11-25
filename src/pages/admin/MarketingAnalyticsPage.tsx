import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Users, ShoppingBag, DollarSign, Activity, Link, Filter, Target, Calendar } from 'lucide-react';
import axiosInstance from '../../api/axios';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

interface AnalyticsData {
  kpis: {
    totalVisitors: number;
    totalOrders: number;
    totalRevenue: number;
    aov: number;
    conversionRate: number;
  };
  ordersBySource: any[];
  ordersByCampaign: any[];
  topLandingPages: any[];
  topCampaigns: any[];
  topReferrers: any[];
}

export const MarketingAnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [dateFilter, setDateFilter] = useState<'today' | '7d' | '30d' | '90d' | 'custom'>('30d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [exchangeRate, setExchangeRate] = useState<number>(278.5);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const rateData = await res.json();
        if (rateData?.rates?.PKR) {
          setExchangeRate(rateData.rates.PKR);
        }
      } catch (err) {
        console.error('Failed to fetch exchange rate:', err);
      }
    };
    fetchRate();
  }, []);

  const displayData = useMemo(() => {
    if (!data) return null;
    return {
      ...data,
      kpis: {
        ...data.kpis,
        totalRevenue: data.kpis.totalRevenue * exchangeRate,
        aov: data.kpis.aov * exchangeRate,
      },
      ordersBySource: data.ordersBySource.map(item => ({
        ...item,
        revenue: item.revenue * exchangeRate
      })),
      ordersByCampaign: data.ordersByCampaign.map(item => ({
        ...item,
        revenue: item.revenue * exchangeRate
      }))
    };
  }, [data, exchangeRate]);

  const fetchAnalytics = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/v1/analytics/marketing';
      const params = new URLSearchParams();
      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await axiosInstance.get(url);
      setData(response.data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to load marketing analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateFilter === 'custom') return; // Handled manually

    const end = new Date();
    const start = new Date();

    switch (dateFilter) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
    }

    fetchAnalytics(start.toISOString(), end.toISOString());
  }, [dateFilter]);

  const handleCustomFilter = () => {
    if (customStartDate && customEndDate) {
      fetchAnalytics(new Date(customStartDate).toISOString(), new Date(customEndDate).toISOString());
    }
  };

  if (loading && !data) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-full pb-20 space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketing Dashboard</h1>
        
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-2 shadow-sm dark:bg-gray-800">
          {(['today', '7d', '30d', '90d', 'custom'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                dateFilter === filter
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              {filter === 'today' ? 'Today' : 
               filter === '7d' ? '7 Days' : 
               filter === '30d' ? '30 Days' : 
               filter === '90d' ? '90 Days' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {dateFilter === 'custom' && (
        <div className="flex items-end gap-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
            <input 
              type="date" 
              value={customStartDate} 
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
            <input 
              type="date" 
              value={customEndDate} 
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button 
            onClick={handleCustomFilter}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={!customStartDate || !customEndDate}
          >
            Apply
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {displayData && (
        <>
          {/* KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Visitors</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{displayData.kpis.totalVisitors}</p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{displayData.kpis.totalOrders}</p>
                </div>
                <div className="rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Rs {displayData.kpis.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-full bg-emerald-100 p-3 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Order Value</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">Rs {displayData.kpis.aov.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="rounded-full bg-amber-100 p-3 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  <Activity className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Conv. Rate</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{displayData.kpis.conversionRate}%</p>
                </div>
                <div className="rounded-full bg-pink-100 p-3 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Revenue by Source</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={displayData.ordersBySource}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="revenue"
                      nameKey="source"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {displayData.ordersBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => `Rs ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Revenue by Campaign</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={displayData.ordersByCampaign} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="campaign" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <RechartsTooltip formatter={(value: number) => `Rs ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue (Rs)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-2">
                <Link className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Landing Pages</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayData.topLandingPages.map((page, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <span className="truncate text-sm text-gray-600 dark:text-gray-300" title={page.page}>{page.page}</span>
                    <span className="ml-4 font-semibold text-gray-900 dark:text-white">{page.visitors}</span>
                  </div>
                ))}
                {displayData.topLandingPages.length === 0 && <p className="text-sm text-gray-500 py-2">No data available</p>}
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Campaigns (Traffic)</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayData.topCampaigns.map((camp, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <span className="truncate text-sm text-gray-600 dark:text-gray-300" title={camp.campaign}>{camp.campaign}</span>
                    <span className="ml-4 font-semibold text-gray-900 dark:text-white">{camp.visitors}</span>
                  </div>
                ))}
                {displayData.topCampaigns.length === 0 && <p className="text-sm text-gray-500 py-2">No data available</p>}
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Referrers</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {displayData.topReferrers.map((ref, i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <span className="truncate text-sm text-gray-600 dark:text-gray-300" title={ref.referrer}>{ref.referrer}</span>
                    <span className="ml-4 font-semibold text-gray-900 dark:text-white">{ref.visitors}</span>
                  </div>
                ))}
                {displayData.topReferrers.length === 0 && <p className="text-sm text-gray-500 py-2">No data available</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
