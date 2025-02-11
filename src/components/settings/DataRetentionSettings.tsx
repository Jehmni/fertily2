
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export const DataRetentionSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    retainActivityLogs: true,
    retainMessages: true,
    dataDeletionPeriod: 365,
  });

  useEffect(() => {
    loadRetentionSettings();
  }, []);

  const loadRetentionSettings = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('data_retention_preferences')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          retainActivityLogs: data.retain_activity_logs,
          retainMessages: data.retain_messages,
          dataDeletionPeriod: data.data_deletion_period,
        });
      }
    } catch (error) {
      console.error('Error loading retention settings:', error);
      toast({
        title: "Error",
        description: "Failed to load data retention settings",
        variant: "destructive",
      });
    }
  };

  const updateRetentionSettings = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { error } = await supabase
        .from('data_retention_preferences')
        .upsert({
          user_id: session.user.id,
          retain_activity_logs: settings.retainActivityLogs,
          retain_messages: settings.retainMessages,
          data_deletion_period: settings.dataDeletionPeriod,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Data retention settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating retention settings:', error);
      toast({
        title: "Error",
        description: "Failed to update data retention settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Retention Settings</CardTitle>
        <CardDescription>
          Configure how long we retain your data and what information is stored
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Retain Activity Logs</Label>
              <p className="text-sm text-muted-foreground">
                Keep records of your application usage
              </p>
            </div>
            <Switch
              checked={settings.retainActivityLogs}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, retainActivityLogs: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Retain Messages</Label>
              <p className="text-sm text-muted-foreground">
                Keep history of your messages and interactions
              </p>
            </div>
            <Switch
              checked={settings.retainMessages}
              onCheckedChange={(checked) => setSettings(s => ({ ...s, retainMessages: checked }))}
            />
          </div>

          <div className="space-y-3">
            <Label>Data Retention Period (days)</Label>
            <Slider
              value={[settings.dataDeletionPeriod]}
              onValueChange={([value]) => setSettings(s => ({ ...s, dataDeletionPeriod: value }))}
              min={30}
              max={730}
              step={30}
            />
            <p className="text-sm text-muted-foreground">
              Data will be automatically deleted after {settings.dataDeletionPeriod} days
            </p>
          </div>
        </div>

        <Button 
          onClick={updateRetentionSettings} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "Saving..." : "Save Retention Settings"}
        </Button>
      </CardContent>
    </Card>
  );
};
