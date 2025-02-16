
import React from 'react';

interface ChatWindowProps {
  messages: Array<{ text: string; isBot: boolean }>;
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSend, isLoading }) => {
  return (
    <div>
      {/* Implementation to be added */}
    </div>
  );
};
