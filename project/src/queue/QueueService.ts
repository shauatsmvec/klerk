import { PgBoss } from 'pg-boss';
import { env } from '../config/env';
import { logger } from '../config/logger';

export class QueueService {
  private boss: PgBoss;
  private static instance: QueueService;

  private constructor() {
    this.boss = new PgBoss(env.DATABASE_URL);
    
    this.boss.on('error', (error: any) => {
      logger.error({ err: error }, 'pg-boss error');
    });
  }

  public static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  public async start(): Promise<void> {
    logger.info('Starting pg-boss queue...');
    await this.boss.start();
    logger.info('pg-boss queue started successfully');
    
    // Ensure the document-processing queue exists in the database
    try {
      await this.boss.createQueue('document-processing');
      logger.info('Queue "document-processing" verified/created');
    } catch (err: any) {
      logger.warn({ err: err.message }, 'Failed to create queue, it may already exist');
    }
  }

  public async stop(): Promise<void> {
    logger.info('Stopping pg-boss queue...');
    await this.boss.stop();
    logger.info('pg-boss queue stopped');
  }

  public async sendJob(queueName: string, data: object): Promise<string | null> {
    try {
      const jobId = await this.boss.send(queueName, data);
      logger.info({ queueName, jobId }, 'Job sent successfully');
      return jobId;
    } catch (error) {
      logger.error({ err: error, queueName }, 'Failed to send job');
      throw error;
    }
  }

  public async registerWorker(
    queueName: string,
    handler: (data: any) => Promise<void>
  ): Promise<void> {
    logger.info({ queueName }, 'Registering worker for queue');
    await this.boss.work(queueName, async (jobs: any) => {
      // In pg-boss v9, the worker callback receives an array of jobs by default
      const job = Array.isArray(jobs) ? jobs[0] : jobs;
      if (!job) {
        logger.warn({ queueName }, 'Background worker received an empty jobs array');
        return;
      }

      logger.info({ jobId: job.id, queueName }, 'Processing job in background worker');
      try {
        await handler(job.data);
        logger.info({ jobId: job.id, queueName }, 'Job completed successfully');
      } catch (error) {
        logger.error({ err: error, jobId: job.id, queueName }, 'Job failed');
        throw error; // Let pg-boss handle retry/failure logic
      }
    });
  }

  public async getJobStatus(jobId: string): Promise<string | null> {
    try {
      const job = await this.boss.getJobById('document-processing', jobId);
      return job ? job.state : null;
    } catch (error) {
      logger.error({ err: error, jobId }, 'Failed to get job status');
      return null;
    }
  }
}
