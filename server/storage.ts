import { type User, type InsertUser, type Configuration, type InsertConfiguration, type RedditPost, type InsertRedditPost, type QueueItem, type InsertQueueItem, type GeneratedComment, type InsertGeneratedComment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Configuration methods
  getConfiguration(userId: string): Promise<Configuration | undefined>;
  createConfiguration(config: InsertConfiguration): Promise<Configuration>;
  updateConfiguration(userId: string, config: Partial<InsertConfiguration>): Promise<Configuration | undefined>;

  // Reddit posts methods
  getRedditPosts(options?: { limit?: number; subreddit?: string; type?: string }): Promise<RedditPost[]>;
  getRedditPost(id: string): Promise<RedditPost | undefined>;
  getRedditPostByRedditId(redditId: string): Promise<RedditPost | undefined>;
  createRedditPost(post: InsertRedditPost): Promise<RedditPost>;
  updateRedditPost(id: string, post: Partial<InsertRedditPost>): Promise<RedditPost | undefined>;

  // Queue methods
  getQueueItems(options?: { status?: string; type?: string; limit?: number }): Promise<QueueItem[]>;
  getQueueItem(id: string): Promise<QueueItem | undefined>;
  createQueueItem(item: InsertQueueItem): Promise<QueueItem>;
  updateQueueItem(id: string, item: Partial<InsertQueueItem>): Promise<QueueItem | undefined>;
  deleteQueueItem(id: string): Promise<boolean>;

  // Generated comments methods
  getGeneratedComments(postId: string): Promise<GeneratedComment[]>;
  createGeneratedComment(comment: InsertGeneratedComment): Promise<GeneratedComment>;
  markCommentAsUsed(id: string): Promise<void>;

  // Manual post creation for testing
  createRedditPostManually(post: InsertRedditPost): Promise<RedditPost>;

  // Stats methods
  getStats(): Promise<{
    postsToday: number;
    commentsGenerated: number;
    queueItems: number;
    successRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private configurations: Map<string, Configuration>;
  private redditPosts: Map<string, RedditPost>;
  private queueItems: Map<string, QueueItem>;
  private generatedComments: Map<string, GeneratedComment>;

  constructor() {
    this.users = new Map();
    this.configurations = new Map();
    this.redditPosts = new Map();
    this.queueItems = new Map();
    this.generatedComments = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getConfiguration(userId: string): Promise<Configuration | undefined> {
    return Array.from(this.configurations.values()).find(config => config.userId === userId);
  }

  async createConfiguration(insertConfig: InsertConfiguration): Promise<Configuration> {
    const id = randomUUID();
    const now = new Date();
    const config: Configuration = {
      ...insertConfig,
      id,
      createdAt: now,
      updatedAt: now,
      redditClientId: insertConfig.redditClientId || null,
      redditClientSecret: insertConfig.redditClientSecret || null,
      redditUsername: insertConfig.redditUsername || null,
      redditPassword: insertConfig.redditPassword || null,
      geminiApiKey: insertConfig.geminiApiKey || null,
      automationEnabled: insertConfig.automationEnabled || false,
      automationInterval: insertConfig.automationInterval || 30,
    };
    this.configurations.set(id, config);
    return config;
  }

  async updateConfiguration(userId: string, updateConfig: Partial<InsertConfiguration>): Promise<Configuration | undefined> {
    const existing = await this.getConfiguration(userId);
    if (!existing) return undefined;

    const updated: Configuration = {
      ...existing,
      ...updateConfig,
      updatedAt: new Date(),
    };
    this.configurations.set(existing.id, updated);
    return updated;
  }

  async getRedditPosts(options: { limit?: number; subreddit?: string; type?: string } = {}): Promise<RedditPost[]> {
    let posts = Array.from(this.redditPosts.values());
    
    if (options.subreddit) {
      posts = posts.filter(post => post.subreddit === options.subreddit);
    }
    
    if (options.type) {
      posts = posts.filter(post => post.postType === options.type);
    }

    posts.sort((a, b) => (b.fetchedAt?.getTime() || 0) - (a.fetchedAt?.getTime() || 0));
    
    if (options.limit) {
      posts = posts.slice(0, options.limit);
    }
    
    return posts;
  }

  async getRedditPost(id: string): Promise<RedditPost | undefined> {
    return this.redditPosts.get(id);
  }

  async getRedditPostByRedditId(redditId: string): Promise<RedditPost | undefined> {
    return Array.from(this.redditPosts.values()).find(post => post.redditId === redditId);
  }

  async createRedditPost(insertPost: InsertRedditPost): Promise<RedditPost> {
    const id = randomUUID();
    const now = new Date();
    const post: RedditPost = {
      ...insertPost,
      id,
      fetchedAt: now,
      createdAt: now,
      content: insertPost.content || null,
      url: insertPost.url || null,
      upvotes: insertPost.upvotes || 0,
      comments: insertPost.comments || 0,
      awards: insertPost.awards || 0,
      isTrending: insertPost.isTrending || false,
    };
    this.redditPosts.set(id, post);
    return post;
  }

  async updateRedditPost(id: string, updatePost: Partial<InsertRedditPost>): Promise<RedditPost | undefined> {
    const existing = this.redditPosts.get(id);
    if (!existing) return undefined;

    const updated: RedditPost = { ...existing, ...updatePost };
    this.redditPosts.set(id, updated);
    return updated;
  }

  async getQueueItems(options: { status?: string; type?: string; limit?: number } = {}): Promise<QueueItem[]> {
    let items = Array.from(this.queueItems.values());
    
    if (options.status) {
      items = items.filter(item => item.status === options.status);
    }
    
    if (options.type) {
      items = items.filter(item => item.type === options.type);
    }

    items.sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
    
    if (options.limit) {
      items = items.slice(0, options.limit);
    }
    
    return items;
  }

  async getQueueItem(id: string): Promise<QueueItem | undefined> {
    return this.queueItems.get(id);
  }

  async createQueueItem(insertItem: InsertQueueItem): Promise<QueueItem> {
    const id = randomUUID();
    const now = new Date();
    const item: QueueItem = {
      ...insertItem,
      id,
      createdAt: now,
      updatedAt: now,
      title: insertItem.title || null,
      targetPostId: insertItem.targetPostId || null,
      scheduledAt: insertItem.scheduledAt || null,
      processedAt: null,
      errorMessage: null,
      metadata: insertItem.metadata || null,
      status: insertItem.status || "pending",
      priority: insertItem.priority || "normal",
    };
    this.queueItems.set(id, item);
    return item;
  }

  async updateQueueItem(id: string, updateItem: Partial<InsertQueueItem>): Promise<QueueItem | undefined> {
    const existing = this.queueItems.get(id);
    if (!existing) return undefined;

    const updated: QueueItem = {
      ...existing,
      ...updateItem,
      updatedAt: new Date(),
    };
    this.queueItems.set(id, updated);
    return updated;
  }

  async deleteQueueItem(id: string): Promise<boolean> {
    return this.queueItems.delete(id);
  }

  async getGeneratedComments(postId: string): Promise<GeneratedComment[]> {
    return Array.from(this.generatedComments.values()).filter(comment => comment.postId === postId);
  }

  async createGeneratedComment(insertComment: InsertGeneratedComment): Promise<GeneratedComment> {
    const id = randomUUID();
    const comment: GeneratedComment = {
      ...insertComment,
      id,
      generatedAt: new Date(),
      isUsed: false,
      usedAt: null,
      aiModel: insertComment.aiModel || "gemini-2.5-flash",
    };
    this.generatedComments.set(id, comment);
    return comment;
  }

  async markCommentAsUsed(id: string): Promise<void> {
    const comment = this.generatedComments.get(id);
    if (comment) {
      const updated: GeneratedComment = {
        ...comment,
        isUsed: true,
        usedAt: new Date(),
      };
      this.generatedComments.set(id, updated);
    }
  }

  async createRedditPostManually(insertPost: InsertRedditPost): Promise<RedditPost> {
    const id = randomUUID();
    const now = new Date();
    const post: RedditPost = {
      ...insertPost,
      id,
      fetchedAt: now,
      createdAt: now,
      content: insertPost.content || null,
      url: insertPost.url || null,
      upvotes: insertPost.upvotes || 0,
      comments: insertPost.comments || 0,
      awards: insertPost.awards || 0,
      isTrending: insertPost.isTrending || false,
    };
    this.redditPosts.set(id, post);
    return post;
  }

  async getStats(): Promise<{
    postsToday: number;
    commentsGenerated: number;
    queueItems: number;
    successRate: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const postsToday = Array.from(this.redditPosts.values()).filter(
      post => post.fetchedAt && post.fetchedAt >= today
    ).length;
    
    const commentsGenerated = Array.from(this.generatedComments.values()).filter(
      comment => comment.generatedAt && comment.generatedAt >= today
    ).length;
    
    const queueItems = Array.from(this.queueItems.values()).filter(
      item => item.status === "pending"
    ).length;
    
    const totalProcessed = Array.from(this.queueItems.values()).filter(
      item => item.status === "completed" || item.status === "failed"
    ).length;
    
    const completed = Array.from(this.queueItems.values()).filter(
      item => item.status === "completed"
    ).length;
    
    const successRate = totalProcessed > 0 ? (completed / totalProcessed) * 100 : 0;
    
    return {
      postsToday,
      commentsGenerated,
      queueItems,
      successRate: Math.round(successRate * 10) / 10,
    };
  }
}

export const storage = new MemStorage();
