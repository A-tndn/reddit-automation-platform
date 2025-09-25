import { type InsertRedditPost } from "@shared/schema";

interface RedditCredentials {
  clientId: string;
  clientSecret: string;
  username?: string;
  password?: string;
}

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  subreddit_name_prefixed: string;
  author: string;
  ups: number;
  num_comments: number;
  total_awards_received: number;
  url: string;
  created_utc: number;
}

interface RedditResponse {
  data: {
    children: Array<{ data: RedditPost }>;
  };
}

class RedditService {
  private async getAccessToken(credentials: RedditCredentials): Promise<string> {
    const auth = Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64');
    
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'RedditAI Bot 1.0',
      },
      body: credentials.username && credentials.password 
        ? `grant_type=password&username=${credentials.username}&password=${credentials.password}`
        : 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Failed to get Reddit access token: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  }

  private async fetchSubredditPosts(subreddit: string, sort: string, token: string): Promise<RedditPost[]> {
    const response = await fetch(`https://oauth.reddit.com/r/${subreddit}/${sort}?limit=25`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'RedditAI Bot 1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts from r/${subreddit}: ${response.statusText}`);
    }

    const data: RedditResponse = await response.json();
    return data.data.children.map(child => child.data);
  }

  async fetchTrendingPosts(subreddits: string[], credentials: RedditCredentials): Promise<InsertRedditPost[]> {
    try {
      const token = await this.getAccessToken(credentials);
      const allPosts: InsertRedditPost[] = [];

      for (const subreddit of subreddits) {
        try {
          // Fetch hot, trending, and rising posts
          const [hotPosts, risingPosts] = await Promise.all([
            this.fetchSubredditPosts(subreddit, 'hot', token),
            this.fetchSubredditPosts(subreddit, 'rising', token),
          ]);

          // Process hot posts
          for (const post of hotPosts.slice(0, 10)) {
            if (post.ups > 100) { // Only include posts with decent engagement
              allPosts.push({
                redditId: post.id,
                title: post.title,
                content: post.selftext || null,
                subreddit: `r/${subreddit}`,
                author: post.author,
                upvotes: post.ups,
                comments: post.num_comments,
                awards: post.total_awards_received,
                url: post.url,
                postType: "hot",
                isTrending: post.ups > 1000,
              });
            }
          }

          // Process rising posts
          for (const post of risingPosts.slice(0, 5)) {
            if (post.ups > 50) {
              allPosts.push({
                redditId: post.id,
                title: post.title,
                content: post.selftext || null,
                subreddit: `r/${subreddit}`,
                author: post.author,
                upvotes: post.ups,
                comments: post.num_comments,
                awards: post.total_awards_received,
                url: post.url,
                postType: "rising",
                isTrending: false,
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching posts from r/${subreddit}:`, error);
        }
      }

      return allPosts;
    } catch (error) {
      console.error('Error in fetchTrendingPosts:', error);
      throw error;
    }
  }

  async postComment(postId: string, comment: string, credentials: RedditCredentials): Promise<void> {
    try {
      const token = await this.getAccessToken(credentials);
      
      const response = await fetch('https://oauth.reddit.com/api/comment', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'RedditAI Bot 1.0',
        },
        body: `thing_id=t3_${postId}&text=${encodeURIComponent(comment)}`,
      });

      if (!response.ok) {
        throw new Error(`Failed to post comment: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      throw error;
    }
  }

  async createPost(subreddit: string, title: string, content: string, credentials: RedditCredentials): Promise<string> {
    try {
      const token = await this.getAccessToken(credentials);
      
      const response = await fetch('https://oauth.reddit.com/api/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'RedditAI Bot 1.0',
        },
        body: `sr=${subreddit}&kind=self&title=${encodeURIComponent(title)}&text=${encodeURIComponent(content)}`,
      });

      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.statusText}`);
      }

      const result = await response.json();
      const postUrl = result?.json?.data?.url || `https://reddit.com/r/${subreddit}`;
      console.log(`Successfully posted to Reddit: ${postUrl}`);
      
      return postUrl;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }
}

export const redditService = new RedditService();
