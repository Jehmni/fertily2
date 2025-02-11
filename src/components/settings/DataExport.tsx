
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const DataExport = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase.functions.invoke('export-data', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Create and download the file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fertility-data-export.json';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Your data has been exported successfully",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Your Data</CardTitle>
        <CardDescription>
          Download a copy of your fertility data and personal information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleExport} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Preparing Export...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Download className="h-4 w-4" />
              <span>Download My Data</span>
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
