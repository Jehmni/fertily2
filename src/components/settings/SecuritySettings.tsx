
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export const SecuritySettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    twoFactorMethod: 'email',
  });

  useEffect(() => {
    loadSecuritySettings();
  }, []);

  const loadSecuritySettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          twoFactorEnabled: data.two_factor_enabled,
          twoFactorMethod: data.two_factor_method || 'email',
        });
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
      toast({
        title: "Error",
        description: "Failed to load security settings",
        variant: "destructive",
      });
    }
  };

  const updateSecuritySettings = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { error } = await supabase
        .from('user_security_settings')
        .upsert({
          user_id: session.user.id,
          two_factor_enabled: settings.twoFactorEnabled,
          two_factor_method: settings.twoFactorMethod,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Security settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating security settings:', error);
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Configure your account security preferences and two-factor authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch
            checked={settings.twoFactorEnabled}
            onCheckedChange={(checked) => setSettings(s => ({ ...s, twoFactorEnabled: checked }))}
          />
        </div>

        {settings.twoFactorEnabled && (
          <div className="space-y-3">
            <Label>Authentication Method</Label>
            <RadioGroup
              value={settings.twoFactorMethod}
              onValueChange={(value) => setSettings(s => ({ ...s, twoFactorMethod: value }))}
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
          onClick={updateSecuritySettings} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Saving..." : "Save Security Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};
