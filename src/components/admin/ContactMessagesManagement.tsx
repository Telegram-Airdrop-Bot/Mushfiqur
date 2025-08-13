import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Eye, CheckCircle, Archive, Reply, Clock, User, Mail, FileText } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  project: string | null;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export function ContactMessagesManagement() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showMessageDetail, setShowMessageDetail] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch contact messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, status: ContactMessage['status']) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Message marked as ${status}`,
      });
      
      await fetchMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
    }
  };

  const updateAdminNotes = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ 
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Admin notes updated",
      });
      
      setAdminNotes('');
      await fetchMessages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update admin notes",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'bg-red-100 text-red-800 border-red-300';
      case 'read': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'replied': return 'bg-green-100 text-green-800 border-green-300';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unread': return Clock;
      case 'read': return Eye;
      case 'replied': return Reply;
      case 'archived': return Archive;
      default: return Clock;
    }
  };

  const filteredMessages = selectedStatus === 'all' 
    ? messages 
    : messages.filter(message => message.status === selectedStatus);

  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const totalCount = messages.length;

  if (isLoading) {
    return <div className="text-center py-8">Loading contact messages...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Contact Messages</h2>
          <p className="text-muted-foreground">
            Manage contact form submissions from your website
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{totalCount}</div>
            <div className="text-sm text-muted-foreground">Total Messages</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
            <div className="text-sm text-muted-foreground">Unread</div>
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Filter Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedStatus === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus('all')}
            >
              All Messages
              <Badge variant="secondary" className="ml-2">
                {totalCount}
              </Badge>
            </Button>
            <Button
              variant={selectedStatus === 'unread' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus('unread')}
            >
              Unread
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            </Button>
            <Button
              variant={selectedStatus === 'read' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus('read')}
            >
              Read
              <Badge variant="secondary" className="ml-2">
                {messages.filter(m => m.status === 'read').length}
              </Badge>
            </Button>
            <Button
              variant={selectedStatus === 'replied' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus('replied')}
            >
              Replied
              <Badge variant="secondary" className="ml-2">
                {messages.filter(m => m.status === 'replied').length}
              </Badge>
            </Button>
            <Button
              variant={selectedStatus === 'archived' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedStatus('archived')}
            >
              Archived
              <Badge variant="secondary" className="ml-2">
                {messages.filter(m => m.status === 'archived').length}
              </Badge>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No messages found</p>
              <p className="text-sm">Contact form submissions will appear here</p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => {
            const StatusIcon = getStatusIcon(message.status);
            
            return (
              <Card key={message.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{message.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {message.email}
                          </div>
                        </div>
                        <Badge className={getStatusColor(message.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {message.status}
                        </Badge>
                      </div>
                      
                      {message.project && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>Project: {message.project}</span>
                        </div>
                      )}
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {message.message}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(message.created_at).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMessage(message);
                          setAdminNotes(message.admin_notes || '');
                          setShowMessageDetail(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      {message.status === 'unread' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateMessageStatus(message.id, 'read')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Read
                        </Button>
                      )}
                      
                      {message.status !== 'replied' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateMessageStatus(message.id, 'replied')}
                        >
                          <Reply className="h-4 w-4 mr-1" />
                          Mark Replied
                        </Button>
                      )}
                      
                      {message.status !== 'archived' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateMessageStatus(message.id, 'archived')}
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Archive
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Message Detail Modal */}
      {showMessageDetail && selectedMessage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full border border-primary shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold">Message Details</h2>
                <p className="text-sm text-muted-foreground">
                  From: {selectedMessage.name} ({selectedMessage.email})
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowMessageDetail(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              {selectedMessage.project && (
                <div>
                  <h4 className="font-medium mb-2">Project</h4>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                    {selectedMessage.project}
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2">Message</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {selectedMessage.message}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Admin Notes</h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this message..."
                  rows={3}
                  className="mb-2"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateAdminNotes(selectedMessage.id)}
                >
                  Save Notes
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Received: {new Date(selectedMessage.created_at).toLocaleString()}
                {selectedMessage.updated_at !== selectedMessage.created_at && (
                  <>
                    <span>•</span>
                    Updated: {new Date(selectedMessage.updated_at).toLocaleString()}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 