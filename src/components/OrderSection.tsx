import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bot, DollarSign, Clock, Send, ExternalLink, Briefcase, FileText, CreditCard, Bitcoin, Wallet, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sendOrderConfirmationEmail, sendAdminNotificationEmail } from "@/lib/email-service";

export const OrderSection = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerTelegram: '',
    serviceType: '',
    projectDescription: '',
    budgetRange: '',
    timeline: '',
    paymentMethod: '',
    projectRequirements: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const { toast } = useToast();

  // Show payment details immediately when crypto, bkash, or nagad is selected
  const shouldShowPaymentDetails = ['crypto', 'bkash', 'nagad'].includes(formData.paymentMethod);

  // Get payment details based on selected method
  const getPaymentDetails = () => {
    const budget = parseFloat(formData.budgetRange) || 0;
    
    switch (formData.paymentMethod) {
      case 'crypto':
        return {
          title: 'Crypto Payment (TRC20)',
          wallet: 'TVr3sHER7ipTmLbuEqagxPKMBrvXtSp3QM',
          amount: budget,
          currency: 'USDT',
          instructions: [
            '• Send payment to TRC20 wallet address',
            '• USDT/BUSD preferred',
            '• Include your order ID in payment note',
            '• Order will be processed after payment confirmation'
          ]
        };
      case 'bkash':
        return {
          title: 'bKash Payment',
          wallet: '01753496359',
          amount: budget * 125, // Convert USD to BDT (1 USDT = 125 BDT)
          currency: 'BDT',
          instructions: [
            '• Send payment to bKash number',
            '• Include your order ID in payment note',
            '• Order will be processed after payment confirmation',
            '• Keep the transaction ID for reference'
          ]
        };
      case 'nagad':
        return {
          title: 'Nagad Payment',
          wallet: '01701259687',
          amount: budget * 125, // Convert USD to BDT (1 USDT = 125 BDT)
          currency: 'BDT',
          instructions: [
            '• Send payment to Nagad number',
            '• Include your order ID in payment note',
            '• Order will be processed after payment confirmation',
            '• Keep the transaction ID for reference'
          ]
        };
      default:
        return null;
    }
  };

  const paymentDetails = getPaymentDetails();

  const projectRequirements = [
    'User Authentication',
    'Payment Integration', 
    'Database Integration',
    'API Integration',
    'Custom Design',
    'Mobile Responsive',
    'Admin Dashboard',
    'Real-time Updates',
    'File Upload',
    'Email Notifications'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRequirementToggle = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      projectRequirements: prev.projectRequirements.includes(requirement)
        ? prev.projectRequirements.filter(r => r !== requirement)
        : [...prev.projectRequirements, requirement]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
        variant: "destructive"
      });
      return;
    }

    // Require payment proof for crypto, bkash, and nagad payments
    if (['crypto', 'bkash', 'nagad'].includes(formData.paymentMethod) && !paymentProof) {
      toast({
        title: "Payment Proof Required",
        description: "Please upload payment proof for your selected payment method.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting order from OrderSection...');
      
      // Prepare order data according to the database schema
      const orderData = {
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        customer_telegram: formData.customerTelegram || null,
        project_description: formData.projectDescription,
        service_type: formData.serviceType,
        budget_range: formData.budgetRange,
        timeline: formData.timeline,
        payment_method: formData.paymentMethod,
        project_requirements: formData.projectRequirements,
        status: 'pending',
        payment_status: 'pending',
        payment_proof: paymentProof ? `payment_proof_${Date.now()}_${paymentProof.name}` : null
      };

      console.log('Order data for Supabase:', orderData);

      // Insert order into Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select();

      if (error) {
        console.error('Error submitting order:', error);
        
        if (error.code === '42501') {
          throw new Error('Row Level Security (RLS) is blocking this operation. Please contact the administrator to configure RLS policies for the orders table.');
        }
        
        throw new Error(error.message);
      }

      console.log('Order submitted successfully:', data);

      // TODO: Upload payment proof file to storage service
      // For now, we'll just store the filename reference
      if (paymentProof) {
        console.log('Payment proof file:', paymentProof.name, 'Size:', paymentProof.size);
        // Here you would typically upload to Supabase Storage or another file service
        // const { data: uploadData, error: uploadError } = await supabase.storage
        //   .from('payment-proofs')
        //   .upload(`order_${data[0].id}/${paymentProof.name}`, paymentProof);
      }

      // Send email notifications
      try {
        // Send order confirmation email to customer
        await sendOrderConfirmationEmail({
          id: data[0].id,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_telegram: formData.customerTelegram,
          project_description: formData.projectDescription,
          service_type: formData.serviceType,
          budget_range: formData.budgetRange,
          timeline: formData.timeline,
          payment_method: formData.paymentMethod,
          project_requirements: formData.projectRequirements,
          status: 'pending',
          payment_status: 'pending',
          payment_proof: paymentProof ? `payment_proof_${Date.now()}_${paymentProof.name}` : null
        });

        // Send admin notification email
        await sendAdminNotificationEmail({
          id: data[0].id,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_telegram: formData.customerTelegram,
          project_description: formData.projectDescription,
          service_type: formData.serviceType,
          budget_range: formData.budgetRange,
          timeline: formData.timeline,
          payment_method: formData.paymentMethod,
          project_requirements: formData.projectRequirements,
          status: 'pending',
          payment_status: 'pending',
          payment_proof: paymentProof ? `payment_proof_${Date.now()}_${paymentProof.name}` : null
        });

        toast({
          title: "Order Submitted Successfully!",
          description: "We've sent you a confirmation email with payment details.",
        });
      } catch (error) {
        console.error('Failed to send email notifications:', error);
        toast({
          title: "Order Submitted",
          description: "Order submitted successfully, but there was an issue sending email notifications.",
          variant: "destructive"
        });
      }

      // Show payment details
      setShowPaymentDetails(true);

      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        customerTelegram: '',
        serviceType: '',
        projectDescription: '',
        budgetRange: '',
        timeline: '',
        paymentMethod: '',
        projectRequirements: []
      });
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: "Order Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order" className="py-20 px-4 bg-gradient-to-br from-background via-secondary/5 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Place Your Order
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose your preferred way to order your custom bot or automation system
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="fiverr" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Fiverr
            </TabsTrigger>
            <TabsTrigger value="upwork" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              Upwork
            </TabsTrigger>
            <TabsTrigger value="form" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Direct Form
            </TabsTrigger>
          </TabsList>

          {/* Fiverr Tab */}
          <TabsContent value="fiverr">
            <Card className="p-8 shadow-2xl border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Briefcase className="h-6 w-6 text-primary" />
                  Order via Fiverr
                </CardTitle>
                <p className="text-muted-foreground">
                  Get professional service with buyer protection and secure payments
                </p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-lg text-primary">
                    <DollarSign className="h-5 w-5" />
                    <span>Custom Order</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-lg text-secondary">
                    <Clock className="h-5 w-5" />
                    <span>Fast delivery guaranteed</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Why Choose Fiverr?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="font-semibold mb-2">Buyer Protection</div>
                      <div className="text-muted-foreground">Secure payments and money-back guarantee</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="font-semibold mb-2">Professional Service</div>
                      <div className="text-muted-foreground">Verified seller with 5-star ratings</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="font-semibold mb-2">Fast Communication</div>
                      <div className="text-muted-foreground">Quick responses and project updates</div>
                    </div>
                  </div>
                </div>

                <Button 
                  asChild 
                  size="lg" 
                  className="w-full md:w-auto px-8"
                  variant="neon"
                >
                  <a 
                    href="https://www.fiverr.com/sellers/digi707" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Briefcase className="mr-2 h-5 w-5" />
                    Order on Fiverr
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upwork Tab */}
          <TabsContent value="upwork">
            <Card className="p-8 shadow-2xl border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <ExternalLink className="h-6 w-6 text-primary" />
                  Order via Upwork
                </CardTitle>
                <p className="text-muted-foreground">
                  Professional platform with milestone payments and project management
                </p>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-lg text-primary">
                    <DollarSign className="h-5 w-5" />
                    <span>Flexible pricing options</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-lg text-secondary">
                    <Clock className="h-5 w-5" />
                    <span>Milestone-based delivery</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Why Choose Upwork?</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="font-semibold mb-2">Milestone Payments</div>
                      <div className="text-muted-foreground">Pay as work progresses</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="font-semibold mb-2">Project Management</div>
                      <div className="text-muted-foreground">Track progress and communicate easily</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="font-semibold mb-2">Quality Assurance</div>
                      <div className="text-muted-foreground">Work satisfaction guaranteed</div>
                    </div>
                  </div>
                </div>

                <Button 
                  asChild 
                  size="lg" 
                  className="w-full md:w-auto px-8"
                  variant="glow"
                >
                  <a 
                    href="https://www.upwork.com/freelancers/~016416bdd1d6a2a301" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Order on Upwork
                  </a>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Direct Form Tab */}
          <TabsContent value="form">
            <Card className="p-8 shadow-2xl border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Bot className="h-6 w-6 text-primary" />
                  Direct Order Form
                </CardTitle>
                <p className="text-muted-foreground">
                  Submit your order directly and get a personalized quote
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Your Name *</Label>
                      <Input
                        id="customerName"
                        value={formData.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        placeholder="Your Name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerTelegram">Telegram Username</Label>
                    <Input
                      id="customerTelegram"
                      value={formData.customerTelegram}
                      onChange={(e) => handleInputChange('customerTelegram', e.target.value)}
                      placeholder="@mushfiqmoon"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Service Type *</Label>
                    <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Service Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="telegram-bot">Telegram Bot</SelectItem>
                        <SelectItem value="discord-bot">Discord Bot</SelectItem>
                        <SelectItem value="automation-script">Automation Script</SelectItem>
                        <SelectItem value="telegram-mini-app">Telegram Mini App</SelectItem>
                        <SelectItem value="react-web-app">React Web Application</SelectItem>
                        <SelectItem value="custom-solution">Custom Solution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectDescription">Project Description *</Label>
                    <Textarea
                      id="projectDescription"
                      value={formData.projectDescription}
                      onChange={(e) => handleInputChange('projectDescription', e.target.value)}
                      placeholder="Describe your required bot or system in detail..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Project Requirements</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {projectRequirements.map((requirement) => (
                        <div key={requirement} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={requirement}
                            checked={formData.projectRequirements.includes(requirement)}
                            onChange={() => handleRequirementToggle(requirement)}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor={requirement} className="text-sm">{requirement}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="budgetRange">Budget Range *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                          $
                        </span>
                        <Input
                          type="number"
                          id="budgetRange"
                          value={formData.budgetRange}
                          onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                          placeholder="Enter your budget amount"
                          className="pl-8"
                          min="1"
                          step="0.01"
                          required
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enter the amount you're willing to pay for this project
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeline">Timeline *</Label>
                      <Select value={formData.timeline} onValueChange={(value) => handleInputChange('timeline', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Timeline" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-3-days">1-3 Days</SelectItem>
                          <SelectItem value="1-week">1 Week</SelectItem>
                          <SelectItem value="2-weeks">2 Weeks</SelectItem>
                          <SelectItem value="1-month">1 Month</SelectItem>
                          <SelectItem value="custom">Custom Timeline</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method *</Label>
                    <Select value={formData.paymentMethod} onValueChange={(value) => handleInputChange('paymentMethod', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Payment Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crypto">
                          <div className="flex items-center gap-2">
                            <Bitcoin className="h-4 w-4" />
                            Crypto (TRC20)
                          </div>
                        </SelectItem>
                        <SelectItem value="bkash">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">b</span>
                            </div>
                            bKash
                          </div>
                        </SelectItem>
                        <SelectItem value="nagad">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">N</span>
                            </div>
                            Nagad
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Details Display */}
                  {shouldShowPaymentDetails && paymentDetails && (
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                      <h4 className="font-semibold mb-3 text-primary">{paymentDetails.title}</h4>
                      
                      {/* Payment Amount Display */}
                      <div className="mb-3 p-3 bg-white rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">Payment Amount:</span>
                          <span className="text-lg font-bold text-primary">
                            {paymentDetails.amount.toFixed(2)} {paymentDetails.currency}
                          </span>
                        </div>
                        {formData.paymentMethod !== 'crypto' && (
                          <div className="text-xs text-gray-500">
                            Converted from ${formData.budgetRange} USD (Rate: 1 USD ≈ 125 BDT)
                          </div>
                        )}
                      </div>
                      
                      {/* Wallet Address Display */}
                      <div className="mb-3 p-3 bg-white rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2">
                          {formData.paymentMethod === 'crypto' ? (
                            <Bitcoin className="h-4 w-4 text-primary" />
                          ) : formData.paymentMethod === 'bkash' ? (
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">b</span>
                            </div>
                          ) : (
                            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">N</span>
                            </div>
                          )}
                          <span className="font-mono text-sm bg-gray-50 px-2 py-1 rounded border flex-1 text-black/50">
                            {paymentDetails.wallet}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(paymentDetails.wallet)}
                            className="ml-auto"
                          >
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {paymentDetails.instructions.map((instruction, index) => (
                          <p key={index}>• {instruction}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Payment Proof Upload - Show when crypto, bkash, or nagad is selected */}
                  {shouldShowPaymentDetails && (
                    <div className="space-y-2">
                      <Label htmlFor="paymentProof">Payment Proof *</Label>
                      <div className="p-4 bg-muted/30 rounded-lg border border-primary/20">
                        <p className="text-sm text-muted-foreground mb-3">
                          After completing your payment, please upload a screenshot or receipt as proof.
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Input
                              type="file"
                              id="paymentProof"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setPaymentProof(e.target.files[0]);
                                }
                              }}
                              className="flex-1"
                              required
                            />
                          </div>
                          
                          {paymentProof && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>File selected: {paymentProof.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Order
                      </>
                    )}
                  </Button>
                </form>

                {/* Order Success Message */}
                {showPaymentDetails && (
                  <div className="mt-8 p-6 bg-muted/30 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <h3 className="text-lg font-semibold text-green-600">Order Submitted Successfully!</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Your order has been submitted successfully! Payment details and order confirmation have been sent to your email. 
                          Please check your inbox and spam folder.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Bot className="h-4 w-4 text-primary" />
                      <span>Professional Quality</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Fast Delivery</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <span>Affordable Price</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};