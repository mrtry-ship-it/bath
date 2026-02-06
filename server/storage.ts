import { db } from "./db";
import {
  baths,
  type Bath,
  type CreateBathRequest,
  type UpdateBathRequest,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getBaths(): Promise<Bath[]>;
  getBath(id: number): Promise<Bath | undefined>;
  createBath(bath: CreateBathRequest): Promise<Bath>;
  updateBath(id: number, updates: UpdateBathRequest): Promise<Bath>;
  deleteBath(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getBaths(): Promise<Bath[]> {
    return await db.select().from(baths).orderBy(desc(baths.date));
  }

  async getBath(id: number): Promise<Bath | undefined> {
    const [bath] = await db.select().from(baths).where(eq(baths.id, id));
    return bath;
  }

  async createBath(bath: CreateBathRequest): Promise<Bath> {
    const [newBath] = await db.insert(baths).values(bath).returning();
    return newBath;
  }

  async updateBath(id: number, updates: UpdateBathRequest): Promise<Bath> {
    const [updated] = await db
      .update(baths)
      .set(updates)
      .where(eq(baths.id, id))
      .returning();
    return updated;
  }

  async deleteBath(id: number): Promise<void> {
    await db.delete(baths).where(eq(baths.id, id));
  }
}

export const storage = new DatabaseStorage();
