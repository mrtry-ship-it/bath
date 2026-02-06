import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const baths = pgTable("baths", {
  id: serial("id").primaryKey(),
  date: timestamp("date").defaultNow().notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  temperatureCelsius: integer("temperature_celsius"),
  rating: integer("rating").notNull(), // 1-5 scale
  notes: text("notes"),
});

export const insertBathSchema = createInsertSchema(baths).omit({ id: true });

export type Bath = typeof baths.$inferSelect;
export type InsertBath = z.infer<typeof insertBathSchema>;

export type CreateBathRequest = InsertBath;
export type UpdateBathRequest = Partial<InsertBath>;
