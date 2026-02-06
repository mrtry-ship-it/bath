import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.baths.list.path, async (_req, res) => {
    const baths = await storage.getBaths();
    res.json(baths);
  });

  app.get(api.baths.get.path, async (req, res) => {
    const bath = await storage.getBath(Number(req.params.id));
    if (!bath) {
      return res.status(404).json({ message: "Bath not found" });
    }
    res.json(bath);
  });

  app.post(api.baths.create.path, async (req, res) => {
    try {
      const input = api.baths.create.input.parse(req.body);
      const bath = await storage.createBath(input);
      res.status(201).json(bath);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.put(api.baths.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const existing = await storage.getBath(id);
      if (!existing) {
        return res.status(404).json({ message: "Bath not found" });
      }
      const input = api.baths.update.input.parse(req.body);
      const updated = await storage.updateBath(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      throw err;
    }
  });

  app.delete(api.baths.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const existing = await storage.getBath(id);
    if (!existing) {
      return res.status(404).json({ message: "Bath not found" });
    }
    await storage.deleteBath(id);
    res.status(204).send();
  });

  // Seed data if empty
  const existingBaths = await storage.getBaths();
  if (existingBaths.length === 0) {
    await storage.createBath({
      date: new Date(),
      durationMinutes: 30,
      temperatureCelsius: 40,
      rating: 5,
      notes: "Perfect relaxation after a long day.",
    });
    await storage.createBath({
      date: new Date(Date.now() - 86400000), // Yesterday
      durationMinutes: 45,
      temperatureCelsius: 38,
      rating: 4,
      notes: "Read a book, very calming.",
    });
  }

  return httpServer;
}
