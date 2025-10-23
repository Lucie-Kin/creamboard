import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Station types for factory floor
export const stationTypeEnum = z.enum([
  "arrival_dock",
  "storage_tank",
  "laboratory",
  "mixing_room",
  "heating_room",
  "cooling_room",
  "packaging",
  "waste_management",
  "storage",
  "delivery_dock"
]);

export type StationType = z.infer<typeof stationTypeEnum>;

// Traffic light status
export const statusEnum = z.enum(["green", "yellow", "red"]);
export type Status = z.infer<typeof statusEnum>;

// Factory station schema
export const factoryStations = pgTable("factory_stations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  positionX: integer("position_x").notNull(),
  positionY: integer("position_y").notNull(),
});

export const insertFactoryStationSchema = createInsertSchema(factoryStations).omit({ id: true });
export type InsertFactoryStation = z.infer<typeof insertFactoryStationSchema>;
export type FactoryStation = typeof factoryStations.$inferSelect;

// Operator schema
export const operators = pgTable("operators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  qrCode: text("qr_code").notNull().unique(),
  role: text("role").notNull(),
});

export const insertOperatorSchema = createInsertSchema(operators).omit({ id: true });
export type InsertOperator = z.infer<typeof insertOperatorSchema>;
export type Operator = typeof operators.$inferSelect;

// Batch schema
export const batches = pgTable("batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  batchNumber: text("batch_number").notNull().unique(),
  productName: text("product_name").notNull(),
  currentStation: text("current_station"),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertBatchSchema = createInsertSchema(batches).omit({ id: true, timestamp: true });
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof batches.$inferSelect;

// Task/Checkpoint schema
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  operatorId: varchar("operator_id").notNull(),
  stationId: varchar("station_id").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  notes: text("notes"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, timestamp: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Alert schema
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  message: text("message").notNull(),
  priority: text("priority").notNull(),
  stationId: varchar("station_id"),
  acknowledged: boolean("acknowledged").notNull().default(false),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true, timestamp: true });
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

// User schema (keep existing)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
