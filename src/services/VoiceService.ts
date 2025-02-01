import { supabase } from "@/lib/supabase";

export const VoiceService = {
  async speechToText(audioBlob: Blob): Promise<string> {
    const base64Audio = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.readAsDataURL(audioBlob);
    });

    const { data, error } = await supabase.functions.invoke('voice-to-text', {
      body: { audio: base64Audio }
    });

    if (error) throw error;
    return data.text;
  },

  async textToSpeech(text: string): Promise<string> {
    const { data, error } = await supabase.functions.invoke('text-to-voice', {
      body: { text, voice: 'alloy' }
    });

    if (error) throw error;
    return data.audioContent;
  }
};