import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User types: 'client', 'designer', or 'admin'
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  profileImage: text("profile_image"),
  userType: text("user_type").notNull().default("client"), // 'client', 'designer', or 'admin'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  confirmPassword: z.string()
});

export const loginUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6)
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginUser = z.infer<typeof loginUserSchema>;

// Designer profiles extend user profiles
export const designers = pgTable("designers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(), // Link to user account
  name: text("name").notNull(),
  profileImage: text("profile_image").notNull(),
  title: text("title"),
  bio: text("bio"),
  style: text("style").notNull(),
  description: text("description").notNull(),
  hourlyRate: integer("hourly_rate").notNull(),
  rating: integer("rating").notNull(),
  reviewCount: integer("review_count").notNull(),
  location: text("location").notNull(),
  portfolioImages: text("portfolio_images").array().notNull(),
  features: jsonb("features").notNull(),
  socialLinks: jsonb("social_links").notNull(),
  services: text("services").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDesignerSchema = createInsertSchema(designers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateDesignerSchema = createInsertSchema(designers).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type InsertDesigner = z.infer<typeof insertDesignerSchema>;
export type UpdateDesigner = z.infer<typeof updateDesignerSchema>;
export type Designer = typeof designers.$inferSelect;

// Posts schema
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  designerId: integer("designer_id").notNull().references(() => designers.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Likes schema
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLikeSchema = createInsertSchema(likes).omit({
  id: true,
  createdAt: true,
});

export type InsertLike = z.infer<typeof insertLikeSchema>;
export type Like = typeof likes.$inferSelect;

// Comments schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Messages schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  read: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Products schema for marketplace
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountPrice: decimal("discount_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(), // furniture, flooring, decoration, lighting, etc.
  subcategory: text("subcategory"), // e.g., chairs, tables, sofas under furniture
  tags: text("tags").array(),
  style: text("style"), // modern, traditional, industrial, etc.
  material: text("material"), // wood, metal, glass, etc.
  color: text("color"),
  dimensions: jsonb("dimensions"), // { width, height, depth, unit }
  weight: decimal("weight", { precision: 6, scale: 2 }),
  weightUnit: text("weight_unit"), // kg, lb, etc.
  images: text("images").array().notNull(),
  inStock: boolean("in_stock").notNull().default(true),
  stockQuantity: integer("stock_quantity"),
  featured: boolean("featured").notNull().default(false),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  reviewCount: integer("review_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const updateProductSchema = createInsertSchema(products).omit({
  id: true,
  sellerId: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type Product = typeof products.$inferSelect;

// Product reviews schema
export const productReviews = pgTable("product_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductReviewSchema = createInsertSchema(productReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;
export type ProductReview = typeof productReviews.$inferSelect;
