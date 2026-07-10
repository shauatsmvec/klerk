import { Pool } from 'pg';
import { env } from '../config/env';

export interface User {
  id?: string;
  phoneNumber: string;
  email: string;
  createdAt?: Date;
}

export class UserRepository {
  private readonly pool: Pool;

  constructor(connectionString = env.DATABASE_URL) {
    this.pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }

  public async getUserByPhone(phoneNumber: string): Promise<User | null> {
    const query = `
      SELECT id, phone_number AS "phoneNumber", email, created_at AS "createdAt"
      FROM users
      WHERE phone_number = $1;
    `;
    const res = await this.pool.query(query, [phoneNumber]);
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0];
  }

  public async createUser(phoneNumber: string, email: string): Promise<void> {
    const query = `
      INSERT INTO users (phone_number, email)
      VALUES ($1, $2)
      ON CONFLICT (phone_number) DO UPDATE SET
        email = EXCLUDED.email;
    `;
    await this.pool.query(query, [phoneNumber, email]);
  }

  public async getConversationState(phoneNumber: string): Promise<string | null> {
    const query = `
      SELECT state
      FROM conversation_states
      WHERE phone_number = $1;
    `;
    const res = await this.pool.query(query, [phoneNumber]);
    if (res.rows.length === 0) {
      return null;
    }
    return res.rows[0].state;
  }

  public async setConversationState(phoneNumber: string, state: string): Promise<void> {
    const query = `
      INSERT INTO conversation_states (phone_number, state, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (phone_number) DO UPDATE SET
        state = EXCLUDED.state,
        updated_at = NOW();
    `;
    await this.pool.query(query, [phoneNumber, state]);
  }

  public async clearConversationState(phoneNumber: string): Promise<void> {
    const query = `
      DELETE FROM conversation_states
      WHERE phone_number = $1;
    `;
    await this.pool.query(query, [phoneNumber]);
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
