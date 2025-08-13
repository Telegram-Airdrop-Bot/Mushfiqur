import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Mail,
  MessageCircle,
  FileText,
  Calendar,
  RefreshCw,
  DollarSign,
  Bitcoin,
  Wallet,
  Send,
  Download,
  Upload,
  AlertCircle,
  CheckSquare,
  Square,
  Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  sendStatusUpdateEmail, 
  sendPaymentStatusEmail, 
  sendDeliveryEmail,
  sendCancellationEmail,
  type OrderData as EmailOrderData 
} from "@/lib/email-service";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_telegram: string | null;
  project_description: string;
  service_type: string;
  budget_range: string;
  timeline: string;
  status: string;
  payment_method: string;
  payment_status: string;
  project_requirements: string[];
  admin_notes: string | null;
  delivery_date: string | null;
  project_files: any;
  payment_proof: string | null;
  created_at: string;
  updated_at: string;
}

export const OrdersManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  // Mock orders for demonstration (replace with actual Supabase integration)
  const mockOrders: Order[] = [
    {
      id: "1",
      customer_name: "John Doe",
      customer_email: "john@example.com",
      customer_telegram: "@johndoe",
      project_description: "Need a bot for my online store with payment integration and inventory management",
      service_type: "E-commerce Telegram Bot",
      budget_range: "$1000-$2000",
      timeline: "2-3 weeks",
      status: "pending",
      payment_method: "crypto",
      payment_status: "pending",
      project_requirements: ["Payment Integration", "Database Integration", "Admin Dashboard"],
      admin_notes: null,
      delivery_date: null,
      project_files: null,
      payment_proof: null,
      created_at: "2025-01-15T10:30:00Z",
      updated_at: "2025-01-15T10:30:00Z"
    },
    {
      id: "2",
      customer_name: "Jane Smith",
      customer_email: "jane@example.com",
      customer_telegram: "@janesmith",
      project_description: "Automated trading bot with risk management and multiple exchange support",
      service_type: "Crypto Trading Bot",
      budget_range: "$2000-$3000",
      timeline: "3-4 weeks",
      status: "in_progress",
      payment_method: "bkash",
      payment_status: "paid",
      project_requirements: ["API Integration", "Real-time Updates", "Risk Management"],
      admin_notes: "Payment received, started development",
      delivery_date: "2025-02-15T00:00:00Z",
      project_files: null,
      payment_proof: null,
      created_at: "2025-01-14T15:45:00Z",
      updated_at: "2025-01-15T09:20:00Z"
    },
    {
      id: "3",
      customer_name: "Mike Johnson",
      customer_email: "mike@example.com",
      customer_telegram: "@mikejohnson",
      project_description: "Bot for managing my Discord server with moderation and engagement features",
      service_type: "Discord Community Manager",
      budget_range: "$800-$1500",
      timeline: "1-2 weeks",
      status: "completed",
      payment_method: "nagad",
      payment_status: "paid",
      project_requirements: ["User Authentication", "Moderation Tools", "Analytics"],
      admin_notes: "Project completed and delivered successfully",
      delivery_date: "2025-01-13T16:30:00Z",
      project_files: {
        source_code: "https://github.com/example/discord-bot",
        documentation: "https://docs.example.com/discord-bot",
        demo: "https://demo.example.com/discord-bot"
      },
      payment_proof: null,
      created_at: "2025-01-10T12:00:00Z",
      updated_at: "2025-01-13T16:30:00Z"
    }
  ];

  const handleRefresh = () => {
    fetchOrders();
  };

  const fetchOrders = async () => {
    try {
      console.log('Starting to fetch orders from Supabase...');
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase orders response:', { data, error });

      if (error) {
        console.error('Error fetching orders:', error);
        console.log('Falling back to mock data due to error');
        // Fallback to mock data if there's an error
        setOrders(mockOrders);
        setFilteredOrders(mockOrders);
      } else {
        console.log('Successfully fetched orders from Supabase:', data);
        // Transform Supabase data to match our Order interface with default values
        const transformedOrders = (data || []).map((order: any) => ({
          ...order,
          payment_method: order.payment_method || 'pending',
          payment_status: order.payment_status || 'pending',
          project_requirements: order.project_requirements || [],
          admin_notes: order.admin_notes || null,
          delivery_date: order.delivery_date || null,
          project_files: order.project_files || null,
          payment_proof: order.payment_proof || null
        }));
        setOrders(transformedOrders);
        setFilteredOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.log('Falling back to mock data due to exception');
      // Fallback to mock data if there's an error
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load orders from Supabase
    fetchOrders();
  }, []);

  useEffect(() => {
    // Filter orders based on search and status
    let filtered = orders;
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.project_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_telegram?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (paymentStatusFilter !== "all") {
      filtered = filtered.filter(order => order.payment_status === paymentStatusFilter);
    }
    
    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, paymentStatusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'review':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800"><Eye className="w-3 h-3 mr-1" />Review</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-300 text-yellow-700"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'paid':
        return <Badge variant="outline" className="border-green-300 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'failed':
        return <Badge variant="outline" className="border-red-300 text-red-700"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'refunded':
        return <Badge variant="outline" className="border-gray-300 text-gray-700"><RefreshCw className="w-3 h-3 mr-1" />Refunded</Badge>;
      default:
        return <Badge variant="outline">{paymentStatus}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'crypto':
        return <Bitcoin className="w-4 h-4 text-orange-500" />;
      case 'bkash':
        return <Wallet className="w-4 h-4 text-blue-500" />;
      case 'nagad':
        return <Wallet className="w-4 h-4 text-green-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update order status. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
            : order
        )
      );

      // Update filtered orders as well
      setFilteredOrders(prevFiltered => 
        prevFiltered.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
            : order
        )
      );

      // Send email notification to customer
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await sendStatusUpdateEmail(order, newStatus);
      }
      
      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: newPaymentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating payment status:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update payment status. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, payment_status: newPaymentStatus, updated_at: new Date().toISOString() }
            : order
        )
      );

      // Update filtered orders as well
      setFilteredOrders(prevFiltered => 
        prevFiltered.map(order => 
          order.id === orderId 
            ? { ...order, payment_status: newPaymentStatus, updated_at: new Date().toISOString() }
            : order
        )
      );

      // Send payment status email to customer
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await sendPaymentStatusEmail(order, newPaymentStatus);
      }

      toast({
        title: "Payment Status Updated",
        description: `Payment status updated to ${newPaymentStatus}`,
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const updateOrderDetails = async (orderId: string, updates: Partial<Order>) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order details:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update order details. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, ...updates, updated_at: new Date().toISOString() }
            : order
        )
      );

      // Update filtered orders as well
      setFilteredOrders(prevFiltered => 
        prevFiltered.map(order => 
          order.id === orderId 
            ? { ...order, ...updates, updated_at: new Date().toISOString() }
            : order
        )
      );

      toast({
        title: "Order Updated",
        description: "Order details updated successfully",
      });

      setEditingOrder(null);
    } catch (error) {
      console.error('Error updating order details:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update order details. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOrderAction = (order: Order, action: string) => {
    switch (action) {
      case 'accept':
        updateOrderStatus(order.id, 'accepted');
        break;
      case 'start':
        updateOrderStatus(order.id, 'in_progress');
        break;
      case 'review':
        updateOrderStatus(order.id, 'review');
        break;
      case 'complete':
        updateOrderStatus(order.id, 'completed');
        break;
      case 'cancel':
        const cancellationReason = prompt('Please provide a reason for cancellation (optional):');
        if (confirm(`Are you sure you want to cancel order #${order.id} for ${order.customer_name}? This action cannot be undone.`)) {
          updateOrderStatus(order.id, 'cancelled');
          sendCancellationEmail(order, cancellationReason || undefined); // Send cancellation email with reason
          
          toast({
            title: "Order Cancelled",
            description: `Order #${order.id} has been cancelled successfully. Customer has been notified.`,
            variant: "destructive"
          });
        }
        break;
      case 'mark_paid':
        updatePaymentStatus(order.id, 'paid');
        break;
      case 'mark_failed':
        updatePaymentStatus(order.id, 'failed');
        break;
      case 'view':
        setSelectedOrder(order);
        setShowOrderDetails(true);
        break;
      case 'edit':
        setEditingOrder(order);
        break;
      case 'deliver':
        handleProjectDelivery(order);
        break;
    }
  };

  const handleProjectDelivery = async (order: Order) => {
    const deliveryDetails = {
      source_code: prompt('Enter source code URL:'),
      documentation: prompt('Enter documentation URL:'),
      demo_url: prompt('Enter demo URL:'),
      installation_guide: prompt('Enter installation guide:'),
      admin_notes: prompt('Enter delivery notes:')
    };

    if (deliveryDetails.source_code) {
      const projectFiles = {
        source_code: deliveryDetails.source_code,
        documentation: deliveryDetails.documentation,
        demo_url: deliveryDetails.demo_url,
        installation_guide: deliveryDetails.installation_guide,
        delivered_at: new Date().toISOString()
      };

      await updateOrderDetails(order.id, {
        status: 'completed',
        project_files: projectFiles,
        delivery_date: new Date().toISOString(),
        admin_notes: deliveryDetails.admin_notes
      });

      // Send delivery email to customer
      await sendDeliveryEmail(order, deliveryDetails);

      toast({
        title: "Project Delivered",
        description: "Project has been delivered and customer notified",
      });
    }
  };

  const getActionButtons = (order: Order) => {
    const buttons = [];

    // Status action buttons
    switch (order.status) {
      case 'pending':
        buttons.push(
          <Button key="accept" size="sm" onClick={() => handleOrderAction(order, 'accept')} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />Accept
          </Button>
        );
        break;
      case 'accepted':
        buttons.push(
          <Button key="start" size="sm" onClick={() => handleOrderAction(order, 'start')} className="bg-blue-600 hover:bg-blue-700">
            <Clock className="w-3 h-3 mr-1" />Start
          </Button>
        );
        break;
      case 'in_progress':
        buttons.push(
          <Button key="review" size="sm" onClick={() => handleOrderAction(order, 'review')} className="bg-purple-600 hover:bg-purple-700">
            <Eye className="w-3 h-3 mr-1" />Review
          </Button>
        );
        break;
      case 'review':
        buttons.push(
          <Button key="complete" size="sm" onClick={() => handleOrderAction(order, 'complete')} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />Complete
          </Button>
        );
        break;
    }

    // Payment action buttons
    if (order.payment_status === 'pending') {
      buttons.push(
        <Button key="mark_paid" size="sm" onClick={() => handleOrderAction(order, 'mark_paid')} className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />Mark Paid
        </Button>
      );
    }

    // Common action buttons
    buttons.push(
      <Button key="view" size="sm" variant="outline" onClick={() => handleOrderAction(order, 'view')}>
        <Eye className="w-3 h-3 mr-1" />View
      </Button>,
      <Button key="edit" size="sm" variant="outline" onClick={() => handleOrderAction(order, 'edit')}>
        <FileText className="w-3 h-3 mr-1" />Edit
      </Button>
    );

    // Cancel button for orders that are not completed or cancelled
    if (order.status !== 'completed' && order.status !== 'cancelled') {
      buttons.push(
        <Button key="cancel" size="sm" variant="destructive" onClick={() => handleOrderAction(order, 'cancel')}>
          <XCircle className="w-3 h-3 mr-1" />Cancel
        </Button>
      );
    }

    // Delivery button for completed orders
    if (order.status === 'completed' && !order.project_files) {
      buttons.push(
        <Button key="deliver" size="sm" onClick={() => handleOrderAction(order, 'deliver')} className="bg-purple-600 hover:bg-purple-700">
          <Upload className="w-3 h-3 mr-1" />Deliver
        </Button>
      );
    }

    return buttons;
  };

  // Calculate summary statistics
  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(order => order.status === 'pending').length;
    const inProgress = orders.filter(order => order.status === 'in_progress').length;
    const completed = orders.filter(order => order.status === 'completed').length;
    const cancelled = orders.filter(order => order.status === 'cancelled').length;
    const pendingPayment = orders.filter(order => order.payment_status === 'pending').length;
    const paid = orders.filter(order => order.payment_status === 'paid').length;

    return { total, pending, inProgress, completed, cancelled, pendingPayment, paid };
  };

  const stats = getOrderStats();

  return (
    <div className="space-y-6">
      {/* Summary Statistics Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-600/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payment</p>
                <p className="text-xl font-bold text-orange-600">{stats.pendingPayment}</p>
              </div>
              <Wallet className="h-6 w-6 text-orange-600/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Paid Orders</p>
                <p className="text-xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <DollarSign className="h-6 w-6 text-green-600/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Orders Management</span>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search orders by customer name, email, or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders Table */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{order.customer_name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {order.customer_email}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{order.service_type}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {order.project_description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          Budget: {order.budget_range}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Timeline: {order.timeline}
                        </Badge>
                        {order.customer_telegram && (
                          <Badge variant="outline" className="text-xs">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {order.customer_telegram}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex gap-2">
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.payment_status)}
                      </div>
                      
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Created: {formatDate(order.created_at)}</p>
                        {order.updated_at !== order.created_at && (
                          <p>Updated: {formatDate(order.updated_at)}</p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingOrder(order)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-black/50 backdrop-blur-sm rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="p-6 text-white">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Order Details</h2>
                <Button variant="outline" onClick={() => setShowOrderDetails(false)} className="border-white/20 text-white hover:bg-white/10">
                  <XCircle className="w-4 h-4" />
                </Button>
            </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                  <h3 className="font-semibold mb-3 text-white">Customer Information</h3>
                  <div className="space-y-2 text-white">
                    <p><strong>Name:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>Email:</strong> {selectedOrder.customer_email}</p>
                    {selectedOrder.customer_telegram && (
                      <p><strong>Telegram:</strong> {selectedOrder.customer_telegram}</p>
                    )}
                </div>
              </div>
              
                  <div>
                  <h3 className="font-semibold mb-3 text-white">Project Information</h3>
                  <div className="space-y-2 text-white">
                    <p><strong>Service:</strong> {selectedOrder.service_type}</p>
                    <p><strong>Budget:</strong> {selectedOrder.budget_range}</p>
                    <p><strong>Timeline:</strong> {selectedOrder.timeline}</p>
                    <p><strong>Status:</strong> {selectedOrder.status}</p>
                    <p><strong>Payment Status:</strong> {selectedOrder.payment_status}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-semibold mb-3 text-white">Project Description</h3>
                <p className="text-white/80">{selectedOrder.project_description}</p>
              </div>
              
              {selectedOrder.project_requirements && selectedOrder.project_requirements.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3 text-white">Project Requirements</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedOrder.project_requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-white">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrder.admin_notes && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3 text-white">Admin Notes</h3>
                  <p className="text-white/80">{selectedOrder.admin_notes}</p>
                </div>
              )}

              {selectedOrder.project_files && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-3 text-white">Project Files</h3>
                  <div className="space-y-2 text-white">
                    {selectedOrder.project_files.source_code && (
                      <p><strong>Source Code:</strong> <a href={selectedOrder.project_files.source_code} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{selectedOrder.project_files.source_code}</a></p>
                    )}
                    {selectedOrder.project_files.documentation && (
                      <p><strong>Documentation:</strong> <a href={selectedOrder.project_files.documentation} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{selectedOrder.project_files.documentation}</a></p>
                    )}
                    {selectedOrder.project_files.demo_url && (
                      <p><strong>Demo:</strong> <a href={selectedOrder.project_files.demo_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{selectedOrder.project_files.demo_url}</a></p>
                    )}
                    {selectedOrder.project_files.installation_guide && (
                      <p><strong>Installation Guide:</strong> <a href={selectedOrder.project_files.installation_guide} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{selectedOrder.project_files.installation_guide}</a></p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <Button variant="outline" onClick={() => setShowOrderDetails(false)} className="border-white/20 text-white hover:bg-white/10">
                  Close
                </Button>
                <Button onClick={() => {
                  setEditingOrder(selectedOrder);
                  setShowOrderDetails(false);
                }} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Edit Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">Edit Order</h2>
                <Button variant="outline" onClick={() => setEditingOrder(null)}>
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updates = {
                  admin_notes: formData.get('admin_notes') as string,
                  delivery_date: formData.get('delivery_date') as string
                };
                updateOrderDetails(editingOrder.id, updates);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Admin Notes</label>
                    <Textarea
                      name="admin_notes"
                      defaultValue={editingOrder.admin_notes || ''}
                      placeholder="Add admin notes..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Expected Delivery Date</label>
                    <Input
                      type="date"
                      name="delivery_date"
                      defaultValue={editingOrder.delivery_date ? editingOrder.delivery_date.split('T')[0] : ''}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setEditingOrder(null)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Update Order
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};