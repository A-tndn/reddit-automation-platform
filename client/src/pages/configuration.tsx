import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { Key, User, Bot, AlertCircle, CheckCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Configuration() {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    redditClientId: "",
    redditClientSecret: "",
    redditUsername: "",
    redditPassword: "",
    geminiApiKey: "",
    automationEnabled: false,
    automationInterval: 30,
  });

  const { data: currentConfig, isLoading } = useQuery({
    queryKey: ["/api/config"],
  });

  const { data: health } = useQuery({
    queryKey: ["/api/health"],
  });

  useEffect(() => {
    if (currentConfig) {
      setConfig({
        redditClientId: currentConfig.redditClientId || "",
        redditClientSecret: currentConfig.redditClientSecret || "",
        redditUsername: currentConfig.redditUsername || "",
        redditPassword: currentConfig.redditPassword || "",
        geminiApiKey: currentConfig.geminiApiKey || "",
        automationEnabled: currentConfig.automationEnabled || false,
        automationInterval: currentConfig.automationInterval || 30,
      });
    }
  }, [currentConfig]);

  const updateConfigMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/config", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/config"] });
      queryClient.invalidateQueries({ queryKey: ["/api/health"] });
      toast({ title: "Configuration saved successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to save configuration", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSave = () => {
    updateConfigMutation.mutate(config);
  };

  const handleInputChange = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const getHealthIcon = (status: string) => {
    if (status === "Online" || status === "Enabled" || status === "Running") {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-2" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Configuration</h2>
        <p className="text-muted-foreground mt-2">Configure your Reddit and AI API credentials</p>
      </div>

      {/* Health Status */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              {getHealthIcon(health?.redditApi)}
              <span>Reddit API: {health?.redditApi || "Not Configured"}</span>
            </div>
            <div className="flex items-center space-x-2">
              {getHealthIcon(health?.geminiAi)}
              <span>Gemini AI: {health?.geminiAi || "Not Configured"}</span>
            </div>
            <div className="flex items-center space-x-2">
              {getHealthIcon(health?.automation)}
              <span>Automation: {health?.automation || "Disabled"}</span>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Reddit Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Reddit API Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reddit-client-id">Client ID</Label>
              <Input
                id="reddit-client-id"
                type="password"
                placeholder="Your Reddit app client ID"
                value={config.redditClientId}
                onChange={(e) => handleInputChange("redditClientId", e.target.value)}
                data-testid="input-reddit-client-id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reddit-client-secret">Client Secret</Label>
              <Input
                id="reddit-client-secret"
                type="password"
                placeholder="Your Reddit app client secret"
                value={config.redditClientSecret}
                onChange={(e) => handleInputChange("redditClientSecret", e.target.value)}
                data-testid="input-reddit-client-secret"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reddit-username">Reddit Username</Label>
              <Input
                id="reddit-username"
                placeholder="Your Reddit username"
                value={config.redditUsername}
                onChange={(e) => handleInputChange("redditUsername", e.target.value)}
                data-testid="input-reddit-username"
              />
              <p className="text-sm text-muted-foreground">
                Optional: For posting capabilities
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reddit-password">Reddit Password</Label>
              <Input
                id="reddit-password"
                type="password"
                placeholder="Your Reddit password"
                value={config.redditPassword}
                onChange={(e) => handleInputChange("redditPassword", e.target.value)}
                data-testid="input-reddit-password"
              />
              <p className="text-sm text-muted-foreground">
                Optional: For posting capabilities
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gemini AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>Gemini AI Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gemini-api-key">Gemini API Key</Label>
            <Input
              id="gemini-api-key"
              type="password"
              placeholder="Your Gemini API key"
              value={config.geminiApiKey}
              onChange={(e) => handleInputChange("geminiApiKey", e.target.value)}
              data-testid="input-gemini-api-key"
            />
            <p className="text-sm text-muted-foreground">
              Get your API key from the Google AI Studio
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Automation Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={config.automationEnabled}
              onCheckedChange={(checked) => handleInputChange("automationEnabled", checked)}
              data-testid="switch-automation-enabled"
            />
            <Label>Enable Automated Processing</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="automation-interval">Processing Interval (minutes)</Label>
            <Input
              id="automation-interval"
              type="number"
              min={5}
              max={1440}
              value={config.automationInterval}
              onChange={(e) => handleInputChange("automationInterval", parseInt(e.target.value))}
              data-testid="input-automation-interval"
            />
            <p className="text-sm text-muted-foreground">
              How often to automatically process the queue (5-1440 minutes)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Reddit API Setup:</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Go to <a href="https://www.reddit.com/prefs/apps" target="_blank" className="text-primary hover:underline">reddit.com/prefs/apps</a></li>
              <li>Click "Create App" or "Create Another App"</li>
              <li>Choose "script" as the app type</li>
              <li>Copy the client ID (under the app name) and client secret</li>
              <li>Add your Reddit username and password for posting capabilities</li>
            </ol>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Gemini AI Setup:</h4>
            <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
              <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-primary hover:underline">Google AI Studio</a></li>
              <li>Sign in with your Google account</li>
              <li>Click "Create API Key"</li>
              <li>Copy the generated API key</li>
              <li>Paste it in the Gemini API Key field above</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={updateConfigMutation.isPending}
          size="lg"
          data-testid="button-save-configuration"
        >
          {updateConfigMutation.isPending ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
