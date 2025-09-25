import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { redditService } from "./services/reddit";
import { generateComment } from "./services/gemini";
import { queueProcessor } from "./services/queue";
import { insertQueueItemSchema, insertConfigurationSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configuration routes
  app.get("/api/config", async (req, res) => {
    try {
      const config = await storage.getConfiguration("default");
      res.json(config || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch configuration" });
    }
  });

  app.post("/api/config", async (req, res) => {
    try {
      const validatedConfig = insertConfigurationSchema.parse({
        ...req.body,
        userId: "default",
      });
      
      const existing = await storage.getConfiguration("default");
      let config;
      
      if (existing) {
        config = await storage.updateConfiguration("default", validatedConfig);
      } else {
        config = await storage.createConfiguration(validatedConfig);
      }
      
      res.json(config);
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration data" });
    }
  });

  // Reddit posts routes
  app.get("/api/posts", async (req, res) => {
    try {
      const { limit, subreddit, type } = req.query;
      const posts = await storage.getRedditPosts({
        limit: limit ? parseInt(limit as string) : undefined,
        subreddit: subreddit as string,
        type: type as string,
      });
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  // Temporary route for testing - create a sample post manually
  app.post("/api/posts/create-sample", async (req, res) => {
    try {
      const samplePost = await storage.createRedditPostManually({
        redditId: "test123",
        title: "The Future of AI in Software Development",
        content: "Artificial intelligence is revolutionizing how we write and maintain code. From automated testing to code generation, AI tools are becoming essential for developers.",
        subreddit: "r/technology",
        author: "test_user",
        upvotes: 1250,
        comments: 45,
        awards: 3,
        url: "https://reddit.com/r/technology/test123",
        postType: "hot",
        isTrending: true,
      });
      
      res.json(samplePost);
    } catch (error) {
      console.error("Error creating sample post:", error);
      res.status(500).json({ error: "Failed to create sample post" });
    }
  });

  app.post("/api/posts/fetch", async (req, res) => {
    try {
      // Use environment variables directly from Replit secrets
      const redditClientId = process.env.REDDIT_CLIENT_ID;
      const redditClientSecret = process.env.REDDIT_CLIENT_SECRET;
      const redditUsername = process.env.REDDIT_USERNAME;
      const redditPassword = process.env.REDDIT_PASSWORD;
      
      if (!redditClientId || !redditClientSecret) {
        return res.status(400).json({ error: "Reddit credentials not configured in environment" });
      }

      const { subreddits = ["technology", "programming", "artificial"] } = req.body;
      
      const newPosts = await redditService.fetchTrendingPosts(subreddits, {
        clientId: redditClientId,
        clientSecret: redditClientSecret,
        username: redditUsername || undefined,
        password: redditPassword || undefined,
      });
      
      for (const post of newPosts) {
        const existing = await storage.getRedditPostByRedditId(post.redditId);
        if (!existing) {
          await storage.createRedditPost(post);
        }
      }
      
      res.json({ message: `Fetched ${newPosts.length} new posts`, count: newPosts.length });
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts from Reddit" });
    }
  });

  app.post("/api/posts/:id/generate-comment", async (req, res) => {
    try {
      // Use environment variable directly from Replit secrets
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey) {
        return res.status(400).json({ error: "Gemini API key not configured in environment" });
      }

      const post = await storage.getRedditPost(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }

      const comment = await generateComment(post.title, post.content || "", geminiApiKey);
      
      const generatedComment = await storage.createGeneratedComment({
        postId: post.id,
        content: comment,
        aiModel: "gemini-2.5-flash",
      });

      res.json(generatedComment);
    } catch (error) {
      console.error("Error generating comment:", error);
      res.status(500).json({ error: "Failed to generate comment" });
    }
  });

  // Queue routes
  app.get("/api/queue", async (req, res) => {
    try {
      const { status, type, limit } = req.query;
      const items = await storage.getQueueItems({
        status: status as string,
        type: type as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch queue items" });
    }
  });

  app.post("/api/queue", async (req, res) => {
    try {
      const validatedItem = insertQueueItemSchema.parse(req.body);
      const item = await storage.createQueueItem(validatedItem);
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: "Invalid queue item data" });
    }
  });

  app.put("/api/queue/:id", async (req, res) => {
    try {
      const updates = req.body;
      const item = await storage.updateQueueItem(req.params.id, updates);
      if (!item) {
        return res.status(404).json({ error: "Queue item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update queue item" });
    }
  });

  app.delete("/api/queue/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteQueueItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Queue item not found" });
      }
      res.json({ message: "Queue item deleted" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete queue item" });
    }
  });

  app.post("/api/queue/process", async (req, res) => {
    try {
      // Use environment variables directly from Replit secrets
      const redditClientId = process.env.REDDIT_CLIENT_ID;
      const redditClientSecret = process.env.REDDIT_CLIENT_SECRET;
      const redditUsername = process.env.REDDIT_USERNAME;
      const redditPassword = process.env.REDDIT_PASSWORD;
      
      if (!redditClientId || !redditClientSecret) {
        return res.status(400).json({ error: "Reddit credentials not configured in environment" });
      }

      const processed = await queueProcessor.processQueue({
        clientId: redditClientId,
        clientSecret: redditClientSecret,
        username: redditUsername || undefined,
        password: redditPassword || undefined,
      });

      res.json({ message: `Processed ${processed} queue items`, count: processed });
    } catch (error) {
      console.error("Error processing queue:", error);
      res.status(500).json({ error: "Failed to process queue" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Health check route
  app.get("/api/health", async (req, res) => {
    try {
      // Check environment variables directly
      const redditClientId = process.env.REDDIT_CLIENT_ID;
      const redditClientSecret = process.env.REDDIT_CLIENT_SECRET;
      const geminiApiKey = process.env.GEMINI_API_KEY;
      
      const health = {
        redditApi: redditClientId && redditClientSecret ? "Online" : "Not Configured",
        geminiAi: geminiApiKey ? "Online" : "Not Configured",
        queueSystem: "Running",
        automation: "Manual", // Since we're using direct API calls instead of config
      };
      
      res.json(health);
    } catch (error) {
      res.status(500).json({ error: "Failed to check health" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
