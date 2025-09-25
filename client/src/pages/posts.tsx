import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PostCard from "@/components/posts/post-card";
import { useState } from "react";
import { Search, Download, Filter } from "lucide-react";

export default function Posts() {
  const [search, setSearch] = useState("");
  const [subredditFilter, setSubredditFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/posts", subredditFilter, typeFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (subredditFilter) params.set("subreddit", subredditFilter);
      if (typeFilter) params.set("type", typeFilter);
      
      return fetch(`/api/posts?${params.toString()}`).then(res => res.json());
    },
  });

  const filteredPosts = posts.filter((post: any) =>
    post.title.toLowerCase().includes(search.toLowerCase()) ||
    post.subreddit.toLowerCase().includes(search.toLowerCase())
  );

  const handleFetchPosts = async () => {
    try {
      const response = await fetch("/api/posts/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subreddits: ["technology", "programming", "artificial"] }),
      });
      
      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  const uniqueSubreddits = Array.from(new Set(posts.map((post: any) => post.subreddit)));

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Fetched Posts</h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">Browse and manage posts fetched from Reddit</p>
        </div>
        <Button onClick={handleFetchPosts} data-testid="button-fetch-posts" className="w-full md:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Fetch New Posts
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="input-search-posts"
              />
            </div>
            
            <Select value={subredditFilter} onValueChange={setSubredditFilter}>
              <SelectTrigger data-testid="select-subreddit-filter">
                <SelectValue placeholder="All subreddits" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All subreddits</SelectItem>
                {uniqueSubreddits.map((subreddit: string) => (
                  <SelectItem key={subreddit} value={subreddit}>
                    {subreddit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger data-testid="select-type-filter">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="rising">Rising</SelectItem>
                <SelectItem value="trending">Trending</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearch("");
                setSubredditFilter("");
                setTypeFilter("");
              }}
              data-testid="button-clear-filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mb-4" />
                <div className="h-20 bg-muted rounded mb-4" />
                <div className="flex space-x-4">
                  <div className="h-3 bg-muted rounded w-16" />
                  <div className="h-3 bg-muted rounded w-16" />
                  <div className="h-3 bg-muted rounded w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">No posts found</p>
              <p>Try adjusting your filters or fetch some posts from Reddit</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post: any) => (
            <PostCard key={post.id} post={post} showGenerateButton />
          ))}
        </div>
      )}
    </div>
  );
}
