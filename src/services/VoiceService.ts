
import { supabase } from "@/lib/supabase";

export const VoiceService = {
  async speechToText(audioBlob: Blob): Promise<string> {
    const base64Audio = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        } catch (error) {
          reject(new Error('Failed to convert audio to base64'));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(audioBlob);
    });

    const { data, error } = await supabase.functions.invoke('voice-to-text', {
      body: { audio: base64Audio }
    });

    if (error) throw error;
    return data.text;
  },

  async textToSpeech(text: string): Promise<string> {
    if (!text?.trim()) {
      throw new Error('Text is required for speech synthesis');
    }

    const { data, error } = await supabase.functions.invoke('text-to-voice', {
      body: { text, voice: 'alloy' }
    });

    if (error) {
      console.error('Text to speech error:', error);
      throw new Error('Failed to convert text to speech');
    }

    if (!data?.audioContent) {
      throw new Error('No audio content received');
    }

    return data.audioContent;
  }
};
