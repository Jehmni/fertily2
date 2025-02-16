import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatWindow } from '@/components/chat/ChatWindow';

describe('ChatWindow', () => {
  it('renders correctly', () => {
    render(<ChatWindow messages={[]} onSend={() => {}} isLoading={false} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('handles message sending', () => {
    const onSend = vi.fn();
    render(<ChatWindow messages={[]} onSend={onSend} isLoading={false} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    expect(onSend).toHaveBeenCalledWith('Hello');
  });
}); 