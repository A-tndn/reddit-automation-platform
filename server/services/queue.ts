import { storage } from "../storage";
import { redditService } from "./reddit";

interface RedditCredentials {
  clientId: string;
  clientSecret: string;
  username?: string;
  password?: string;
}

class QueueProcessor {
  async processQueue(credentials: RedditCredentials): Promise<number> {
    try {
      const pendingItems = await storage.getQueueItems({ status: "pending", limit: 10 });
      let processedCount = 0;

      for (const item of pendingItems) {
        try {
          // Check if item is scheduled and not yet due
          if (item.scheduledAt && new Date(item.scheduledAt) > new Date()) {
            continue;
          }

          // Update status to processing
          await storage.updateQueueItem(item.id, { 
            status: "processing",
            processedAt: new Date(),
          });

          if (item.type === "post") {
            if (item.title && item.content) {
              const postUrl = await redditService.createPost(
                item.subreddit.replace("r/", ""),
                item.title,
                item.content,
                credentials
              );
              console.log(`Queue item ${item.id} posted successfully: ${postUrl}`);
            }
          } else if (item.type === "comment") {
            if (item.targetPostId && item.content) {
              await redditService.postComment(
                item.targetPostId,
                item.content,
                credentials
              );
            }
          }

          // Mark as completed
          await storage.updateQueueItem(item.id, { 
            status: "completed",
            processedAt: new Date(),
          });

          processedCount++;
        } catch (error) {
          console.error(`Error processing queue item ${item.id}:`, error);
          
          // Mark as failed
          await storage.updateQueueItem(item.id, { 
            status: "failed",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
            processedAt: new Date(),
          });
        }
      }

      return processedCount;
    } catch (error) {
      console.error("Error processing queue:", error);
      throw error;
    }
  }

  async scheduleAutomation(intervalMinutes: number, credentials: RedditCredentials): Promise<NodeJS.Timeout> {
    return setInterval(async () => {
      try {
        console.log("Running scheduled automation...");
        await this.processQueue(credentials);
      } catch (error) {
        console.error("Error in scheduled automation:", error);
      }
    }, intervalMinutes * 60 * 1000);
  }
}

export const queueProcessor = new QueueProcessor();
