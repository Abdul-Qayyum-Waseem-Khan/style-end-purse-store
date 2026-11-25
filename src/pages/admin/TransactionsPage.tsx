import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../app/components/ui/table';
import { Badge } from '../../app/components/ui/badge';
import { CreditCard, Wallet, AlertCircle, CheckCircle2, Search } from 'lucide-react';
import { Input } from '../../app/components/ui/input';

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get('/api/v1/admin/transactions');
      setTransactions(data.data);
    } catch (error) {
      console.error('Failed to fetch transactions', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard className="w-4 h-4 text-blue-500" />;
      case 'cod': return <Wallet className="w-4 h-4 text-orange-500" />;
      case 'jazzcash': return <Wallet className="w-4 h-4 text-red-500" />;
      case 'raast': return <Wallet className="w-4 h-4 text-green-500" />;
      default: return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1"/> Paid</Badge>;
      case 'failed': return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="w-3 h-3 mr-1"/> Failed</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const filteredTransactions = transactions.filter(t => {
    const idMatch = t._id.toLowerCase().includes(searchQuery.toLowerCase());
    const userMatch = t.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return idMatch || userMatch;
  });

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Review all payment transactions and statuses</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-6">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by Transaction ID or Customer..." 
            className="pl-9 h-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex justify-center">
                      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction._id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <span className="font-mono text-sm text-gray-900">
                        TXN-{transaction._id.substring(16).toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">{transaction.user?.name || 'Guest'}</div>
                      {transaction.user?.email && <div className="text-xs text-gray-500">{transaction.user.email}</div>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <span className="capitalize font-medium text-gray-700">{transaction.paymentMethod === 'cod' ? 'Cash on Delivery' : transaction.paymentMethod}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-gray-900">PKR {transaction.total.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      {getPaymentStatusBadge(transaction.paymentStatus)}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
