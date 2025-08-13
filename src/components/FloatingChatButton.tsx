import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { RealTelegramChat } from './RealTelegramChat';

interface FloatingChatButtonProps {
  botUsername: string;
  adminName?: string; // Admin এর নাম
}

export const FloatingChatButton = ({ botUsername, adminName = "Mushfiq" }: FloatingChatButtonProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={toggleChat}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-2xl transition-all duration-300 ${
          isChatOpen 
            ? 'bg-destructive hover:bg-destructive/90' 
            : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {isChatOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>

      {/* Real Telegram Chat Interface */}
      <RealTelegramChat
        botToken={import.meta.env.VITE_TELEGRAM_BOT_TOKEN || ''}
        chatId={import.meta.env.VITE_TELEGRAM_CHAT_ID || ''}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        adminName={adminName}
      />
    </>
  );
}; 