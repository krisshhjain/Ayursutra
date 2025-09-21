import dotenv from 'dotenv';
import mongoose from 'mongoose';
import NotificationService from '../services/NotificationService.js';
import connectDB from '../config/database.js';

// Load environment variables
dotenv.config();

class NotificationScheduler {
  constructor() {
    this.notificationService = new NotificationService();
    this.isRunning = false;
    this.intervalId = null;
  }

  async start(intervalMinutes = 5) {
    if (this.isRunning) {
      console.log('📅 Notification scheduler is already running');
      return;
    }

    console.log(`📅 Starting notification scheduler (checking every ${intervalMinutes} minutes)`);
    this.isRunning = true;

    // Connect to database
    await connectDB();

    // Run immediately on start
    await this.processDueNotifications();

    // Set up recurring processing
    this.intervalId = setInterval(async () => {
      await this.processDueNotifications();
    }, intervalMinutes * 60 * 1000);
  }

  async stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping notification scheduler');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Close database connection
    await mongoose.disconnect();
  }

  async processDueNotifications() {
    try {
      const startTime = Date.now();
      console.log(`\n⏰ [${new Date().toISOString()}] Processing due notifications...`);

      // Get due notifications
      const result = await this.notificationService.getDueNotifications();
      
      if (!result.success) {
        console.error('❌ Failed to get due notifications:', result.error);
        return;
      }

      const notifications = result.notifications;
      
      if (notifications.length === 0) {
        console.log('✅ No due notifications to process');
        return;
      }

      console.log(`📨 Found ${notifications.length} due notifications`);

      let processed = 0;
      let failed = 0;
      const results = [];

      // Process each notification
      for (const notification of notifications) {
        try {
          console.log(`📬 Processing notification ${notification._id} (${notification.templateId})`);
          
          const processResult = await this.notificationService.processNotification(notification);
          
          if (processResult.success) {
            processed++;
            console.log(`✅ Successfully processed notification ${notification._id}`);
            
            // Log channel results
            if (processResult.results) {
              processResult.results.forEach(channelResult => {
                console.log(`   📱 ${channelResult.channel}: ${channelResult.success ? '✅' : '❌'} ${channelResult.message || ''}`);
              });
            }
          } else {
            failed++;
            console.error(`❌ Failed to process notification ${notification._id}:`, processResult.error);
          }

          results.push({
            notificationId: notification._id,
            templateId: notification.templateId,
            success: processResult.success,
            error: processResult.error
          });

        } catch (error) {
          failed++;
          console.error(`❌ Exception processing notification ${notification._id}:`, error.message);
          
          results.push({
            notificationId: notification._id,
            templateId: notification.templateId,
            success: false,
            error: error.message
          });
        }
      }

      const duration = Date.now() - startTime;
      console.log(`\n📊 Processing complete in ${duration}ms:`);
      console.log(`   ✅ Processed: ${processed}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log(`   📈 Total: ${notifications.length}`);

      // Log summary by template type
      const templateStats = {};
      results.forEach(result => {
        if (!templateStats[result.templateId]) {
          templateStats[result.templateId] = { success: 0, failed: 0 };
        }
        if (result.success) {
          templateStats[result.templateId].success++;
        } else {
          templateStats[result.templateId].failed++;
        }
      });

      console.log('\n📋 Results by template:');
      Object.entries(templateStats).forEach(([templateId, stats]) => {
        console.log(`   ${templateId}: ${stats.success} ✅ / ${stats.failed} ❌`);
      });

    } catch (error) {
      console.error('❌ Fatal error in notification processing:', error);
    }
  }

  // Method to run scheduler once and exit (useful for cron jobs)
  static async runOnce() {
    const scheduler = new NotificationScheduler();
    
    try {
      await connectDB();
      await scheduler.processDueNotifications();
      await mongoose.disconnect();
      process.exit(0);
    } catch (error) {
      console.error('❌ Fatal error running notification scheduler:', error);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  // Health check method
  async getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId !== null,
      lastCheck: new Date().toISOString(),
      uptime: this.isRunning ? process.uptime() : 0
    };
  }
}

// Export for use as module
export default NotificationScheduler;

// Auto-start when imported by server
const scheduler = new NotificationScheduler();
scheduler.start(2); // Check every 2 minutes for more responsive notifications

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  if (command === 'once') {
    // Run once and exit (good for cron jobs)
    console.log('🚀 Running notification scheduler once...');
    await NotificationScheduler.runOnce();
  } else {
    // Run continuously
    const intervalMinutes = parseInt(process.argv[2]) || 5;
    const scheduler = new NotificationScheduler();
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT, shutting down gracefully...');
      await scheduler.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
      await scheduler.stop();
      process.exit(0);
    });

    await scheduler.start(intervalMinutes);
  }
}