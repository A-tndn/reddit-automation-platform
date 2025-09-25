import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const configurations = pgTable("configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  redditClientId: text("reddit_client_id"),
  redditClientSecret: text("reddit_client_secret"),
  redditUsername: text("reddit_username"),
  redditPassword: text("reddit_password"),
  geminiApiKey: text("gemini_api_key"),
  automationEnabled: boolean("automation_enabled").default(false),
  automationInterval: integer("automation_interval").default(30), // minutes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const redditPosts = pgTable("reddit_posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  redditId: text("reddit_id").notNull().unique(),
  title: text("title").notNull(),
  content: text("content"),
  subreddit: text("subreddit").notNull(),
  author: text("author").notNull(),
  upvotes: integer("upvotes").default(0),
  comments: integer("comments").default(0),
  awards: integer("awards").default(0),
  url: text("url"),
  postType: text("post_type").notNull(), // "trending", "hot", "rising"
  isTrending: boolean("is_trending").default(false),
  fetchedAt: timestamp("fetched_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const queueItems = pgTable("queue_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // "post" or "comment"
  title: text("title"),
  content: text("content").notNull(),
  subreddit: text("subreddit").notNull(),
  targetPostId: text("target_post_id"), // for comments
  priority: text("priority").notNull().default("normal"), // "normal", "high", "urgent"
  status: text("status").notNull().default("pending"), // "pending", "processing", "completed", "failed"
  scheduledAt: timestamp("scheduled_at"),
  processedAt: timestamp("processed_at"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"), // for additional data like AI generation params
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const generatedComments = pgTable("generated_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull(),
  content: text("content").notNull(),
  aiModel: text("ai_model").default("gemini-2.5-flash"),
  generatedAt: timestamp("generated_at").defaultNow(),
  isUsed: boolean("is_used").default(false),
  usedAt: timestamp("used_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertConfigurationSchema = createInsertSchema(configurations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRedditPostSchema = createInsertSchema(redditPosts).omit({
  id: true,
  fetchedAt: true,
  createdAt: true,
});

export const insertQueueItemSchema = createInsertSchema(queueItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  scheduledAt: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export const insertGeneratedCommentSchema = createInsertSchema(generatedComments).omit({
  id: true,
  generatedAt: true,
  usedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Configuration = typeof configurations.$inferSelect;
export type InsertConfiguration = z.infer<typeof insertConfigurationSchema>;

export type RedditPost = typeof redditPosts.$inferSelect;
export type InsertRedditPost = z.infer<typeof insertRedditPostSchema>;

export type QueueItem = typeof queueItems.$inferSelect;
export type InsertQueueItem = z.infer<typeof insertQueueItemSchema>;

export type GeneratedComment = typeof generatedComments.$inferSelect;
export type InsertGeneratedComment = z.infer<typeof insertGeneratedCommentSchema>;

// API Response Types
export interface StatsResponse {
  postsToday: number;
  commentsGenerated: number;
  queueItems: number;
  successRate: number;
}

export interface HealthResponse {
  redditApi: "Online" | "Not Configured";
  geminiAi: "Online" | "Not Configured";
  queueSystem: "Running";
  automation: "Enabled" | "Disabled";
}
