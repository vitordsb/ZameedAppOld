
import { createServer, type Server } from "http";
import { IStorage } from "./storage";
import { 
  insertDesignerSchema, insertMessageSchema, insertUserSchema, loginUserSchema, updateDesignerSchema, 
  User, Product, ProductReview, InsertProductReview, UpdateProduct, InsertProduct 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import passport from "passport";
import { isAuthenticated, isDesigner, isAdmin } from "./auth";
import { setupVite } from "./vite";
import type { Request, Response } from "express";
import type { Express } from "express";
import type { Server } from "http";

export async function registerRoutes(app: Express, storage: IStorage): Promise<Server> {
  // Authentication routes
  
  // Register a new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Validate that passwords match
      if (userData.password !== userData.confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      
      const newUser = await storage.createUser(userData);
      
      // If registration was successful, log the user in
      req.login(newUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in after registration" });
        }
        return res.status(201).json({ 
          message: "Registration successful",
          user: {
            id: newUser.id,
            username: newUser.username,
            name: newUser.name,
            email: newUser.email,
            profileImage: newUser.profileImage,
            userType: newUser.userType
          }
        });
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  // Login user
  app.post("/api/auth/login", (req: Request, res: Response, next) => {
    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ message: "Login error" });
        }
        return res.json({
          message: "Login successful",
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            userType: user.userType
          }
        });
      });
    })(req, res, next);
  });
  
  // Guest login
  app.post("/api/auth/guest-login", async (req: Request, res: Response) => {
    try {
      const guestUser = await storage.getUserByUsername("guest_user");
      
      if (!guestUser) {
        return res.status(404).json({ message: "Guest user not found" });
      }
      
      req.login(guestUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error logging in as guest" });
        }
        return res.json({
          message: "Guest login successful",
          user: {
            id: guestUser.id,
            username: guestUser.username,
            name: guestUser.name,
            email: guestUser.email,
            profileImage: guestUser.profileImage,
            userType: guestUser.userType
          }
        });
      });
    } catch (error) {
      console.error("Guest login error:", error);
      res.status(500).json({ message: "Failed to login as guest" });
    }
  });
  
  // Logout user
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  
  // Get current user
  app.get("/api/auth/user", (req: Request, res: Response) => {
    if (req.isAuthenticated() && req.user) {
      const user = req.user as User;
      res.json({
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          userType: user.userType
        }
      });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Admin routes
  
  // Get all users (admin only)
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Update user (admin only)
  app.put("/api/admin/users/:id", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Designer routes
  
  // Get all designers
  app.get("/api/designers", async (req: Request, res: Response) => {
    try {
      const { style, minPrice, maxPrice, location } = req.query;
      
      let designers;
      
      if (style && typeof style === 'string') {
        designers = await storage.getDesignersByStyle(style);
      } else if (minPrice && maxPrice) {
        const min = Number(minPrice);
        const max = Number(maxPrice);
        if (!isNaN(min) && !isNaN(max)) {
          designers = await storage.getDesignersByPriceRange(min, max);
        } else {
          designers = await storage.getAllDesigners();
        }
      } else if (location && typeof location === 'string') {
        designers = await storage.getDesignersByLocation(location);
      } else {
        designers = await storage.getAllDesigners();
      }
      
      res.json(designers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch designers" });
    }
  });
  
  // Get designer by ID
  app.get("/api/designers/:id", async (req: Request, res: Response) => {
    try {
      const designerId = parseInt(req.params.id);
      const designer = await storage.getDesignerById(designerId);
      
      if (!designer) {
        return res.status(404).json({ message: "Designer not found" });
      }
      
      res.json(designer);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch designer" });
    }
  });
  
  // Create designer profile (authenticated users only)
  app.post("/api/designers", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      
      // Check if user already has a designer profile
      const existingDesigner = await storage.getDesignerByUserId(user.id);
      if (existingDesigner) {
        return res.status(400).json({ message: "User already has a designer profile" });
      }
      
      const designerData = insertDesignerSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const newDesigner = await storage.createDesigner(designerData);
      
      // Update user type to designer
      await storage.updateUser(user.id, { userType: "designer" });
      
      res.status(201).json(newDesigner);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Failed to create designer profile" });
    }
  });
  
  // Update designer profile (designer only)
  app.put("/api/designers/:id", isAuthenticated, isDesigner, async (req: Request, res: Response) => {
    try {
      const designerId = parseInt(req.params.id);
      const user = req.user as User;
      
      // Check if the designer belongs to the current user
      const designer = await storage.getDesignerById(designerId);
      if (!designer || designer.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to update this designer profile" });
      }
      
      const updateData = updateDesignerSchema.parse(req.body);
      const updatedDesigner = await storage.updateDesigner(designerId, updateData);
      
      if (!updatedDesigner) {
        return res.status(404).json({ message: "Designer not found" });
      }
      
      res.json(updatedDesigner);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error(error);
      res.status(500).json({ message: "Failed to update designer profile" });
    }
  });

  // Profile routes
  
  // Get user profile
  app.get("/api/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      
      // Get designer profile if user is a designer
      let designerProfile = null;
      if (user.userType === 'designer') {
        designerProfile = await storage.getDesignerByUserId(user.id);
      }
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          userType: user.userType
        },
        designerProfile
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  
  // Update user profile
  app.put("/api/profile", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      const { name, email, profileImage } = req.body;
      
      const updatedUser = await storage.updateUser(user.id, {
        name,
        email,
        profileImage
      });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          name: updatedUser.name,
          email: updatedUser.email,
          profileImage: updatedUser.profileImage,
          userType: updatedUser.userType
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Post routes
  
  // Get all posts
  app.get("/api/posts", async (req: Request, res: Response) => {
    try {
      const posts = await storage.getAllPosts();
      
      // Get likes and comments for each post
      const postsWithInteractions = await Promise.all(
        posts.map(async (post) => {
          const likes = await storage.getLikesByPostId(post.id);
          const comments = await storage.getCommentsByPostId(post.id);
          
          return {
            ...post,
            likes: likes.length,
            comments: comments.length,
            likedBy: likes.map(like => like.userId),
            commentsData: comments
          };
        })
      );
      
      res.json(postsWithInteractions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });
  
  // Get post by ID
  app.get("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Get likes and comments for the post
      const likes = await storage.getLikesByPostId(post.id);
      const comments = await storage.getCommentsByPostId(post.id);
      
      const postWithInteractions = {
        ...post,
        likes: likes.length,
        comments: comments.length,
        likedBy: likes.map(like => like.userId),
        commentsData: comments
      };
      
      res.json(postWithInteractions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });
  
  // Get posts by designer ID
  app.get("/api/posts/designer/:designerId", async (req: Request, res: Response) => {
    try {
      const designerId = parseInt(req.params.designerId);
      const posts = await storage.getPostsByDesignerId(designerId);
      
      // Get likes and comments for each post
      const postsWithInteractions = await Promise.all(
        posts.map(async (post) => {
          const likes = await storage.getLikesByPostId(post.id);
          const comments = await storage.getCommentsByPostId(post.id);
          
          return {
            ...post,
            likes: likes.length,
            comments: comments.length,
            likedBy: likes.map(like => like.userId),
            commentsData: comments
          };
        })
      );
      
      res.json(postsWithInteractions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch designer posts" });
    }
  });
  
  // Create a new post (designer only)
  app.post("/api/posts", isAuthenticated, isDesigner, async (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      
      // Get designer profile
      const designer = await storage.getDesignerByUserId(user.id);
      if (!designer) {
        return res.status(404).json({ message: "Designer profile not found" });
      }
      
      const postData = {
        ...req.body,
        designerId: designer.id
      };
      
      const newPost = await storage.createPost(postData);
      res.status(201).json(newPost);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });
  
  // Update a post (designer only)
  app.put("/api/posts/:id", isAuthenticated, isDesigner, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const user = req.user as User;
      
      // Check if the post belongs to the current user's designer profile
      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const designer = await storage.getDesignerByUserId(user.id);
      if (!designer || post.designerId !== designer.id) {
        return res.status(403).json({ message: "Not authorized to update this post" });
      }
      
      const updatedPost = await storage.updatePost(postId, req.body);
      res.json(updatedPost);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update post" });
    }
  });
  
  // Delete a post (designer only)
  app.delete("/api/posts/:id", isAuthenticated, isDesigner, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const user = req.user as User;
      
      // Check if the post belongs to the current user's designer profile
      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const designer = await storage.getDesignerByUserId(user.id);
      if (!designer || post.designerId !== designer.id) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      
      const result = await storage.deletePost(postId);
      
      if (!result) {
        return res.status(500).json({ message: "Failed to delete post" });
      }
      
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });
  
  // Like a post
  app.post("/api/posts/:id/like", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const user = req.user as User;
      
      // Check if post exists
      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user already liked this post
      const existingLike = await storage.getLikeByUserAndPost(user.id, postId);
      if (existingLike) {
        return res.status(400).json({ message: "Post already liked" });
      }
      
      const newLike = await storage.createLike({
        postId,
        userId: user.id
      });
      
      res.status(201).json(newLike);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });
  
  // Unlike a post
  app.delete("/api/posts/:id/like", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const user = req.user as User;
      
      // Find the like
      const like = await storage.getLikeByUserAndPost(user.id, postId);
      if (!like) {
        return res.status(404).json({ message: "Like not found" });
      }
      
      const result = await storage.deleteLike(like.id);
      
      if (!result) {
        return res.status(500).json({ message: "Failed to unlike post" });
      }
      
      res.json({ message: "Post unliked successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });
  
  // Add a comment to a post
  app.post("/api/posts/:id/comments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.id);
      const user = req.user as User;
      
      // Check if post exists
      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const commentData = {
        postId,
        userId: user.id,
        content: req.body.content
      };
      
      const newComment = await storage.createComment(commentData);
      
      // Get the comment with user information
      const commentWithUser = await storage.getCommentsByPostId(postId);
      const createdComment = commentWithUser.find(c => c.id === newComment.id);
      
      res.status(201).json(createdComment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Messaging routes
  
  // Get conversation between two users
  app.get("/api/messages/:userId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as any;
      const otherUserId = parseInt(req.params.userId);
      
      if (isNaN(otherUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if other user exists
      const otherUser = await storage.getUser(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const conversation = await storage.getConversation(currentUser.id, otherUserId);
      
      // Mark all received messages as read
      for (const message of conversation) {
        if (message.receiverId === currentUser.id && !message.read) {
          await storage.markMessageAsRead(message.id);
        }
      }
      
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });
  
  // Get all conversations for current user
  app.get("/api/messages", isAuthenticated, async (req: Request, res: Response) => {
    try {
      console.log("GET /api/messages - User:", req.user);
      console.log("GET /api/messages - Query params:", req.query);
      
      const user = req.user as any;
      if (!user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const initialUserIdParam = req.query.initialUserId;
      console.log("GET /api/messages - initialUserIdParam:", initialUserIdParam, "type:", typeof initialUserIdParam);
      
      const initialUserId = initialUserIdParam ? parseInt(initialUserIdParam as string) : null;
      console.log("GET /api/messages - initialUserId after parsing:", initialUserId);
      
      // Get all messages for the current user
      const messages = await storage.getMessagesByUser(user.id);
      
      // Group messages by conversation partners
      const conversations = new Map<number, {
        partner: { id: number; name: string; profileImage: string | null; userType: string };
        lastMessage: any;
        unreadCount: number;
      }>();
      
      // Process existing messages
      for (const message of messages) {
        const partnerId = message.senderId === user.id ? message.receiverId : message.senderId;
        
        // Skip if we already processed this partner
        if (conversations.has(partnerId)) continue;
        
        const partner = await storage.getUser(partnerId);
        if (!partner) continue;
        
        // Calculate unread count specifically for this partner
        const partnerMessages = await storage.getConversation(user.id, partnerId);
        const unreadCount = partnerMessages.filter(
          msg => msg.receiverId === user.id && !msg.read
        ).length;
        
        conversations.set(partnerId, {
          partner: {
            id: partner.id,
            name: partner.name,
            profileImage: partner.profileImage,
            userType: partner.userType
          },
          lastMessage: {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt,
            isFromUser: message.senderId === user.id
          },
          unreadCount
        });
      }
      
      // Handle initial user ID - add a new conversation if it doesn't exist yet
      if (initialUserId && !conversations.has(initialUserId) && initialUserId !== user.id) {
        // First, check if the user exists
        const partnerUser = await storage.getUser(initialUserId);
        
        if (partnerUser) {
          // If it's a designer, try to get more information
          let designer = null;
          if (partnerUser.userType === 'designer') {
            designer = (await storage.getAllDesigners()).find(d => d.userId === initialUserId);
          }
          
          // Create a stub conversation
          conversations.set(initialUserId, {
            partner: {
              id: partnerUser.id,
              name: designer?.name || partnerUser.name,
              profileImage: designer?.profileImage || partnerUser.profileImage,
              userType: partnerUser.userType
            },
            lastMessage: {
              id: 0,
              content: 'Start a conversation now',
              createdAt: new Date(),
              isFromUser: false
            },
            unreadCount: 0
          });
        } else {
          // Try getting the designer directly by ID
          const designer = await storage.getDesignerById(initialUserId);
          
          if (designer) {
            const designerUser = await storage.getUser(designer.userId);
            
            if (designerUser) {
              // Create a stub conversation
              conversations.set(designer.userId, {
                partner: {
                  id: designerUser.id,
                  name: designer.name || designerUser.name,
                  profileImage: designer.profileImage || designerUser.profileImage,
                  userType: designerUser.userType
                },
                lastMessage: {
                  id: 0,
                  content: 'Start a conversation now',
                  createdAt: new Date(),
                  isFromUser: false
                },
                unreadCount: 0
              });
            }
          }
        }
      }
      
      res.json(Array.from(conversations.values()));
    } catch (error) {
      console.error("Error in /api/messages:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  
  // Get unread message count
  app.get("/api/messages/unread/count", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const partnerId = req.query.partnerId ? parseInt(req.query.partnerId as string) : null;
      
      let count;
      if (partnerId) {
        // Get messages from the specific user
        const messages = await storage.getConversation(user.id, partnerId);
        count = messages.filter(msg => msg.receiverId === user.id && !msg.read).length;
      } else {
        // Get total unread count
        count = await storage.getUnreadMessageCount(user.id);
      }
      
      res.json({ count });
    } catch (error) {
      console.error("Error in /api/messages/unread/count:", error);
      res.status(500).json({ message: "Failed to fetch unread message count" });
    }
  });
  
  // Send a message
  app.post("/api/messages/:userId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const currentUser = req.user as any;
      const receiverId = parseInt(req.params.userId);
      
      if (isNaN(receiverId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if receiver exists
      const receiver = await storage.getUser(receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      // Validate message content
      const messageData = insertMessageSchema.parse({
        senderId: currentUser.id,
        receiverId,
        content: req.body.content
      });
      
      const newMessage = await storage.createMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  
  // Mark message as read
  app.put("/api/messages/:messageId/read", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const messageId = parseInt(req.params.messageId);
      
      if (isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      
      const updatedMessage = await storage.markMessageAsRead(messageId);
      if (!updatedMessage) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Products API Endpoints
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      // Handle query parameters for filtering
      const { category, subcategory, style, minPrice, maxPrice, query } = req.query;
      
      let products: Product[];
      
      if (query && typeof query === 'string') {
        // Search products by query string
        products = await storage.searchProducts(query);
      } else if (category && typeof category === 'string') {
        // Filter by category
        products = await storage.getProductsByCategory(category);
        
        // Apply subcategory filter if provided
        if (subcategory && typeof subcategory === 'string') {
          products = products.filter(p => 
            p.subcategory?.toLowerCase() === subcategory.toLowerCase()
          );
        }
      } else if (style && typeof style === 'string') {
        // Filter by style
        products = await storage.getProductsByStyle(style);
      } else if (minPrice !== undefined && maxPrice !== undefined) {
        // Filter by price range
        const min = Number(minPrice);
        const max = Number(maxPrice);
        
        if (!isNaN(min) && !isNaN(max)) {
          products = await storage.getProductsByPriceRange(min, max);
        } else {
          products = await storage.getAllProducts();
        }
      } else {
        // Get all products if no filters are applied
        products = await storage.getAllProducts();
      }
      
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve products" });
    }
  });
  
  app.get("/api/products/featured", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const products = await storage.getFeaturedProducts(limit);
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve featured products" });
    }
  });
  
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.status(200).json(product);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve product" });
    }
  });
  
  app.get("/api/products/seller/:sellerId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const sellerId = parseInt(req.params.sellerId);
      const products = await storage.getProductsBySellerId(sellerId);
      res.status(200).json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve seller products" });
    }
  });
  
  app.post("/api/products", isAuthenticated, isDesigner, async (req: Request, res: Response) => {
    try {
      // Ensure the product is being created by the authenticated user
      const productData = { ...req.body, sellerId: req.user!.id };
      
      const newProduct = await storage.createProduct(productData);
      res.status(201).json(newProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  app.put("/api/products/:id", isAuthenticated, isDesigner, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Only allow the product owner (seller) to update it
      if (product.sellerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this product" });
      }
      
      const updatedProduct = await storage.updateProduct(productId, req.body);
      res.status(200).json(updatedProduct);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  
  app.delete("/api/products/:id", isAuthenticated, isDesigner, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Only allow the product owner (seller) to delete it
      if (product.sellerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this product" });
      }
      
      const result = await storage.deleteProduct(productId);
      
      if (!result) {
        return res.status(500).json({ message: "Failed to delete product" });
      }
      
      res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  
  // Product Reviews API Endpoints
  app.get("/api/products/:productId/reviews", async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      const reviews = await storage.getReviewsByProductId(productId);
      res.status(200).json(reviews);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to retrieve product reviews" });
    }
  });
  
  app.post("/api/products/:productId/reviews", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const productId = parseInt(req.params.productId);
      const product = await storage.getProductById(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Create the review with the authenticated user's ID
      const reviewData = {
        ...req.body,
        productId,
        userId: req.user!.id
      };
      
      const newReview = await storage.createProductReview(reviewData);
      res.status(201).json(newReview);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create product review" });
    }
  });
  
  app.delete("/api/products/reviews/:reviewId", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const reviewId = parseInt(req.params.reviewId);
      const reviews = await storage.getReviewsByProductId(0); // Get all reviews
      const review = reviews.find(r => r.id === reviewId);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      // Only allow the review author to delete it
      if (review.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this review" });
      }
      
      const result = await storage.deleteProductReview(reviewId);
      
      if (!result) {
        return res.status(500).json({ message: "Failed to delete review" });
      }
      
      res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to delete product review" });
    }
  });

  const httpServer = createServer(app);

  // Setup Vite for frontend
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, httpServer);
  }

  return httpServer;
}


