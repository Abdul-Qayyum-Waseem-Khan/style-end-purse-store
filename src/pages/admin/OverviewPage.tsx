import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Clock, 
  Users, 
  DollarSign, 
  AlertCircle,
  Package,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../app/components/ui/card';
import { Badge } from '../../app/components/ui/badge';
import { Button } from '../../app/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../app/components/ui/table';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ImageWithFallback } from '../../app/components/figma/ImageWithFallback';
import { useAdminStats } from '../../hooks/useAdminStats';
import { useNavigate } from 'react-router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export function OverviewPage() {
  const { stats, isLoading, error } = useAdminStats();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error || 'Failed to load stats'}
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'warning'; // Assuming you have variants or we can just use custom classes
      case 'confirmed': return 'info';
      case 'delivered': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const generatePDFReport = () => {
    if (!stats) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Title
      doc.setFontSize(22);
      doc.setTextColor(17, 24, 39);
      doc.text('Style End Purse', 14, 20);
      
      doc.setFontSize(16);
      doc.setTextColor(17, 24, 39); // Gray-900
      doc.text('Revenue & Performance Report', 14, 30);
      
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // Gray-500
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);

      // Summary Metrics
      doc.setDrawColor(229, 231, 235);
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(14, 45, pageWidth - 28, 25, 3, 3, 'FD');
      
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39);
      doc.text(`Total Revenue: PKR ${stats.totalRevenue.toLocaleString()}`, 20, 55);
      doc.text(`Total Orders: ${stats.totalOrders}`, 20, 62);
      
      doc.text(`Total Users: ${stats.totalUsers}`, 120, 55);
      doc.text(`Pending Orders: ${stats.pendingOrders}`, 120, 62);

      // Table Data
      const tableColumn = ["Order ID", "Customer", "Status", "Date", "Total (PKR)"];
      const tableRows: any[] = [];

      stats.recentOrders.forEach((order: any) => {
        const orderData = [
          order._id.substring(order._id.length - 8).toUpperCase(),
          order.user?.name || order.shippingAddress?.fullName || 'Guest',
          order.status.toUpperCase(),
          new Date(order.createdAt).toLocaleDateString(),
          order.total.toLocaleString()
        ];
        tableRows.push(orderData);
      });

      autoTable(doc, {
        startY: 80,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [234, 88, 12] },
        styles: { fontSize: 9 },
        margin: { top: 80 }
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save('StyleEndPurse-Report.pdf');
      toast.success('PDF Report generated successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF report');
    }
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your store today.</p>
        </div>
        <Button 
          onClick={generatePDFReport} 
          className="bg-white text-orange-600 border border-orange-200 hover:bg-orange-50 hover:text-orange-700"
        >
          <FileText className="w-4 h-4 mr-2" />
          Generate PDF Report
        </Button>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">PKR {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-sm text-green-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Live All Time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Orders</CardTitle>
            <ShoppingBag className="w-5 h-5 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalOrders}</div>
            <p className="text-sm text-teal-600 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              {stats.ordersToday} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Payments</CardTitle>
            <Clock className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">PKR {(stats.pendingPaymentsAmount || 0).toLocaleString()}</div>
            <p className="text-sm text-blue-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Awaiting remittance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            <Clock className="w-5 h-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingOrders}</div>
            <p className="text-sm text-amber-600 flex items-center gap-1">
              Needs attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.revenueByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} width={80} tickFormatter={(val) => `PKR ${val/1000}k`} />
                  <Tooltip 
                    formatter={(value: number) => [`PKR ${value.toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No revenue data for the last 30 days.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Products by Units Sold</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topProducts} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="unitsSold" fill="#14b8a6" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No product sales data available.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Tables and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/orders')}>View All</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order: any) => (
                      <TableRow 
                        key={order._id} 
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => navigate(`/admin/orders/${order._id}`)}
                      >
                        <TableCell className="font-medium text-gray-900 font-mono text-xs">
                          {order._id.substring(order._id.length - 8).toUpperCase()}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-900">{order.user?.name || order.shippingAddress?.fullName || 'Guest'}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(order.status)} variant="outline">
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-gray-900">
                          PKR {order.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No recent orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="lg:col-span-1 border-orange-200 shadow-orange-100/50">
          <CardHeader className="bg-orange-50/50 border-b border-orange-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {stats.lowStockProducts.length > 0 ? (
                stats.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 overflow-hidden border border-gray-200">
                      <ImageWithFallback 
                        src={product.images[0] || 'https://images.unsplash.com/photo-1682978900142-9ab110f7a868?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=100&h=100'} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate" title={product.name}>
                        {product.name}
                      </h4>
                      <p className="text-sm text-red-600 font-medium">
                        Only {product.stock} left
                      </p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="shrink-0 text-xs h-8"
                      onClick={() => navigate(`/admin/products/${product.id}`)}
                    >
                      Update
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                  <Package className="w-10 h-10 text-green-400 mb-3 opacity-50" />
                  <p>All products are well stocked!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
