
import { mysqlTable, varchar, int, boolean, json, datetime, decimal, text } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  profileImage: varchar("profile_image", { length: 255 }),
  userType: varchar("user_type", { length: 255 }).notNull().default("client"),
    createdAt: datetime("created_at"),
  });

  export const insertUserSchema = createInsertSchema(users).omit(["id", "createdAt"]).extend({
    confirmPassword: z.string(),
  });

  export const loginUserSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
  });

  export type InsertUser = z.infer<typeof insertUserSchema>;
  export type User = typeof users.$inferSelect;
  export type LoginUser = z.infer<typeof loginUserSchema>;

  // Designers
  export const designers = mysqlTable("designers", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    profileImage: varchar("profile_image", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }),
    bio: text("bio"),
    style: varchar("style", { length: 255 }).notNull(),
    description: text("description").notNull(),
    hourlyRate: int("hourly_rate").notNull(),
    rating: int("rating").notNull(),
    reviewCount: int("review_count").notNull(),
    location: varchar("location", { length: 255 }).notNull(),
    portfolioImages: json("portfolio_images").notNull(),
    features: json("features").notNull(),
    socialLinks: json("social_links").notNull(),
    services: json("services"),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
  });

  export const insertDesignerSchema = createInsertSchema(designers).omit([
    "id",
    "createdAt",
    "updatedAt",
  ]);

  export const updateDesignerSchema = createInsertSchema(designers).omit([
    "id",
    "userId",
    "createdAt",
    "updatedAt",
  ]).partial();

  export type InsertDesigner = z.infer<typeof insertDesignerSchema>;
  export type UpdateDesigner = z.infer<typeof updateDesignerSchema>;
  export type Designer = typeof designers.$inferSelect;

  // Posts
  export const posts = mysqlTable("posts", {
    id: int("id").primaryKey().autoincrement(),
    designerId: int("designer_id").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    image: varchar("image", { length: 255 }),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
  });

  // Likes
  export const likes = mysqlTable("likes", {
    id: int("id").primaryKey().autoincrement(),
    postId: int("post_id").notNull(),
    userId: int("user_id").notNull(),
    createdAt: datetime("created_at"),
  });

  // Comments
  export const comments = mysqlTable("comments", {
    id: int("id").primaryKey().autoincrement(),
    postId: int("post_id").notNull(),
    userId: int("user_id").notNull(),
    content: text("content").notNull(),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
  });

  // Messages
  export const messages = mysqlTable("messages", {
    id: int("id").primaryKey().autoincrement(),
    senderId: int("sender_id").notNull(),
    receiverId: int("receiver_id").notNull(),
    content: text("content").notNull(),
    read: boolean("read").notNull().default(false),
    createdAt: datetime("created_at"),
  });

  export const insertMessageSchema = createInsertSchema(messages);
  export type InsertMessage = z.infer<typeof insertMessageSchema>;
  export type Message = typeof messages.$inferSelect;

  // Products
  export const products = mysqlTable("products", {
    id: int("id").primaryKey().autoincrement(),
    sellerId: int("seller_id").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    discountPrice: decimal("discount_price", { precision: 10, scale: 2 }),
    category: varchar("category", { length: 255 }).notNull(),
    subcategory: varchar("subcategory", { length: 255 }),
    tags: json("tags"),
    style: varchar("style", { length: 255 }),
    material: varchar("material", { length: 255 }),
    color: varchar("color", { length: 255 }),
    dimensions: json("dimensions"),
    weight: decimal("weight", { precision: 6, scale: 2 }),
    weightUnit: varchar("weight_unit", { length: 255 }),
    images: json("images").notNull(),
    inStock: boolean("in_stock").notNull().default(true),
    stockQuantity: int("stock_quantity"),
    featured: boolean("featured").notNull().default(false),
    rating: decimal("rating", { precision: 3, scale: 1 }),
    reviewCount: int("review_count").notNull().default(0),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
  });

  export const insertProductSchema = createInsertSchema(products).omit([
    "id",
    "createdAt",
    "updatedAt",
  ]);

  export const updateProductSchema = createInsertSchema(products).omit([
    "id",
    "sellerId",
    "createdAt",
    "updatedAt",
  ]).partial();

  export type InsertProduct = z.infer<typeof insertProductSchema>;
  export type UpdateProduct = z.infer<typeof updateProductSchema>;
  export type Product = typeof products.$inferSelect;

  // Product Reviews
  export const productReviews = mysqlTable("product_reviews", {
    id: int("id").primaryKey().autoincrement(),
    productId: int("product_id").notNull(),
    userId: int("user_id").notNull(),
    rating: int("rating").notNull(),
    comment: text("comment"),
    createdAt: datetime("created_at"),
    updatedAt: datetime("updated_at"),
});

export const insertProductReviewSchema = createInsertSchema(productReviews).omit([
  "id",
  "createdAt",
  "updatedAt",
]);

export type InsertProductReview = z.infer<typeof insertProductReviewSchema>;
export type ProductReview = typeof productReviews.$inferSelect;

