import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDesignerSchema, insertMessageSchema, insertUserSchema, loginUserSchema, updateDesignerSchema, 
  User, Product, ProductReview, InsertProductReview, UpdateProduct, InsertProduct 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import passport from "passport";
import { isAuthenticated, isDesigner, isAdmin } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
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
            userType: newUser.userType
          }
        });
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  
  // Login a user
  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData = loginUserSchema.parse(req.body);
      
      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          return res.status(401).json({ message: info?.message || "Authentication failed" });
        }
        
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          
          // Return only the user object to match client expectations
          return res.json({
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            userType: user.userType
          });
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to login" });
    }
  });
  
  // Get current user
  app.get("/api/auth/me", isAuthenticated, (req: Request, res: Response) => {
    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      userType: user.userType,
      profileImage: user.profileImage
    });
  });
  
  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.json({ message: "Logout successful" });
    });
  });
  
  // Guest login endpoint
  app.post("/api/auth/guest-login", async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Find the guest user
      const guestUser = await storage.getUserByUsername("guest_user");
      
      if (!guestUser) {
        return res.status(500).json({ message: "Guest account not found" });
      }
      
      // Log in as the guest user
      req.login(guestUser, (err) => {
        if (err) {
          console.error("Guest login error:", err);
          return next(err);
        }
        
        return res.status(200).json({ 
          message: "Guest login successful",
          user: {
            id: guestUser.id,
            username: guestUser.username,
            name: guestUser.name,
            email: guestUser.email,
            userType: guestUser.userType,
            profileImage: guestUser.profileImage
          }
        });
      });
    } catch (error) {
      console.error("Guest login error:", error);
      res.status(500).json({ message: "An error occurred during guest login" });
    }
  });
  
  // Bootstrap first admin user (no auth required - should be secured in production)
  app.post("/api/admin/bootstrap", async (req: Request, res: Response) => {
    try {
      // Check if an admin already exists in the system
      const users = await storage.getAllUsers();
      const adminExists = users.some((user: User) => user.userType === 'admin');
      
      if (adminExists) {
        return res.status(403).json({ message: "An admin user already exists. Use the regular admin creation endpoint." });
      }
      
      // If no admin exists, allow creating the first one
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
      
      // Force userType to be admin
      userData.userType = 'admin';
      
      const newAdmin = await storage.createUser(userData);
      
      res.status(201).json({ 
        message: "First admin user created successfully",
        user: {
          id: newAdmin.id,
          username: newAdmin.username,
          name: newAdmin.name,
          email: newAdmin.email,
          userType: newAdmin.userType
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });
  
  // Get all users (admin only)
  app.get("/api/admin/users", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Create additional admin users (requires admin authentication)
  app.post("/api/admin/create", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
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
      
      // Force userType to be admin for this endpoint
      userData.userType = 'admin';
      
      const newAdmin = await storage.createUser(userData);
      
      res.status(201).json({ 
        message: "Admin user created successfully",
        user: {
          id: newAdmin.id,
          username: newAdmin.username,
          name: newAdmin.name,
          email: newAdmin.email,
          userType: newAdmin.userType
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create admin user" });
    }
  });
  
  // Designer profile management
  
  // Get designer profile for current user
  app.get("/api/designer/profile", isAuthenticated, isDesigner, async (req: Request, res: Response) => {
    try {
      const designer = await storage.getDesignerByUserId((req.user as any).id);
      
      if (!designer) {
        return res.status(404).json({ message: "Designer profile not found" });
      }
      
      res.json(designer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch designer profile" });
    }
  });
  
  // Update designer profile
  app.put("/api/designer/profile", isAuthenticated, isDesigner, async (req: Request, res: Response) => {
    try {
      const designer = await storage.getDesignerByUserId((req.user as any).id);
      
      if (!designer) {
        return res.status(404).json({ message: "Designer profile not found" });
      }
      
      const designerData = updateDesignerSchema.parse(req.body);
      const updatedDesigner = await storage.updateDesigner(designer.id, designerData);
      
      res.json(updatedDesigner);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update designer profile" });
    }
  });
  
  // API routes

  // Get all designers
  app.get("/api/designers", async (req: Request, res: Response) => {
    try {
      const designers = await storage.getAllDesigners();
      res.json(designers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch designers" });
    }
  });

  // Get designer by ID
  app.get("/api/designers/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid designer ID" });
      }

      const designer = await storage.getDesignerById(id);
      if (!designer) {
        return res.status(404).json({ message: "Designer not found" });
      }

      res.json(designer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch designer" });
    }
  });

  // Create a new designer
  app.post("/api/designers", async (req: Request, res: Response) => {
    try {
      const designerData = insertDesignerSchema.parse(req.body);
      const newDesigner = await storage.createDesigner(designerData);
      res.status(201).json(newDesigner);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create designer" });
    }
  });

  // Filter designers by style
  app.get("/api/designers/filter/style/:style", async (req: Request, res: Response) => {
    try {
      const style = req.params.style;
      const designers = await storage.getDesignersByStyle(style);
      res.json(designers);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter designers by style" });
    }
  });

  // Filter designers by price range
  app.get("/api/designers/filter/price", async (req: Request, res: Response) => {
    try {
      const min = parseInt(req.query.min as string) || 0;
      const max = parseInt(req.query.max as string) || 1000;
      const designers = await storage.getDesignersByPriceRange(min, max);
      res.json(designers);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter designers by price range" });
    }
  });

  // Filter designers by location
  app.get("/api/designers/filter/location/:location", async (req: Request, res: Response) => {
    try {
      const location = req.params.location;
      const designers = await storage.getDesignersByLocation(location);
      res.json(designers);
    } catch (error) {
      res.status(500).json({ message: "Failed to filter designers by location" });
    }
  });
  
  // Post routes - public routes don't require authentication
  app.get("/api/posts", async (req: Request, res: Response) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });
  
  app.get("/api/posts/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const post = await storage.getPostById(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });
  
  app.get("/api/designers/:id/posts", async (req: Request, res: Response) => {
    try {
      const designerId = parseInt(req.params.id);
      if (isNaN(designerId)) {
        return res.status(400).json({ message: "Invalid designer ID" });
      }
      
      const posts = await storage.getPostsByDesignerId(designerId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch designer posts" });
    }
  });
  
  app.post("/api/posts", isAuthenticated, isDesigner, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const designer = await storage.getDesignerByUserId(user.id);
      
      if (!designer) {
        return res.status(403).json({ message: "Only designers can create posts" });
      }
      
      const postData = req.body;
      postData.designerId = designer.id;
      
      const newPost = await storage.createPost(postData);
      res.status(201).json(newPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to create post" });
    }
  });
  
  // Like routes
  app.get("/api/posts/:postId/likes", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const likes = await storage.getLikesByPostId(postId);
      res.json({ 
        likes,
        count: likes.length 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch likes" });
    }
  });
  
  app.post("/api/posts/:postId/like", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const postId = parseInt(req.params.postId);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Check if post exists
      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user already liked the post
      const existingLike = await storage.getLikeByUserAndPost(user.id, postId);
      if (existingLike) {
        return res.status(409).json({ message: "User already liked this post" });
      }
      
      const newLike = await storage.createLike({
        postId,
        userId: user.id
      });
      
      const likes = await storage.getLikesByPostId(postId);
      
      res.status(201).json({ 
        like: newLike,
        count: likes.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to like post" });
    }
  });
  
  app.delete("/api/posts/:postId/like", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const postId = parseInt(req.params.postId);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Find the like
      const existingLike = await storage.getLikeByUserAndPost(user.id, postId);
      if (!existingLike) {
        return res.status(404).json({ message: "Like not found" });
      }
      
      // Delete the like
      await storage.deleteLike(existingLike.id);
      
      const likes = await storage.getLikesByPostId(postId);
      
      res.json({ 
        success: true,
        count: likes.length
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });
  
  // Comment routes
  app.get("/api/posts/:postId/comments", async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const comments = await storage.getCommentsByPostId(postId);
      
      // Get user info for each comment
      const commentsWithUser = await Promise.all(comments.map(async (comment) => {
        const user = await storage.getUser(comment.userId);
        return {
          ...comment,
          user: user ? {
            id: user.id,
            name: user.name,
            profileImage: user.profileImage
          } : null
        };
      }));
      
      res.json(commentsWithUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  
  app.post("/api/posts/:postId/comments", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const postId = parseInt(req.params.postId);
      
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const { content } = req.body;
      if (!content || content.trim() === '') {
        return res.status(400).json({ message: "Comment content is required" });
      }
      
      // Check if post exists
      const post = await storage.getPostById(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Create comment
      const newComment = await storage.createComment({
        postId,
        userId: user.id,
        content
      });
      
      // Get user info for response
      const commentWithUser = {
        ...newComment,
        user: {
          id: user.id,
          name: user.name,
          profileImage: user.profileImage
        }
      };
      
      res.status(201).json(commentWithUser);
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
      const productId = parseInt(req.params.id);
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

  return httpServer;
}
