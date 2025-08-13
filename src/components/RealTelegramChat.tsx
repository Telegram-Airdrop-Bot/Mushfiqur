import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Bot, X, AlertCircle, CheckCircle, Clock, RefreshCw, User } from 'lucide-react';
import { useUserSession } from '@/hooks/useUserSession';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

interface RealTelegramChatProps {
  botToken: string;
  chatId: string;
  isOpen: boolean;
  onClose: () => void;
  adminName?: string; // Admin এর নাম
}

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  date: number;
  text: string;
}

export const RealTelegramChat = ({ botToken, chatId, isOpen, onClose, adminName = "Admin" }: RealTelegramChatProps) => {
  const [messages, setMessages] = useState<TelegramMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [lastUpdateId, setLastUpdateId] = useState<number>(0);
  const [isPolling, setIsPolling] = useState(false);
  const [botInfo, setBotInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // User session tracking
  const { session, addChatMessage, trackTyping } = useUserSession();
  
  // Analytics data tracking
  const { addChatMessage: addAnalyticsMessage, trackPageView } = useAnalyticsData();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize chat and start polling
  useEffect(() => {
    if (isOpen && botToken && chatId) {
      testConnection();
      startPolling();
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isOpen, botToken, chatId]);

  const testConnection = async () => {
    try {
      setConnectionStatus('connecting');
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const data = await response.json();
      
      if (data.ok) {
        setBotInfo(data.result);
        setConnectionStatus('connected');
        setIsConnected(true);
        setError(null);
        console.log('Bot connection successful:', data.result);
        
        // Get initial messages
        await fetchInitialMessages();
      } else {
        setConnectionStatus('error');
        setError(`Bot connection failed: ${data.description}`);
        setIsConnected(false);
      }
    } catch (err) {
      setConnectionStatus('error');
      setError('Failed to connect to Telegram API');
      setIsConnected(false);
      console.error('Connection test failed:', err);
    }
  };

  const fetchInitialMessages = async () => {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?chat_id=${chatId}&limit=20`);
      const data = await response.json();
      
      if (data.ok && data.result && data.result.length > 0) {
        const chatMessages = data.result
          .filter((update: any) => update.message && update.message.chat.id.toString() === chatId)
          .map((update: any) => update.message);
        
        setMessages(chatMessages);
        
        // Set last update ID for efficient polling
        const lastUpdate = data.result[data.result.length - 1];
        if (lastUpdate.update_id) {
          setLastUpdateId(lastUpdate.update_id);
        }
        
        console.log('Initial messages loaded:', chatMessages.length);
      }
    } catch (err) {
      console.error('Error fetching initial messages:', err);
    }
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Poll for new messages every 3 seconds
    pollingIntervalRef.current = setInterval(async () => {
      if (!isConnected || isPolling) return;
      
      await pollForNewMessages();
    }, 3000);
  };

  const pollForNewMessages = async () => {
    if (isPolling) return;
    
    setIsPolling(true);
    try {
      // Use offset to get only new messages
      const offset = lastUpdateId > 0 ? lastUpdateId + 1 : 0;
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates?offset=${offset}&limit=10`);
      const data = await response.json();
      
      if (data.ok && data.result && data.result.length > 0) {
        const newMessages = data.result
          .filter((update: any) => update.message && update.message.chat.id.toString() === chatId)
          .map((update: any) => update.message);
        
        if (newMessages.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.message_id));
            const filteredNewMessages = newMessages.filter((m: TelegramMessage) => !existingIds.has(m.message_id));
            return [...prev, ...filteredNewMessages];
          });
          
          // Update last update ID
          const lastUpdate = data.result[data.result.length - 1];
          if (lastUpdate.update_id) {
            setLastUpdateId(lastUpdate.update_id);
          }
          
          // Track incoming messages in both session systems
          newMessages.forEach(message => {
            addChatMessage(message.text, false, 'text');
            addAnalyticsMessage(message.text, false);
          });
          
          console.log('New messages received:', newMessages.length);
        }
      }
    } catch (err) {
      console.error('Error polling for new messages:', err);
    } finally {
      setIsPolling(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !botToken || !chatId || !isConnected) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: inputText,
        }),
      });

      const data = await response.json();
      
      if (data.ok) {
        // Add message to local state
        const newMessage: TelegramMessage = {
          message_id: Date.now(),
          from: {
            id: 0, // User ID (will be set by actual API response)
            first_name: 'You',
          },
          chat: {
            id: parseInt(chatId),
            type: 'private',
          },
          date: Math.floor(Date.now() / 1000),
          text: inputText,
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Track outgoing message in both session systems
        addChatMessage(inputText, true, 'text');
        addAnalyticsMessage(inputText, true);
        
        setInputText('');
        
        // Show success feedback
        setTimeout(() => {
          setError(null);
        }, 3000);
        
        // Force poll for new messages after sending
        setTimeout(() => {
          pollForNewMessages();
        }, 1000);
      } else {
        setError(`Failed to send message: ${data.description}`);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message - network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    
    // Track typing activity
    if (e.target.value.length > 0) {
      trackTyping(true);
    } else {
      trackTyping(false);
    }
  };

  const openInTelegram = () => {
    if (botInfo && botInfo.username) {
      window.open(`https://t.me/${botInfo.username}`, '_blank');
    } else {
      // Fallback if bot info not available
      const botUsername = botToken.split(':')[0];
      window.open(`https://t.me/${botUsername}`, '_blank');
    }
  };

  const retryConnection = () => {
    testConnection();
  };

  const manualRefresh = () => {
    pollForNewMessages();
  };

  // Get display name for header
  const getDisplayName = () => {
    if (adminName && adminName !== "Admin") {
      return adminName;
    }
    if (botInfo && botInfo.first_name) {
      return botInfo.first_name;
    }
    return "Admin";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96">
      <Card className="shadow-2xl border-primary/20">
        <CardHeader className="pb-3 bg-gradient-primary text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <CardTitle className="text-sm">Chat with {getDisplayName()}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-400' : 
                connectionStatus === 'connecting' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Connection Status */}
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {connectionStatus === 'connected' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : connectionStatus === 'connecting' ? (
                  <Clock className="w-4 h-4 text-yellow-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  connectionStatus === 'connected' ? 'text-green-600' : 
                  connectionStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {connectionStatus === 'connected' ? 'Connected' : 
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Connection Failed'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {connectionStatus === 'connected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={manualRefresh}
                    disabled={isPolling}
                    className="text-xs h-6 px-2"
                  >
                    <RefreshCw className={`w-3 h-3 ${isPolling ? 'animate-spin' : ''}`} />
                  </Button>
                )}
                {connectionStatus === 'error' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={retryConnection}
                    className="text-xs h-6 px-2"
                  >
                    Retry
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border-b border-destructive/20">
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-muted/30">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.message_id}
                  className={`flex ${message.from.id === 0 ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      message.from.id === 0
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-card-foreground border'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.from.id === 0 ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {new Date(message.date * 1000).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t bg-background">
            <div className="flex gap-2">
              <Input
                value={inputText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={!isConnected || isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputText.trim() || !isConnected || isLoading}
                size="sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Open in Telegram Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={openInTelegram}
              className="w-full mt-2"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Open in Telegram App
            </Button>
            
            <p className="text-xs text-muted-foreground text-center mt-2">
              Real-time chat with {getDisplayName()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 