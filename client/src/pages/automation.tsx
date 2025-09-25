import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Play, Pause, Settings, Activity } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Automation() {
  const { toast } = useToast();
  const [automationEnabled, setAutomationEnabled] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(30);
  const [maxPostsPerRun, setMaxPostsPerRun] = useState(5);
  const [targetSubreddits, setTargetSubreddits] = useState("technology,programming,artificial");

  const { data: config } = useQuery({
    queryKey: ["/api/config"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const updateConfigMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/config", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      toast({ title: "Automation settings updated successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update settings", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const processQueueMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/queue/process"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/queue"] });
      toast({ title: "Queue processed successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to process queue", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const fetchPostsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/posts/fetch", { 
      subreddits: targetSubreddits.split(",").map(s => s.trim())
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({ title: "Posts fetched successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to fetch posts", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSaveSettings = () => {
    updateConfigMutation.mutate({
      automationEnabled,
      automationInterval: intervalMinutes,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Automation Settings</h2>
        <p className="text-muted-foreground mt-2">Configure automated content fetching and posting</p>
      </div>

      {/* Automation Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Automation Status</p>
                <p className="text-lg font-semibold text-foreground" data-testid="automation-status">
                  {config?.automationEnabled ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Run Interval</p>
                <p className="text-lg font-semibold text-foreground" data-testid="automation-interval">
                  {config?.automationInterval || 30} minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-lg font-semibold text-foreground" data-testid="automation-success-rate">
                  {stats?.successRate || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Switch
              checked={automationEnabled}
              onCheckedChange={setAutomationEnabled}
              data-testid="switch-automation-enabled"
            />
            <Label htmlFor="automation-enabled">Enable Automated Processing</Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="interval">Processing Interval (minutes)</Label>
              <Input
                id="interval"
                type="number"
                value={intervalMinutes}
                onChange={(e) => setIntervalMinutes(parseInt(e.target.value))}
                min={5}
                max={1440}
                data-testid="input-automation-interval"
              />
              <p className="text-sm text-muted-foreground">
                How often to process the queue (5-1440 minutes)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-posts">Max Posts per Run</Label>
              <Input
                id="max-posts"
                type="number"
                value={maxPostsPerRun}
                onChange={(e) => setMaxPostsPerRun(parseInt(e.target.value))}
                min={1}
                max={50}
                data-testid="input-max-posts-per-run"
              />
              <p className="text-sm text-muted-foreground">
                Maximum number of items to process per run
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subreddits">Target Subreddits</Label>
            <Input
              id="subreddits"
              value={targetSubreddits}
              onChange={(e) => setTargetSubreddits(e.target.value)}
              placeholder="technology,programming,artificial"
              data-testid="input-target-subreddits"
            />
            <p className="text-sm text-muted-foreground">
              Comma-separated list of subreddits to monitor
            </p>
          </div>

          <Button 
            onClick={handleSaveSettings}
            disabled={updateConfigMutation.isPending}
            data-testid="button-save-settings"
          >
            {updateConfigMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </CardContent>
      </Card>

      {/* Manual Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => fetchPostsMutation.mutate()}
              disabled={fetchPostsMutation.isPending}
              className="w-full"
              data-testid="button-manual-fetch"
            >
              {fetchPostsMutation.isPending ? "Fetching..." : "Fetch New Posts"}
            </Button>
            
            <Button
              onClick={() => processQueueMutation.mutate()}
              disabled={processQueueMutation.isPending}
              variant="outline"
              className="w-full"
              data-testid="button-manual-process"
            >
              {processQueueMutation.isPending ? "Processing..." : "Process Queue Now"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-muted-foreground">5 minutes ago</span>
              <span className="text-foreground">Processed 3 queue items successfully</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-muted-foreground">15 minutes ago</span>
              <span className="text-foreground">Fetched 12 new posts from r/technology</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-muted-foreground">30 minutes ago</span>
              <span className="text-foreground">Generated 5 AI comments for trending posts</span>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-muted-foreground">1 hour ago</span>
              <span className="text-foreground">Posted comment on r/programming</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
