import {
  designers, type Designer, type InsertDesigner, type UpdateDesigner,
  users, type User, type InsertUser,
  posts, type Post, type InsertPost,
  likes, type Like, type InsertLike,
  comments, type Comment, type InsertComment,
  messages, type Message, type InsertMessage,
  products, type Product, type InsertProduct, type UpdateProduct,
  productReviews, type ProductReview, type InsertProductReview
} from "@shared/schema";
import * as bcrypt from "bcryptjs";

// Storage interface with user management methods
export interface IStorage {
  // User methods
  getAllUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  validateUserPassword(username: string, password: string): Promise<User | undefined>;
  getUserDesignerProfile(userId: number): Promise<Designer | undefined>;
  
  // Designer methods
  getAllDesigners(): Promise<Designer[]>;
  getDesignerById(id: number): Promise<Designer | undefined>;
  getDesignerByUserId(userId: number): Promise<Designer | undefined>;
  createDesigner(designer: InsertDesigner): Promise<Designer>;
  updateDesigner(id: number, designerData: UpdateDesigner): Promise<Designer | undefined>;
  getDesignersByStyle(style: string): Promise<Designer[]>;
  getDesignersByPriceRange(min: number, max: number): Promise<Designer[]>;
  getDesignersByLocation(location: string): Promise<Designer[]>;
  
  // Post methods
  getAllPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByDesignerId(designerId: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, postData: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Like methods
  getLikesByPostId(postId: number): Promise<Like[]>;
  getLikeByUserAndPost(userId: number, postId: number): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(id: number): Promise<boolean>;
  
  // Comment methods
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  getCommentById(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, commentData: Partial<Comment>): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;
  
  // Message methods
  getConversation(userId1: number, userId2: number): Promise<Message[]>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  getUnreadMessageCount(userId: number): Promise<number>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<Message | undefined>;
  deleteMessage(id: number): Promise<boolean>;
  
  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductsBySellerId(sellerId: number): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsBySubcategory(subcategory: string): Promise<Product[]>;
  getProductsByStyle(style: string): Promise<Product[]>;
  getProductsByPriceRange(min: number, max: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, productData: UpdateProduct): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Product Review methods
  getReviewsByProductId(productId: number): Promise<ProductReview[]>;
  createProductReview(review: InsertProductReview): Promise<ProductReview>;
  deleteProductReview(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private designersMap: Map<number, Designer>;
  private postsMap: Map<number, Post>;
  private likesMap: Map<number, Like>;
  private commentsMap: Map<number, Comment>;
  private messagesMap: Map<number, Message>;
  private userId: number;
  private designerId: number;
  private postId: number;
  private likeId: number;
  private commentId: number;
  private messageId: number;
  
  // Helper method to hash passwords
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  private productsMap: Map<number, Product>;
  private productReviewsMap: Map<number, ProductReview>;
  private productId: number;
  private productReviewId: number;

  constructor() {
    this.users = new Map();
    this.designersMap = new Map();
    this.postsMap = new Map();
    this.likesMap = new Map();
    this.commentsMap = new Map();
    this.messagesMap = new Map();
    this.productsMap = new Map();
    this.productReviewsMap = new Map();
    
    this.userId = 1;
    this.designerId = 1;
    this.postId = 1;
    this.likeId = 1;
    this.commentId = 1;
    this.messageId = 1;
    this.productId = 1;
    this.productReviewId = 1;
    
    // Initialize with some sample data
    this.initialize();
  }
  
  // Separate async initialization method
  private async initialize() {
    await this.initDesigners();
    await this.initPosts();
    await this.initProducts();
  }
  
  // Initialize sample products
  private async initProducts() {
    const designers = await this.getAllDesigners();
    
    // Create sample products for interior design marketplace
    const sampleProducts = [
      // Furniture category
      {
        sellerId: designers[0].userId,
        name: "Modern Leather Sofa",
        description: "Elegant leather sofa with minimalist design. Perfect for contemporary living spaces.",
        price: "1200.00",
        category: "furniture",
        subcategory: "sofa",
        tags: ["modern", "leather", "minimalist"],
        style: "Modern",
        material: "Leather",
        color: "Black",
        dimensions: { width: 220, height: 85, depth: 95, unit: "cm" },
        weight: "65",
        weightUnit: "kg",
        images: [
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1550254478-ead40cc54513?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
        ],
        inStock: true,
        stockQuantity: 5,
        featured: true
      },
      {
        sellerId: designers[1].userId,
        name: "Industrial Coffee Table",
        description: "Rustic industrial coffee table with metal frame and reclaimed wood top.",
        price: "350.00",
        category: "furniture",
        subcategory: "table",
        tags: ["industrial", "rustic", "coffee table"],
        style: "Industrial",
        material: "Metal and Wood",
        color: "Brown",
        dimensions: { width: 120, height: 45, depth: 70, unit: "cm" },
        weight: "25",
        weightUnit: "kg",
        images: [
          "https://images.unsplash.com/photo-1592078615290-033ee584e267?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
        ],
        inStock: true,
        stockQuantity: 8,
        featured: true
      },
      
      // Flooring category
      {
        sellerId: designers[2].userId,
        name: "Natural Oak Hardwood Flooring",
        description: "Premium oak hardwood flooring with natural finish. Durable and elegant for any room.",
        price: "85.00",
        category: "flooring",
        tags: ["hardwood", "oak", "natural"],
        style: "Traditional",
        material: "Oak",
        color: "Natural",
        dimensions: { width: 120, length: 1200, thickness: 15, unit: "mm" },
        images: [
          "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
        ],
        inStock: true,
        stockQuantity: 200,
        featured: false
      },
      
      // Lighting category
      {
        sellerId: designers[3].userId,
        name: "Pendant Chandelier Light",
        description: "Modern pendant chandelier with adjustable height. Creates a stunning visual focal point.",
        price: "420.00",
        discountPrice: "379.00",
        category: "lighting",
        subcategory: "chandelier",
        tags: ["pendant", "modern", "chandelier"],
        style: "Contemporary",
        material: "Metal and Glass",
        color: "Gold",
        dimensions: { diameter: 60, height: 100, unit: "cm" },
        weight: "8.5",
        weightUnit: "kg",
        images: [
          "https://images.unsplash.com/photo-1540932239986-30128078f3c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
        ],
        inStock: true,
        stockQuantity: 3,
        featured: true
      },
      
      // Decorations category
      {
        sellerId: designers[4].userId,
        name: "Macramé Wall Hanging",
        description: "Handcrafted macramé wall art made from 100% cotton rope. Perfect bohemian accent piece.",
        price: "89.00",
        category: "decorations",
        subcategory: "wall art",
        tags: ["macrame", "bohemian", "handcrafted"],
        style: "Bohemian",
        material: "Cotton",
        color: "Natural",
        dimensions: { width: 60, height: 90, unit: "cm" },
        weight: "0.8",
        weightUnit: "kg",
        images: [
          "https://images.unsplash.com/photo-1582643381929-645429a16892?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
        ],
        inStock: true,
        stockQuantity: 12,
        featured: false
      },
      
      // Building materials category
      {
        sellerId: designers[2].userId,
        name: "Marble Tile Collection",
        description: "Premium Carrara marble tiles for luxury bathrooms and kitchens. Natural variations make each piece unique.",
        price: "120.00",
        category: "building materials",
        subcategory: "tiles",
        tags: ["marble", "luxury", "tiles"],
        style: "Luxury",
        material: "Marble",
        color: "White",
        dimensions: { width: 30, length: 60, thickness: 1, unit: "cm" },
        weight: "1.8",
        weightUnit: "kg",
        images: [
          "https://images.unsplash.com/photo-1599619585752-c3edb42a414c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
        ],
        inStock: true,
        stockQuantity: 150,
        featured: true
      },
      
      // Windows category
      {
        sellerId: designers[3].userId,
        name: "Steel Frame Window",
        description: "Modern steel frame window with double-glazed glass. Energy efficient and stylish.",
        price: "850.00",
        category: "windows",
        tags: ["steel", "modern", "energy efficient"],
        style: "Industrial",
        material: "Steel and Glass",
        color: "Black",
        dimensions: { width: 120, height: 150, unit: "cm" },
        weight: "45",
        weightUnit: "kg",
        images: [
          "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
        ],
        inStock: true,
        stockQuantity: 4,
        featured: false
      },
      
      // Curtains category
      {
        sellerId: designers[4].userId,
        name: "Linen Blackout Curtains",
        description: "100% linen blackout curtains, perfect for bedroom or living room. Natural texture with modern functionality.",
        price: "135.00",
        category: "curtains",
        tags: ["linen", "blackout", "natural"],
        style: "Scandinavian",
        material: "Linen",
        color: "Sage Green",
        dimensions: { width: 140, height: 250, unit: "cm" },
        weight: "2.2",
        weightUnit: "kg",
        images: [
          "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
        ],
        inStock: true,
        stockQuantity: 20,
        featured: false
      }
    ];
    
    // Create products
    for (const product of sampleProducts) {
      await this.createProduct(product as InsertProduct);
    }
  }

  private async initDesigners() {
    // First create sample users
    const sampleUsers: InsertUser[] = [
      {
        username: "emma_rodriguez",
        email: "emma@example.com",
        password: "password123",
        confirmPassword: "password123",
        name: "Emma Rodriguez",
        profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        userType: "designer"
      },
      {
        username: "daniel_park",
        email: "daniel@example.com",
        password: "password123",
        confirmPassword: "password123",
        name: "Daniel Park",
        profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        userType: "designer"
      },
      {
        username: "olivia_thompson",
        email: "olivia@example.com",
        password: "password123",
        confirmPassword: "password123",
        name: "Olivia Thompson",
        profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        userType: "designer"
      },
      {
        username: "james_wilson",
        email: "james@example.com",
        password: "password123",
        confirmPassword: "password123",
        name: "James Wilson",
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        userType: "designer"
      },
      {
        username: "sophia_nguyen",
        email: "sophia@example.com",
        password: "password123",
        confirmPassword: "password123",
        name: "Sophia Nguyen",
        profileImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        userType: "designer"
      },
      {
        username: "guest_user",
        email: "guest@example.com",
        password: "guestpass",
        confirmPassword: "guestpass",
        name: "Guest User",
        profileImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        userType: "user"
      },
      {
        username: "marcus_johnson",
        email: "marcus@example.com",
        password: "password123",
        confirmPassword: "password123",
        name: "Marcus Johnson",
        profileImage: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        userType: "designer"
      }
    ];
    
    // Create users and store their IDs
    const createdUsers = await Promise.all(
      sampleUsers.map(user => this.createUser(user))
    );
    
    // Now create designer profiles linked to user accounts
    const sampleDesigners = [
      {
        userId: createdUsers[0].id,
        name: "Emma Rodriguez",
        profileImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        title: "Senior Interior Designer",
        bio: "Award-winning interior designer with over 10 years of experience specializing in modern, functional spaces with a focus on sustainability.",
        style: "Modern Minimalist",
        description: "Award-winning interior designer specializing in modern, functional spaces with a focus on sustainability.",
        hourlyRate: 150,
        rating: 5,
        reviewCount: 87,
        location: "New York",
        portfolioImages: [
          "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1618220048045-10a6dbdf83e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
        ],
        features: { sustainable: true, commercial: true, residential: true },
        socialLinks: { instagram: "emma_design", twitter: "emmarodriguez" },
        services: ["Interior Design", "Space Planning", "Color Consultation", "Sustainable Design"]
      },
      {
        userId: createdUsers[1].id,
        name: "Daniel Park",
        profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        title: "Industrial Design Specialist",
        bio: "Specializing in industrial-inspired spaces with a focus on repurposed materials and urban aesthetics for both commercial and residential clients.",
        style: "Urban Industrial",
        description: "Specializing in industrial-inspired spaces with a focus on repurposed materials and urban aesthetics.",
        hourlyRate: 200,
        rating: 4.8,
        reviewCount: 62,
        location: "Los Angeles",
        portfolioImages: [
          "https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1616046229478-9901c5536a45?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80",
          "https://images.unsplash.com/photo-1601845727893-800d5f283613?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"
        ],
        features: { sustainable: false, commercial: true, residential: true },
        socialLinks: { instagram: "daniel_design", linkedin: "danielpark" },
        services: ["Custom Furniture", "Commercial Design", "Interior Design", "Space Planning"]
      },
      {
        userId: createdUsers[2].id,
        name: "Olivia Thompson",
        profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        title: "Scandinavian Design Expert",
        bio: "Creating light-filled, functional spaces with Scandinavian influence. Focus on natural materials and comfort for residential clients.",
        style: "Scandinavian Inspired",
        description: "Creating light-filled, functional spaces with Scandinavian influence. Focus on natural materials and comfort.",
        hourlyRate: 120,
        rating: 4.9,
        reviewCount: 73,
        location: "Chicago",
        portfolioImages: ["https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        features: { sustainable: true, commercial: false, residential: true },
        socialLinks: { instagram: "olivia_design", pinterest: "oliviathompson" },
        services: ["Interior Design", "Lighting Design", "Color Consultation", "Home Staging"]
      },
      {
        userId: createdUsers[3].id,
        name: "James Wilson",
        profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        title: "Luxury Interior Architect",
        bio: "Luxury-focused designer specializing in high-end residential and commercial spaces with meticulous attention to detail and premium materials.",
        style: "Contemporary Luxury",
        description: "Luxury-focused designer specializing in high-end residential and commercial spaces with attention to detail.",
        hourlyRate: 175,
        rating: 4.7,
        reviewCount: 56,
        location: "Miami",
        portfolioImages: ["https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        features: { sustainable: false, commercial: true, residential: true },
        socialLinks: { instagram: "james_design", facebook: "jameswilson" },
        services: ["Kitchen Design", "Bathroom Design", "Interior Design", "Commercial Design"]
      },
      {
        userId: createdUsers[4].id,
        name: "Sophia Nguyen",
        profileImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        title: "Eclectic Design Consultant",
        bio: "Creative designer specializing in bohemian and eclectic spaces with a focus on sustainable and vintage elements for unique, personalized homes.",
        style: "Eclectic & Bohemian",
        description: "Creative designer specializing in bohemian and eclectic spaces with a focus on sustainable and vintage elements.",
        hourlyRate: 90,
        rating: 5,
        reviewCount: 92,
        location: "Remote Only",
        portfolioImages: ["https://images.unsplash.com/photo-1567016432779-094069958ea5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        features: { sustainable: true, commercial: true, residential: true },
        socialLinks: { instagram: "sophia_design", etsy: "sophianguyen" },
        services: ["Interior Design", "Color Consultation", "Space Planning", "Home Staging"]
      },
      {
        userId: createdUsers[5].id,
        name: "Marcus Johnson",
        profileImage: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
        title: "Mid-Century Modern Specialist",
        bio: "Specializing in mid-century modern design with contemporary touches. Expert in space planning and furniture selection for stylish living spaces.",
        style: "Mid-Century Modern",
        description: "Specializing in mid-century modern design with contemporary touches. Expert in space planning and furniture selection.",
        hourlyRate: 130,
        rating: 4.6,
        reviewCount: 48,
        location: "Chicago",
        portfolioImages: ["https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80"],
        features: { sustainable: false, commercial: false, residential: true },
        socialLinks: { instagram: "marcus_design", houzz: "marcusjohnson" },
        services: ["Custom Furniture", "Interior Design", "Space Planning"]
      }
    ];

    // Create designer profiles
    for (const designer of sampleDesigners) {
      await this.createDesigner(designer);
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { confirmPassword, ...userData } = insertUser;
    
    // Hash the password
    const hashedPassword = await this.hashPassword(userData.password);
    
    const id = this.userId++;
    const now = new Date();
    
    const user: User = { 
      id,
      username: userData.username,
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      profileImage: userData.profileImage || null,
      userType: userData.userType || 'client',
      createdAt: now 
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    // If updating password, hash it
    if (userData.password) {
      userData.password = await this.hashPassword(userData.password);
    }
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async validateUserPassword(username: string, password: string): Promise<User | undefined> {
    try {
      const user = await this.getUserByUsername(username);
      if (!user) return undefined;
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return undefined;
      
      return user;
    } catch (error) {
      console.error('Password validation error:', error);
      return undefined;
    }
  }
  
  async getUserDesignerProfile(userId: number): Promise<Designer | undefined> {
    return Array.from(this.designersMap.values()).find(
      designer => designer.userId === userId
    );
  }

  async getAllDesigners(): Promise<Designer[]> {
    return Array.from(this.designersMap.values());
  }

  async getDesignerById(id: number): Promise<Designer | undefined> {
    return this.designersMap.get(id);
  }
  
  async getDesignerByUserId(userId: number): Promise<Designer | undefined> {
    return Array.from(this.designersMap.values()).find(
      designer => designer.userId === userId
    );
  }

  async createDesigner(insertDesigner: InsertDesigner): Promise<Designer> {
    const id = this.designerId++;
    const now = new Date();
    
    // Create designer with proper types
    const designer: Designer = { 
      id,
      userId: insertDesigner.userId,
      name: insertDesigner.name,
      profileImage: insertDesigner.profileImage,
      style: insertDesigner.style,
      description: insertDesigner.description,
      hourlyRate: insertDesigner.hourlyRate,
      rating: insertDesigner.rating,
      reviewCount: insertDesigner.reviewCount,
      location: insertDesigner.location,
      portfolioImages: insertDesigner.portfolioImages,
      features: insertDesigner.features,
      socialLinks: insertDesigner.socialLinks,
      title: insertDesigner.title || null,
      bio: insertDesigner.bio || null,
      services: insertDesigner.services || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.designersMap.set(id, designer);
    return designer;
  }
  
  async updateDesigner(id: number, designerData: UpdateDesigner): Promise<Designer | undefined> {
    const designer = this.designersMap.get(id);
    if (!designer) return undefined;
    
    const updatedDesigner: Designer = { 
      ...designer, 
      ...designerData,
      updatedAt: new Date()
    };
    
    this.designersMap.set(id, updatedDesigner);
    return updatedDesigner;
  }

  async getDesignersByStyle(style: string): Promise<Designer[]> {
    return Array.from(this.designersMap.values()).filter(
      designer => designer.style.toLowerCase().includes(style.toLowerCase())
    );
  }

  async getDesignersByPriceRange(min: number, max: number): Promise<Designer[]> {
    return Array.from(this.designersMap.values()).filter(
      designer => designer.hourlyRate >= min && designer.hourlyRate <= max
    );
  }

  async getDesignersByLocation(location: string): Promise<Designer[]> {
    return Array.from(this.designersMap.values()).filter(
      designer => designer.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  private async initPosts() {
    const designers = await this.getAllDesigners();
    
    // Create sample posts for each designer
    for (const designer of designers) {
      const portfolioImages = designer.portfolioImages || [];
      
      for (let i = 0; i < portfolioImages.length; i++) {
        const post = await this.createPost({
          designerId: designer.id,
          title: `${designer.style} Design Project ${i + 1}`,
          content: `A stunning ${designer.style.toLowerCase()} design project by ${designer.name}. ${designer.description}`,
          image: portfolioImages[i]
        });
        
        // Add some random likes
        const numLikes = Math.floor(Math.random() * 20) + 5;
        for (let j = 1; j <= numLikes; j++) {
          // Ensure we don't exceed user count (cyclic)
          const userId = (j % this.userId) || 1;
          
          await this.createLike({
            postId: post.id,
            userId
          });
        }
        
        // Add some random comments
        const numComments = Math.floor(Math.random() * 5) + 1;
        const commentTexts = [
          "Beautiful design! Love the attention to detail.",
          "The color palette is perfect for this space.",
          "I'd love to have something like this in my home.",
          "Amazing work! Your style is so distinctive.",
          "How much would a project like this cost?",
          "What materials did you use for this?",
          "The lighting in this space is fantastic!",
          "I'm impressed by your use of space.",
          "Is this residential or commercial?",
          "Would love to collaborate sometime!"
        ];
        
        for (let j = 1; j <= numComments; j++) {
          // Ensure we don't exceed user count (cyclic)
          const userId = (j % this.userId) || 1;
          const commentIndex = Math.floor(Math.random() * commentTexts.length);
          
          await this.createComment({
            postId: post.id,
            userId,
            content: commentTexts[commentIndex]
          });
        }
      }
    }
  }
  
  // Post methods
  async getAllPosts(): Promise<Post[]> {
    return Array.from(this.postsMap.values());
  }
  
  async getPostById(id: number): Promise<Post | undefined> {
    return this.postsMap.get(id);
  }
  
  async getPostsByDesignerId(designerId: number): Promise<Post[]> {
    return Array.from(this.postsMap.values()).filter(
      post => post.designerId === designerId
    );
  }
  
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postId++;
    const now = new Date();
    
    const post: Post = {
      id,
      designerId: insertPost.designerId,
      title: insertPost.title,
      content: insertPost.content,
      image: insertPost.image || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.postsMap.set(id, post);
    return post;
  }
  
  async updatePost(id: number, postData: Partial<Post>): Promise<Post | undefined> {
    const post = this.postsMap.get(id);
    if (!post) return undefined;
    
    const updatedPost: Post = {
      ...post,
      ...postData,
      updatedAt: new Date()
    };
    
    this.postsMap.set(id, updatedPost);
    return updatedPost;
  }
  
  async deletePost(id: number): Promise<boolean> {
    return this.postsMap.delete(id);
  }
  
  // Like methods
  async getLikesByPostId(postId: number): Promise<Like[]> {
    return Array.from(this.likesMap.values()).filter(
      like => like.postId === postId
    );
  }
  
  async getLikeByUserAndPost(userId: number, postId: number): Promise<Like | undefined> {
    return Array.from(this.likesMap.values()).find(
      like => like.userId === userId && like.postId === postId
    );
  }
  
  async createLike(insertLike: InsertLike): Promise<Like> {
    const id = this.likeId++;
    const now = new Date();
    
    const like: Like = {
      id,
      postId: insertLike.postId,
      userId: insertLike.userId,
      createdAt: now
    };
    
    this.likesMap.set(id, like);
    return like;
  }
  
  async deleteLike(id: number): Promise<boolean> {
    return this.likesMap.delete(id);
  }
  
  // Comment methods
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return Array.from(this.commentsMap.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => {
        const timeA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return timeA - timeB;
      });
  }
  
  async getCommentById(id: number): Promise<Comment | undefined> {
    return this.commentsMap.get(id);
  }
  
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const now = new Date();
    
    const comment: Comment = {
      id,
      postId: insertComment.postId,
      userId: insertComment.userId,
      content: insertComment.content,
      createdAt: now,
      updatedAt: now
    };
    
    this.commentsMap.set(id, comment);
    return comment;
  }
  
  async updateComment(id: number, commentData: Partial<Comment>): Promise<Comment | undefined> {
    const comment = this.commentsMap.get(id);
    if (!comment) return undefined;
    
    const updatedComment: Comment = {
      ...comment,
      ...commentData,
      updatedAt: new Date()
    };
    
    this.commentsMap.set(id, updatedComment);
    return updatedComment;
  }
  
  async deleteComment(id: number): Promise<boolean> {
    return this.commentsMap.delete(id);
  }

  // Message methods
  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messagesMap.values()).filter(
      message => 
        (message.senderId === userId1 && message.receiverId === userId2) ||
        (message.senderId === userId2 && message.receiverId === userId1)
    ).sort((a, b) => 
      a.createdAt && b.createdAt 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : 0
    );
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messagesMap.values()).filter(
      message => message.senderId === userId || message.receiverId === userId
    ).sort((a, b) => 
      a.createdAt && b.createdAt 
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : 0
    );
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.messagesMap.values()).filter(
      message => message.receiverId === userId && !message.read
    ).length;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageId++;
    const now = new Date();
    
    const newMessage: Message = {
      id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      read: false,
      createdAt: now
    };
    
    this.messagesMap.set(id, newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    const message = this.messagesMap.get(id);
    if (!message) return undefined;
    
    const updatedMessage: Message = {
      ...message,
      read: true
    };
    
    this.messagesMap.set(id, updatedMessage);
    return updatedMessage;
  }

  async deleteMessage(id: number): Promise<boolean> {
    if (!this.messagesMap.has(id)) return false;
    return this.messagesMap.delete(id);
  }

  // Products methods implementation
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.productsMap.values());
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.productsMap.get(id);
  }

  async getProductsBySellerId(sellerId: number): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(
      product => product.sellerId === sellerId
    );
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(
      product => product.category.toLowerCase() === category.toLowerCase()
    );
  }

  async getProductsBySubcategory(subcategory: string): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(
      product => product.subcategory?.toLowerCase() === subcategory.toLowerCase()
    );
  }

  async getProductsByStyle(style: string): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(
      product => product.style?.toLowerCase() === style.toLowerCase()
    );
  }

  async getProductsByPriceRange(min: number, max: number): Promise<Product[]> {
    return Array.from(this.productsMap.values()).filter(
      product => {
        const price = product.discountPrice ? Number(product.discountPrice) : Number(product.price);
        return price >= min && price <= max;
      }
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.productsMap.values()).filter(product => {
      // Search in name, description, category, subcategory, style, material, color, and tags
      return (
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery) ||
        (product.subcategory && product.subcategory.toLowerCase().includes(lowercaseQuery)) ||
        (product.style && product.style.toLowerCase().includes(lowercaseQuery)) ||
        (product.material && product.material.toLowerCase().includes(lowercaseQuery)) ||
        (product.color && product.color.toLowerCase().includes(lowercaseQuery)) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
      );
    });
  }

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const featuredProducts = Array.from(this.productsMap.values())
      .filter(product => product.featured)
      .sort((a, b) => Number(b.rating) - Number(a.rating));
    
    return limit ? featuredProducts.slice(0, limit) : featuredProducts;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const now = new Date();
    
    const newProduct: Product = {
      id,
      sellerId: product.sellerId,
      name: product.name,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || null,
      category: product.category,
      subcategory: product.subcategory || null,
      tags: product.tags || [],
      style: product.style || null,
      material: product.material || null,
      color: product.color || null,
      dimensions: product.dimensions || null,
      weight: product.weight || null,
      weightUnit: product.weightUnit || null,
      images: product.images,
      inStock: product.inStock === undefined ? true : product.inStock,
      stockQuantity: product.stockQuantity || null,
      featured: product.featured === undefined ? false : product.featured,
      rating: null,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now
    };
    
    this.productsMap.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, productData: UpdateProduct): Promise<Product | undefined> {
    const product = this.productsMap.get(id);
    if (!product) return undefined;
    
    const updatedProduct: Product = {
      ...product,
      ...productData,
      updatedAt: new Date()
    };
    
    this.productsMap.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    if (!this.productsMap.has(id)) return false;
    return this.productsMap.delete(id);
  }

  // Product Review methods implementation
  async getReviewsByProductId(productId: number): Promise<ProductReview[]> {
    return Array.from(this.productReviewsMap.values()).filter(
      review => review.productId === productId
    );
  }

  async createProductReview(review: InsertProductReview): Promise<ProductReview> {
    const id = this.productReviewId++;
    const now = new Date();
    
    const newReview: ProductReview = {
      id,
      productId: review.productId,
      userId: review.userId,
      rating: review.rating,
      comment: review.comment || null,
      createdAt: now,
      updatedAt: now
    };
    
    this.productReviewsMap.set(id, newReview);
    
    // Update product rating
    const product = this.productsMap.get(review.productId);
    if (product) {
      const productReviews = await this.getReviewsByProductId(review.productId);
      const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = Number((totalRating / productReviews.length).toFixed(1));
      
      const updatedProduct: Product = {
        ...product,
        rating: String(averageRating),
        reviewCount: productReviews.length,
        updatedAt: new Date()
      };
      
      this.productsMap.set(review.productId, updatedProduct);
    }
    
    return newReview;
  }

  async deleteProductReview(id: number): Promise<boolean> {
    const review = this.productReviewsMap.get(id);
    if (!review) return false;
    
    const deleted = this.productReviewsMap.delete(id);
    
    if (deleted) {
      // Update product rating
      const product = this.productsMap.get(review.productId);
      if (product) {
        const productReviews = await this.getReviewsByProductId(review.productId);
        
        if (productReviews.length === 0) {
          const updatedProduct: Product = {
            ...product,
            rating: null,
            reviewCount: 0,
            updatedAt: new Date()
          };
          
          this.productsMap.set(review.productId, updatedProduct);
        } else {
          const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = Number((totalRating / productReviews.length).toFixed(1));
          
          const updatedProduct: Product = {
            ...product,
            rating: String(averageRating),
            reviewCount: productReviews.length,
            updatedAt: new Date()
          };
          
          this.productsMap.set(review.productId, updatedProduct);
        }
      }
    }
    
    return deleted;
  }
}

export const storage = new MemStorage();
