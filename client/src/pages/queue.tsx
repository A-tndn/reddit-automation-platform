import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import QueueItem from "@/components/queue/queue-item";
import AddContentModal from "@/components/modals/add-content-modal";
import { useState } from "react";
import { Plus, Play, Trash2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Queue() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const { toast } = useToast();

  const { data: queueItems = [], isLoading } = useQuery({
    queryKey: ["/api/queue", statusFilter, typeFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);
      
      return fetch(`/api/queue?${params.toString()}`).then(res => res.json());
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

  const deleteItemMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/queue/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/queue"] });
      toast({ title: "Item deleted successfully" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to delete item", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Content Queue</h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">Manage your scheduled posts and comments</p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:space-x-2 md:gap-0">
          <Button onClick={() => setShowAddModal(true)} data-testid="button-add-queue-item" className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Content
          </Button>
          <Button 
            onClick={() => processQueueMutation.mutate()}
            disabled={processQueueMutation.isPending}
            data-testid="button-process-queue"
            className="w-full md:w-auto"
          >
            <Play className="h-4 w-4 mr-2" />
            {processQueueMutation.isPending ? "Processing..." : "Process Queue"}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger data-testid="select-type-filter">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="post">Posts</SelectItem>
                <SelectItem value="comment">Comments</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setStatusFilter("");
                setTypeFilter("");
              }}
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Queue Items */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                <div className="h-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : queueItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">No queue items found</p>
              <p>Add some content to get started with automated posting</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {queueItems.map((item: any) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(item.priority)}>
                        {item.priority}
                      </Badge>
                      <Badge variant="outline">
                        {item.type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {item.subreddit}
                      </span>
                    </div>
                    
                    {item.title && (
                      <h4 className="font-medium text-foreground mb-2" data-testid={`queue-item-title-${item.id}`}>
                        {item.title}
                      </h4>
                    )}
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`queue-item-content-${item.id}`}>
                      {item.content}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                      {item.scheduledAt && (
                        <span>Scheduled: {new Date(item.scheduledAt).toLocaleString()}</span>
                      )}
                      {item.processedAt && (
                        <span>Processed: {new Date(item.processedAt).toLocaleString()}</span>
                      )}
                    </div>
                    
                    {item.errorMessage && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {item.errorMessage}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteItemMutation.mutate(item.id)}
                      disabled={deleteItemMutation.isPending}
                      data-testid={`button-delete-${item.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddContentModal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
