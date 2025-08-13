// Email service utility for order notifications
// This file provides placeholder implementations for email sending
// In production, you would integrate with services like SendGrid, AWS SES, or Resend

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderData {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_telegram?: string;
  project_description: string;
  service_type: string;
  budget_range: string;
  timeline: string;
  payment_method: string;
  project_requirements: string[];
  status: string;
  payment_status: string;
  admin_notes?: string;
  delivery_date?: string;
  project_files?: any;
  payment_proof?: string;
}

export interface DeliveryDetails {
  source_code?: string;
  documentation?: string;
  demo_url?: string;
  installation_guide?: string;
  admin_notes?: string;
}

// Placeholder email sending function
// Replace this with your actual email service integration
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // For now, we'll log the email data and return true
    // In production, you would integrate with a real email service like SendGrid, AWS SES, etc.
    console.log('📧 Email would be sent:', {
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html.substring(0, 100) + '...', // Log first 100 chars
      text: emailData.text?.substring(0, 100) + '...' || 'No text version'
    });
    
    // TODO: Implement actual email sending
    // Example with SendGrid:
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: emailData.to }] }],
    //     from: { email: process.env.EMAIL_FROM || 'noreply@yourdomain.com' },
    //     subject: emailData.subject,
    //     content: [
    //       { type: 'text/html', value: emailData.html },
    //       ...(emailData.text ? [{ type: 'text/plain', value: emailData.text }] : [])
    //     ]
    //   })
    // });
    
    // if (!response.ok) {
    //   throw new Error(`Email service error: ${response.status}`);
    // }
    
    console.log('✅ Email sent successfully (simulated)');
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

// Order confirmation email to customer
export const sendOrderConfirmationEmail = async (orderData: OrderData): Promise<boolean> => {
  const paymentDetails = getPaymentInstructions(orderData.payment_method, orderData.budget_range);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .payment-info { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50; }
        .requirement { background: white; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 3px solid #667eea; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Order Confirmed!</h1>
          <p>Thank you for choosing our services</p>
        </div>
        
        <div class="content">
          <h2>Order #${orderData.id}</h2>
          
          <div class="order-details">
            <h3>Order Details</h3>
            <p><strong>Service:</strong> ${orderData.service_type}</p>
            <p><strong>Budget Range:</strong> ${orderData.budget_range}</p>
            <p><strong>Timeline:</strong> ${orderData.timeline}</p>
            <p><strong>Status:</strong> <span style="color: #ff9800;">${orderData.status}</span></p>
            <p><strong>Payment Status:</strong> <span style="color: #f44336;">${orderData.payment_status}</span></p>
          </div>

          <div class="order-details">
            <h3>Project Description</h3>
            <p>${orderData.project_description}</p>
          </div>

          ${orderData.project_requirements.length > 0 ? `
            <div class="order-details">
              <h3>Project Requirements</h3>
              ${orderData.project_requirements.map(req => `<div class="requirement">✓ ${req}</div>`).join('')}
            </div>
          ` : ''}

          <div class="payment-info">
            <h3>Payment Instructions</h3>
            <p><strong>Payment Method:</strong> ${getPaymentMethodDisplay(orderData.payment_method)}</p>
            ${paymentDetails.map(detail => `<p>• ${detail}</p>`).join('')}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:support@yourdomain.com" class="button">Contact Support</a>
          </div>

          <div class="footer">
            <p>We'll keep you updated on your order progress.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: orderData.customer_email,
    subject: `Order Confirmation #${orderData.id} - ${orderData.service_type}`,
    html
  });
};

// Admin notification email for new orders
export const sendAdminNotificationEmail = async (orderData: OrderData): Promise<boolean> => {
  const paymentDetails = getPaymentInstructions(orderData.payment_method, orderData.budget_range);
  
  // Get admin URL from environment or use fallback
  const adminUrl = typeof window !== 'undefined' 
    ? (window as any).__NEXT_DATA__?.props?.adminUrl || 'http://localhost:3000/admin'
    : 'http://localhost:3000/admin';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f44336; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .requirement { background: white; padding: 10px; margin: 5px 0; border-radius: 5px; border-left: 3px solid #f44336; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #f44336; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🆕 New Order Received!</h1>
          <p>Order #${orderData.id}</p>
        </div>
        
        <div class="content">
          <div class="order-details">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${orderData.customer_name}</p>
            <p><strong>Email:</strong> ${orderData.customer_email}</p>
            ${orderData.customer_telegram ? `<p><strong>Telegram:</strong> ${orderData.customer_telegram}</p>` : ''}
          </div>

          <div class="order-details">
            <h3>Project Details</h3>
            <p><strong>Service:</strong> ${orderData.service_type}</p>
            <p><strong>Budget Range:</strong> ${orderData.budget_range}</p>
            <p><strong>Timeline:</strong> ${orderData.timeline}</p>
            <p><strong>Payment Method:</strong> ${getPaymentMethodDisplay(orderData.payment_method)}</p>
          </div>

          <div class="order-details">
            <h3>Project Description</h3>
            <p>${orderData.project_description}</p>
          </div>

          ${orderData.project_requirements.length > 0 ? `
            <div class="order-details">
              <h3>Project Requirements</h3>
              ${orderData.project_requirements.map(req => `<div class="requirement">✓ ${req}</div>`).join('')}
            </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${adminUrl}" class="button">View in Admin Panel</a>
          </div>

          <div class="footer">
            <p>Please review and process this order as soon as possible.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send to admin email (use fallback email for now)
  const adminEmail = 'admin@yourdomain.com'; // This should be configured in your deployment environment
  
  return sendEmail({
    to: adminEmail,
    subject: `New Order #${orderData.id} - ${orderData.service_type}`,
    html
  });
};

// Status update email to customer
export const sendStatusUpdateEmail = async (orderData: OrderData, newStatus: string): Promise<boolean> => {
  const statusInfo = getStatusInfo(newStatus);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${statusInfo.color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 10px 20px; background: ${statusInfo.color}; color: white; border-radius: 20px; font-weight: bold; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Order Status Update</h1>
          <p>Order #${orderData.id}</p>
        </div>
        
        <div class="content">
          <h2>Status Changed to: <span class="status-badge">${statusInfo.label}</span></h2>
          
          <div class="order-details">
            <h3>What This Means</h3>
            <p>${statusInfo.description}</p>
          </div>

          <div class="order-details">
            <h3>Order Summary</h3>
            <p><strong>Service:</strong> ${orderData.service_type}</p>
            <p><strong>Current Status:</strong> ${statusInfo.label}</p>
            ${orderData.admin_notes ? `<p><strong>Admin Notes:</strong> ${orderData.admin_notes}</p>` : ''}
          </div>

          <div class="footer">
            <p>We'll continue to keep you updated on your order progress.</p>
            <p>If you have any questions, please contact us.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: orderData.customer_email,
    subject: `Order Status Update #${orderData.id} - ${statusInfo.label}`,
    html
  });
};

// Payment status update email
export const sendPaymentStatusEmail = async (orderData: OrderData, newPaymentStatus: string): Promise<boolean> => {
  const paymentStatusInfo = getPaymentStatusInfo(newPaymentStatus);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Status Update</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${paymentStatusInfo.color}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .status-badge { display: inline-block; padding: 10px 20px; background: ${paymentStatusInfo.color}; color: white; border-radius: 20px; font-weight: bold; }
        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💳 Payment Status Update</h1>
          <p>Order #${orderData.id}</p>
        </div>
        
        <div class="content">
          <h2>Payment Status: <span class="status-badge">${paymentStatusInfo.label}</span></h2>
          
          <div class="order-details">
            <h3>What This Means</h3>
            <p>${paymentStatusInfo.description}</p>
          </div>

          <div class="order-details">
            <h3>Order Summary</h3>
            <p><strong>Service:</strong> ${orderData.service_type}</p>
            <p><strong>Payment Method:</strong> ${getPaymentMethodDisplay(orderData.payment_method)}</p>
            <p><strong>Payment Status:</strong> ${paymentStatusInfo.label}</p>
          </div>

          <div class="footer">
            <p>If you have any questions about payment, please contact us.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: orderData.customer_email,
    subject: `Payment Status Update #${orderData.id} - ${paymentStatusInfo.label}`,
    html
  });
};

// Project delivery email
export const sendDeliveryEmail = async (orderData: OrderData, deliveryDetails: DeliveryDetails): Promise<boolean> => {
  const subject = `Project Delivered - Order #${orderData.id}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">🎉 Project Delivered!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your order has been completed and delivered</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
          <h2 style="color: #333; margin-top: 0;">Order Details</h2>
          <p><strong>Order ID:</strong> #${orderData.id}</p>
          <p><strong>Service:</strong> ${orderData.service_type}</p>
          <p><strong>Project:</strong> ${orderData.project_description}</p>
          <p><strong>Budget:</strong> ${orderData.budget_range}</p>
        </div>
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #28a745;">
          <h3 style="color: #333; margin-top: 0;">📦 Delivery Package</h3>
          ${deliveryDetails.source_code ? `<p><strong>Source Code:</strong> <a href="${deliveryDetails.source_code}" style="color: #667eea;">Download Source Code</a></p>` : ''}
          ${deliveryDetails.documentation ? `<p><strong>Documentation:</strong> <a href="${deliveryDetails.documentation}" style="color: #667eea;">View Documentation</a></p>` : ''}
          ${deliveryDetails.demo_url ? `<p><strong>Demo:</strong> <a href="${deliveryDetails.demo_url}" style="color: #667eea;">Live Demo</a></p>` : ''}
          ${deliveryDetails.installation_guide ? `<p><strong>Installation Guide:</strong> <a href="${deliveryDetails.installation_guide}" style="color: #667eea;">View Guide</a></p>` : ''}
        </div>
        
        ${deliveryDetails.admin_notes ? `
        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
          <h3 style="color: #333; margin-top: 0;">📝 Developer Notes</h3>
          <p style="color: #666; line-height: 1.6;">${deliveryDetails.admin_notes}</p>
        </div>
        ` : ''}
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #17a2b8;">
          <h3 style="color: #333; margin-top: 0;">🚀 Next Steps</h3>
          <ol style="color: #666; line-height: 1.6;">
            <li>Download and review the source code</li>
            <li>Follow the installation guide</li>
            <li>Test the demo to ensure everything works</li>
            <li>Contact us if you need any modifications</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; margin-bottom: 20px;">Thank you for choosing our services!</p>
          <div style="background: #667eea; color: white; padding: 15px 30px; border-radius: 25px; display: inline-block;">
            <strong>Need Support?</strong> Reply to this email or contact us on Telegram
          </div>
        </div>
      </div>
    </div>
  `;

  const text = `
Project Delivered - Order #${orderData.id}

Your order has been completed and delivered!

Order Details:
- Order ID: #${orderData.id}
- Service: ${orderData.service_type}
- Project: ${orderData.project_description}
- Budget: ${orderData.budget_range}

Delivery Package:
${deliveryDetails.source_code ? `- Source Code: ${deliveryDetails.source_code}` : ''}
${deliveryDetails.documentation ? `- Documentation: ${deliveryDetails.documentation}` : ''}
${deliveryDetails.demo_url ? `- Demo: ${deliveryDetails.demo_url}` : ''}
${deliveryDetails.installation_guide ? `- Installation Guide: ${deliveryDetails.installation_guide}` : ''}

${deliveryDetails.admin_notes ? `Developer Notes: ${deliveryDetails.admin_notes}` : ''}

Next Steps:
1. Download and review the source code
2. Follow the installation guide
3. Test the demo to ensure everything works
4. Contact us if you need any modifications

Thank you for choosing our services!
  `;

  return await sendEmail({
    to: orderData.customer_email,
    subject,
    html,
    text
  });
};

export const sendCancellationEmail = async (orderData: OrderData, cancellationReason?: string): Promise<boolean> => {
  const subject = `Order Cancelled - Order #${orderData.id}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">❌ Order Cancelled</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your order has been cancelled</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #dc3545;">
          <h2 style="color: #333; margin-top: 0;">Order Details</h2>
          <p><strong>Order ID:</strong> #${orderData.id}</p>
          <p><strong>Service:</strong> ${orderData.service_type}</p>
          <p><strong>Project:</strong> ${orderData.project_description}</p>
          <p><strong>Budget:</strong> ${orderData.budget_range}</p>
          <p><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">Cancelled</span></p>
        </div>
        
        ${cancellationReason ? `
        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
          <h3 style="color: #333; margin-top: 0;">📝 Cancellation Reason</h3>
          <p style="color: #666; line-height: 1.6;">${cancellationReason}</p>
        </div>
        ` : ''}
        
        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #17a2b8;">
          <h3 style="color: #333; margin-top: 0;">💡 What Happens Next?</h3>
          <ul style="color: #666; line-height: 1.6;">
            <li>If you made any payment, it will be refunded according to our refund policy</li>
            <li>You can place a new order with modified requirements</li>
            <li>Contact us if you have any questions about the cancellation</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #666; margin-bottom: 20px;">We apologize for any inconvenience caused.</p>
          <div style="background: #dc3545; color: white; padding: 15px 30px; border-radius: 25px; display: inline-block;">
            <strong>Need Help?</strong> Reply to this email or contact us on Telegram
          </div>
        </div>
      </div>
    </div>
  `;

  const text = `
Order Cancelled - Order #${orderData.id}

Your order has been cancelled.

Order Details:
- Order ID: #${orderData.id}
- Service: ${orderData.service_type}
- Project: ${orderData.project_description}
- Budget: ${orderData.budget_range}
- Status: Cancelled

${cancellationReason ? `Cancellation Reason: ${cancellationReason}` : ''}

What Happens Next:
- If you made any payment, it will be refunded according to our refund policy
- You can place a new order with modified requirements
- Contact us if you have any questions about the cancellation

We apologize for any inconvenience caused.
  `;

  return await sendEmail({
    to: orderData.customer_email,
    subject,
    html,
    text
  });
};

// Helper functions
function getPaymentInstructions(paymentMethod: string, budgetRange?: string): string[] {
  const budget = parseFloat(budgetRange || '0');
  
  switch (paymentMethod) {
    case 'crypto':
      return [
        `Send payment to TRC20 wallet: TVr3sHER7ipTmLbuEqagxPKMBrvXtSp3QM`,
        `Amount: ${budget.toFixed(2)} USDT`,
        'USDT/BUSD preferred',
        'Include your order ID in payment note',
        'Order will be processed after payment confirmation'
      ];
    case 'bkash':
      return [
        `Send payment to bKash number: 01753496359`,
        `Amount: ${(budget * 125).toFixed(2)} BDT (Converted from $${budget} USD)`,
        'Include your order ID in payment note',
        'Order will be processed after payment confirmation',
        'Keep the transaction ID for reference'
      ];
    case 'nagad':
      return [
        `Send payment to Nagad number: 01701259687`,
        `Amount: ${(budget * 125).toFixed(2)} BDT (Converted from $${budget} USD)`,
        'Include your order ID in payment note',
        'Order will be processed after payment confirmation',
        'Keep the transaction ID for reference'
      ];
    default:
      return ['Payment instructions will be provided separately'];
  }
}

function getPaymentMethodDisplay(paymentMethod: string): string {
  switch (paymentMethod) {
    case 'crypto':
      return 'Crypto (Binance)';
    case 'bkash':
      return 'bKash';
    case 'nagad':
      return 'Nagad';
    default:
      return paymentMethod;
  }
}

function getStatusInfo(status: string): { label: string; description: string; color: string } {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        description: 'Your order has been received and is waiting for review.',
        color: '#ff9800'
      };
    case 'accepted':
      return {
        label: 'Accepted',
        description: 'Your order has been accepted and we\'re preparing to start development.',
        color: '#2196f3'
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        description: 'Development has started and we\'re actively working on your project.',
        color: '#2196f3'
      };
    case 'review':
      return {
        label: 'Under Review',
        description: 'Your project is complete and undergoing final review and testing.',
        color: '#9c27b0'
      };
    case 'completed':
      return {
        label: 'Completed',
        description: 'Your project has been completed and is ready for delivery!',
        color: '#4caf50'
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        description: 'Your order has been cancelled. Please contact us for more information.',
        color: '#f44336'
      };
    default:
      return {
        label: status,
        description: 'Your order status has been updated.',
        color: '#666'
      };
  }
}

function getPaymentStatusInfo(paymentStatus: string): { label: string; description: string; color: string } {
  switch (paymentStatus) {
    case 'pending':
      return {
        label: 'Payment Pending',
        description: 'We\'re waiting for your payment to proceed with the project.',
        color: '#ff9800'
      };
    case 'paid':
      return {
        label: 'Payment Received',
        description: 'Payment has been confirmed and we\'re proceeding with development.',
        color: '#4caf50'
      };
    case 'failed':
      return {
        label: 'Payment Failed',
        description: 'There was an issue with your payment. Please try again or contact support.',
        color: '#f44336'
      };
    case 'refunded':
      return {
        label: 'Payment Refunded',
        description: 'Your payment has been refunded. Please contact us for more information.',
        color: '#666'
      };
    default:
      return {
        label: paymentStatus,
        description: 'Your payment status has been updated.',
        color: '#666'
      };
  }
} 