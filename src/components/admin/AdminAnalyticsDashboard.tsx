import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/lib/supabase";
import { format, subDays } from "date-fns";
import { AlertCircle, ArrowUpRight, Users, Activity, Calendar } from "lucide-react";
import { UserRoleManagement } from "./UserRoleManagement";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { DashboardErrorBoundary } from "./DashboardErrorBoundary";
import { useQuery, useQueries } from "@tanstack/react-query";
import { useMediaQuery } from "@/hooks/useMediaQuery";

type DailyMetric = {
  date: string;
  event_type: string;
  event_count: number;
  unique_users: number;
};

type FeatureUsage = {
  event_name: string;
  usage_count: number;
  unique_users: number;
  last_used_at: string;
};

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

const fetchDailyMetrics = async () => {
  const { data, error } = await supabase
    .from('analytics_daily_metrics')
    .select('*')
    .gte('date', format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  
  if (error) throw error;
  return data;
};

const fetchFeatureUsage = async () => {
  const { data, error } = await supabase
    .from('feature_usage_summary')
    .select('*')
    .order('usage_count', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const AdminAnalyticsDashboard = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const queries = useQueries({
    queries: [
      {
        queryKey: ['daily-metrics'],
        queryFn: fetchDailyMetrics,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      {
        queryKey: ['feature-usage'],
        queryFn: fetchFeatureUsage,
        staleTime: 5 * 60 * 1000,
      },
    ],
  });

  const isLoading = queries.some(query => query.isLoading);
  const isError = queries.some(query => query.isError);
  const [dailyMetrics, featureUsage] = queries.map(query => query.data ?? []);

  const stats = useMemo(() => ({
    totalUsers: featureUsage.reduce((max, curr) => Math.max(max, curr.unique_users), 0),
    totalEvents: dailyMetrics.reduce((sum, curr) => sum + curr.event_count, 0),
    activeFeatures: featureUsage.length,
  }), [dailyMetrics, featureUsage]);

  if (isLoading) return <DashboardSkeleton />;

  const chartHeight = isMobile ? 300 : 400;
  const chartWidth = isMobile ? "100%" : undefined;

  return (
    <DashboardErrorBoundary>
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
          />
          <MetricCard
            title="Total Events"
            value={stats.totalEvents}
            icon={Activity}
          />
          <MetricCard
            title="Active Features"
            value={stats.activeFeatures}
            icon={Calendar}
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Feature Usage</TabsTrigger>
            <TabsTrigger value="events">Event Types</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ChartCard
              title="Daily User Activity"
              description="User engagement over the last 30 days"
              height={chartHeight}
            >
              <ResponsiveContainer width={chartWidth} height="100%">
                <LineChart data={dailyMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                    angle={isMobile ? -45 : 0}
                    textAnchor={isMobile ? "end" : "middle"}
                    height={isMobile ? 60 : 30}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="unique_users" 
                    stroke="#8884d8" 
                    name="Unique Users"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="event_count" 
                    stroke="#82ca9d" 
                    name="Total Events"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>

          <TabsContent value="features">
            <ChartCard
              title="Feature Usage Distribution"
              description="Most used features in the application"
              height={chartHeight}
            >
              <ResponsiveContainer width={chartWidth} height="100%">
                <BarChart data={featureUsage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="event_name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="usage_count" fill="#8884d8" name="Usage Count" />
                  <Bar dataKey="unique_users" fill="#82ca9d" name="Unique Users" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>

          <TabsContent value="events">
            <ChartCard
              title="Event Type Distribution"
              description="Breakdown of different event types"
              height={chartHeight}
            >
              <ResponsiveContainer width={chartWidth} height="100%">
                <PieChart>
                  <Pie
                    data={dailyMetrics}
                    dataKey="event_count"
                    nameKey="event_type"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label
                  >
                    {dailyMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>

          <TabsContent value="users">
            <UserRoleManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardErrorBoundary>
  );
};

const MetricCard = ({ title, value, icon: Icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
    </CardContent>
  </Card>
);

const ChartCard = ({ title, description, children, height }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent style={{ height }}>{children}</CardContent>
  </Card>
);
