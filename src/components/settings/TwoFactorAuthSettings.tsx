
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

type TwoFactorSettings = {
  enabled: boolean;
  method: 'email' | 'authenticator';
};

export const TwoFactorAuthSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<TwoFactorSettings>({
    enabled: false,
    method: 'email',
  });

  useEffect(() => {
    loadTwoFactorSettings();
  }, []);

  const loadTwoFactorSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('two_factor_auth')
        .select('enabled, method')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          enabled: data.enabled,
          method: data.method,
        });
      }
    } catch (error) {
      console.error('Error loading 2FA settings:', error);
      toast({
        title: "Error",
        description: "Failed to load 2FA settings",
        variant: "destructive",
      });
    }
  };

  const updateTwoFactorSettings = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { error } = await supabase
        .from('two_factor_auth')
        .upsert({
          user_id: session.user.id,
          enabled: settings.enabled,
          method: settings.method,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "2FA settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating 2FA settings:', error);
      toast({
        title: "Error",
        description: "Failed to update 2FA settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account with 2FA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Enable 2FA</Label>
            <p className="text-sm text-muted-foreground">
              Require a second form of authentication when signing in
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => setSettings(s => ({ ...s, enabled: checked }))}
          />
        </div>

        {settings.enabled && (
          <div className="space-y-3">
            <Label>Authentication Method</Label>
            <RadioGroup
              value={settings.method}
              onValueChange={(value: 'email' | 'authenticator') => 
                setSettings(s => ({ ...s, method: value }))
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="email" id="email" />
                <Label htmlFor="email">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="authenticator" id="authenticator" />
                <Label htmlFor="authenticator">Authenticator App</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        <Button 
          onClick={updateTwoFactorSettings} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            "Save 2FA Settings"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
