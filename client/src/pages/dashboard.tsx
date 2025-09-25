import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/posts/post-card";
import AddContentModal from "@/components/modals/add-content-modal";
import { useState } from "react";
import type { StatsResponse, HealthResponse, RedditPost, QueueItem } from "@shared/schema";
import { 
  Download, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  Plus, 
  Play,
  ArrowUp,
  ArrowDown 
} from "lucide-react";

export default function Dashboard() {
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: stats } = useQuery<StatsResponse>({
    queryKey: ["/api/stats"],
  });

  const { data: posts = [] } = useQuery<RedditPost[]>({
    queryKey: ["/api/posts"],
    queryFn: () => fetch("/api/posts?limit=6").then(res => res.json()),
  });

  const { data: queueStatus } = useQuery<QueueItem[]>({
    queryKey: ["/api/queue"],
    queryFn: () => fetch("/api/queue?status=pending").then(res => res.json()),
  });

  const { data: health } = useQuery<HealthResponse>({
    queryKey: ["/api/health"],
  });

  const pendingPosts = queueStatus?.filter((item) => item.type === "post")?.length || 0;
  const pendingComments = queueStatus?.filter((item) => item.type === "comment")?.length || 0;
  const scheduledItems = queueStatus?.filter((item) => item.scheduledAt)?.length || 0;

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">Monitor your Reddit automation and AI content generation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Posts Fetched Today</p>
                <p className="text-xl md:text-3xl font-bold text-foreground" data-testid="stats-posts-today">
                  {stats?.postsToday || 0}
                </p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center ml-2">
                <Download className="h-4 w-4 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="flex items-center mt-3 md:mt-4 text-xs md:text-sm">
              <ArrowUp className="h-3 w-3 md:h-4 md:w-4 text-green-600 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-muted-foreground ml-1 md:ml-2 truncate">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Comments Generated</p>
                <p className="text-xl md:text-3xl font-bold text-foreground" data-testid="stats-comments-generated">
                  {stats?.commentsGenerated || 0}
                </p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center ml-2">
                <MessageSquare className="h-4 w-4 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="flex items-center mt-3 md:mt-4 text-xs md:text-sm">
              <ArrowUp className="h-3 w-3 md:h-4 md:w-4 text-green-600 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-muted-foreground ml-1 md:ml-2 truncate">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Queue Items</p>
                <p className="text-xl md:text-3xl font-bold text-foreground" data-testid="stats-queue-items">
                  {stats?.queueItems || 0}
                </p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center ml-2">
                <Clock className="h-4 w-4 md:h-6 md:w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="flex items-center mt-3 md:mt-4 text-xs md:text-sm">
              <ArrowDown className="h-3 w-3 md:h-4 md:w-4 text-red-600 mr-1" />
              <span className="text-red-600">-5%</span>
              <span className="text-muted-foreground ml-1 md:ml-2 truncate">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs md:text-sm text-muted-foreground truncate">Success Rate</p>
                <p className="text-xl md:text-3xl font-bold text-foreground" data-testid="stats-success-rate">
                  {stats?.successRate || 0}%
                </p>
              </div>
              <div className="w-8 h-8 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center ml-2">
                <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="flex items-center mt-3 md:mt-4 text-xs md:text-sm">
              <ArrowUp className="h-3 w-3 md:h-4 md:w-4 text-green-600 mr-1" />
              <span className="text-green-600">+2.1%</span>
              <span className="text-muted-foreground ml-1 md:ml-2 truncate">from yesterday</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Posts */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 md:p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg font-semibold text-foreground">Recent Trending Posts</h3>
                <Button variant="ghost" size="sm" className="text-xs md:text-sm" data-testid="button-view-all-posts">
                  View All
                </Button>
              </div>
            </div>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No posts fetched yet. Configure your Reddit credentials and fetch some posts!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} showGenerateButton />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Queue Status */}
        <div className="space-y-4 md:space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Quick Actions</h3>
              <div className="space-y-2 md:space-y-3">
                <Button 
                  className="w-full justify-start text-sm" 
                  onClick={() => setShowAddModal(true)}
                  data-testid="button-add-content"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Content
                </Button>
                <Button 
                  variant="secondary" 
                  className="w-full justify-start text-sm"
                  data-testid="button-fetch-posts"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Fetch New Posts
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm"
                  data-testid="button-run-automation"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Automation
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Queue Status */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-semibold text-foreground">Queue Status</h3>
                <span className="text-xs md:text-sm text-muted-foreground">Updated 5 min ago</span>
              </div>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">Pending Posts</span>
                  <span className="text-xs md:text-sm font-medium text-foreground" data-testid="queue-pending-posts">
                    {pendingPosts}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">Pending Comments</span>
                  <span className="text-xs md:text-sm font-medium text-foreground" data-testid="queue-pending-comments">
                    {pendingComments}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">Scheduled</span>
                  <span className="text-xs md:text-sm font-medium text-foreground" data-testid="queue-scheduled">
                    {scheduledItems}
                  </span>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Next Execution</span>
                    <span className="text-sm text-primary" data-testid="queue-next-execution">
                      in 15 minutes
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">System Health</h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reddit API</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      health?.redditApi === "Online" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <span className={`text-sm ${
                      health?.redditApi === "Online" ? "text-green-600" : "text-red-600"
                    }`} data-testid="health-reddit-api">
                      {health?.redditApi || "Not Configured"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gemini AI</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      health?.geminiAi === "Online" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <span className={`text-sm ${
                      health?.geminiAi === "Online" ? "text-green-600" : "text-red-600"
                    }`} data-testid="health-gemini-ai">
                      {health?.geminiAi || "Not Configured"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Queue System</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-green-600" data-testid="health-queue-system">
                      Running
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Automation</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      health?.automation === "Enabled" ? "bg-green-500" : "bg-yellow-500"
                    }`} />
                    <span className={`text-sm ${
                      health?.automation === "Enabled" ? "text-green-600" : "text-yellow-600"
                    }`} data-testid="health-automation">
                      {health?.automation || "Disabled"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddContentModal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
