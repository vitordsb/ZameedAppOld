import Database from 'better-sqlite3';
import { IStorage } from './storage';
import bcrypt from 'bcryptjs';

export class SQLiteStorage implements IStorage {
  private db: Database.Database;

  constructor() {
    this.db = new Database('zameed.db');
    this.initializeTables();
    this.initializeSampleData();
  }

  private initializeTables() {
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        profileImage TEXT,
        userType TEXT NOT NULL DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS designers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        name TEXT NOT NULL,
        profileImage TEXT,
        title TEXT,
        bio TEXT,
        style TEXT,
        description TEXT,
        hourlyRate REAL,
        rating REAL DEFAULT 0,
        reviewCount INTEGER DEFAULT 0,
        location TEXT,
        portfolioImages TEXT, -- JSON array
        specialties TEXT, -- JSON array
        experienceYears INTEGER,
        education TEXT,
        certifications TEXT, -- JSON array
        languages TEXT, -- JSON array
        availabilityStatus TEXT DEFAULT 'available',
        responseTime TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        designerId INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        images TEXT, -- JSON array
        tags TEXT, -- JSON array
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (designerId) REFERENCES designers(id)
      );

      CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        postId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (postId) REFERENCES posts(id),
        FOREIGN KEY (userId) REFERENCES users(id),
        UNIQUE(postId, userId)
      );

      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        postId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        content TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (postId) REFERENCES posts(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        senderId INTEGER NOT NULL,
        receiverId INTEGER NOT NULL,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (senderId) REFERENCES users(id),
        FOREIGN KEY (receiverId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sellerId INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        subcategory TEXT,
        style TEXT,
        images TEXT, -- JSON array
        featured BOOLEAN DEFAULT FALSE,
        inStock BOOLEAN DEFAULT TRUE,
        stockQuantity INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sellerId) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS product_reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);
  }

  private initializeSampleData() {
    // Check if data already exists
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (userCount.count > 0) return;

    // Insert sample users
    const insertUser = this.db.prepare(`
      INSERT INTO users (username, email, password, name, userType)
      VALUES (?, ?, ?, ?, ?)
    `);

    const adminId = insertUser.run('admin', 'admin@zameed.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin').lastInsertRowid;
    const guestId = insertUser.run('guest_user', 'guest@zameed.com', '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'Guest User', 'user').lastInsertRowid;
    const designerId = insertUser.run('test_designer', 'designer@zameed.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test Designer', 'designer').lastInsertRowid;

    // Insert designer profile
    const insertDesigner = this.db.prepare(`
      INSERT INTO designers (userId, name, title, bio, style, description, hourlyRate, rating, reviewCount, location, portfolioImages, specialties, experienceYears, education, certifications, languages, availabilityStatus, responseTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const designerProfileId = insertDesigner.run(
      designerId,
      'Test Designer',
      'Senior Interior Designer',
      'Experienced interior designer specializing in modern and contemporary styles.',
      'Modern',
      'I create beautiful, functional spaces that reflect your personality and lifestyle.',
      100,
      4.8,
      25,
      'Lisboa, Portugal',
      JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2']),
      JSON.stringify(['Interior Design', 'Space Planning', 'Color Consultation']),
      8,
      'Master in Interior Design - Universidade de Lisboa',
      JSON.stringify(['NCIDQ Certified', 'LEED AP']),
      JSON.stringify(['Portuguese', 'English', 'Spanish']),
      'available',
      '2 hours'
    ).lastInsertRowid;

    // Insert sample posts
    const insertPost = this.db.prepare(`
      INSERT INTO posts (designerId, title, content, images, tags)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertPost.run(
      designerProfileId,
      'Modern Living Room Transformation',
      'Check out this amazing living room transformation! We focused on clean lines, neutral colors, and natural light to create a serene and sophisticated space.',
      JSON.stringify(['https://images.unsplash.com/photo-1586023492125-27b2c045efd7', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2']),
      JSON.stringify(['modern', 'living room', 'transformation'])
    );

    // Insert sample products
    const insertProduct = this.db.prepare(`
      INSERT INTO products (sellerId, name, description, price, category, subcategory, style, images, featured, inStock, stockQuantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertProduct.run(
      designerId,
      'Modern Minimalist Chair',
      'A beautifully crafted minimalist chair perfect for modern interiors. Made with sustainable materials and designed for comfort.',
      299.99,
      'Furniture',
      'Chairs',
      'Modern',
      JSON.stringify(['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237']),
      1,
      1,
      15
    );

    // Insert sample messages
    const insertMessage = this.db.prepare(`
      INSERT INTO messages (senderId, receiverId, content)
      VALUES (?, ?, ?)
    `);

    insertMessage.run(
      guestId,
      designerId,
      'Hi! I\'m interested in your interior design services. Could we schedule a consultation?'
    );

    console.log('✅ Sample data initialized in SQLite database');
  }

  // User methods
  async getAllUsers() {
    const stmt = this.db.prepare('SELECT * FROM users ORDER BY createdAt DESC');
    return stmt.all().map(this.parseUser);
  }

  async getUser(id: number) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const user = stmt.get(id);
    return user ? this.parseUser(user) : undefined;
  }

  async getUserByUsername(username: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);
    return user ? this.parseUser(user) : undefined;
  }

  async getUserByEmail(email: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);
    return user ? this.parseUser(user) : undefined;
  }

  async createUser(userData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password, name, profileImage, userType)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      userData.username,
      userData.email,
      userData.password,
      userData.name,
      userData.profileImage || null,
      userData.userType || 'user'
    );
    
    return this.getUser(result.lastInsertRowid as number);
  }

  async updateUser(id: number, userData: any) {
    const fields = [];
    const values = [];
    
    if (userData.name !== undefined) {
      fields.push('name = ?');
      values.push(userData.name);
    }
    if (userData.email !== undefined) {
      fields.push('email = ?');
      values.push(userData.email);
    }
    if (userData.profileImage !== undefined) {
      fields.push('profileImage = ?');
      values.push(userData.profileImage);
    }
    if (userData.userType !== undefined) {
      fields.push('userType = ?');
      values.push(userData.userType);
    }
    
    if (fields.length === 0) return this.getUser(id);
    
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    return this.getUser(id);
  }

  async validateUserPassword(username: string, password: string) {
    const user = await this.getUserByUsername(username);
    if (!user) return undefined;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return undefined;
  }

  async getUserDesignerProfile(userId: number) {
    return this.getDesignerByUserId(userId);
  }

  // Designer methods
  async getAllDesigners() {
    const stmt = this.db.prepare('SELECT * FROM designers ORDER BY createdAt DESC');
    return stmt.all().map(this.parseDesigner);
  }

  async getDesignerById(id: number) {
    const stmt = this.db.prepare('SELECT * FROM designers WHERE id = ?');
    const designer = stmt.get(id);
    return designer ? this.parseDesigner(designer) : undefined;
  }

  async getDesignerByUserId(userId: number) {
    const stmt = this.db.prepare('SELECT * FROM designers WHERE userId = ?');
    const designer = stmt.get(userId);
    return designer ? this.parseDesigner(designer) : undefined;
  }

  async createDesigner(designerData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO designers (userId, name, profileImage, title, bio, style, description, hourlyRate, rating, reviewCount, location, portfolioImages, specialties, experienceYears, education, certifications, languages, availabilityStatus, responseTime)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      designerData.userId,
      designerData.name,
      designerData.profileImage || null,
      designerData.title || null,
      designerData.bio || null,
      designerData.style || null,
      designerData.description || null,
      designerData.hourlyRate || 0,
      designerData.rating || 0,
      designerData.reviewCount || 0,
      designerData.location || null,
      JSON.stringify(designerData.portfolioImages || []),
      JSON.stringify(designerData.specialties || []),
      designerData.experienceYears || 0,
      designerData.education || null,
      JSON.stringify(designerData.certifications || []),
      JSON.stringify(designerData.languages || []),
      designerData.availabilityStatus || 'available',
      designerData.responseTime || null
    );
    
    return this.getDesignerById(result.lastInsertRowid as number);
  }

  async updateDesigner(id: number, designerData: any) {
    const fields = [];
    const values = [];
    
    Object.keys(designerData).forEach(key => {
      if (designerData[key] !== undefined) {
        if (['portfolioImages', 'specialties', 'certifications', 'languages'].includes(key)) {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(designerData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(designerData[key]);
        }
      }
    });
    
    if (fields.length === 0) return this.getDesignerById(id);
    
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE designers SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    return this.getDesignerById(id);
  }

  async getDesignersByStyle(style: string) {
    const stmt = this.db.prepare('SELECT * FROM designers WHERE style LIKE ?');
    return stmt.all(`%${style}%`).map(this.parseDesigner);
  }

  async getDesignersByPriceRange(min: number, max: number) {
    const stmt = this.db.prepare('SELECT * FROM designers WHERE hourlyRate BETWEEN ? AND ?');
    return stmt.all(min, max).map(this.parseDesigner);
  }

  async getDesignersByLocation(location: string) {
    const stmt = this.db.prepare('SELECT * FROM designers WHERE location LIKE ?');
    return stmt.all(`%${location}%`).map(this.parseDesigner);
  }

  // Post methods
  async getAllPosts() {
    const stmt = this.db.prepare('SELECT * FROM posts ORDER BY createdAt DESC');
    return stmt.all().map(this.parsePost);
  }

  async getPostById(id: number) {
    const stmt = this.db.prepare('SELECT * FROM posts WHERE id = ?');
    const post = stmt.get(id);
    return post ? this.parsePost(post) : undefined;
  }

  async getPostsByDesignerId(designerId: number) {
    const stmt = this.db.prepare('SELECT * FROM posts WHERE designerId = ? ORDER BY createdAt DESC');
    return stmt.all(designerId).map(this.parsePost);
  }

  async createPost(postData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO posts (designerId, title, content, images, tags)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      postData.designerId,
      postData.title,
      postData.content || null,
      JSON.stringify(postData.images || []),
      JSON.stringify(postData.tags || [])
    );
    
    return this.getPostById(result.lastInsertRowid as number);
  }

  async updatePost(id: number, postData: any) {
    const fields = [];
    const values = [];
    
    Object.keys(postData).forEach(key => {
      if (postData[key] !== undefined) {
        if (['images', 'tags'].includes(key)) {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(postData[key]));
        } else {
          fields.push(`${key} = ?`);
          values.push(postData[key]);
        }
      }
    });
    
    if (fields.length === 0) return this.getPostById(id);
    
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    return this.getPostById(id);
  }

  async deletePost(id: number) {
    const stmt = this.db.prepare('DELETE FROM posts WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Like methods
  async getLikesByPostId(postId: number) {
    const stmt = this.db.prepare('SELECT * FROM likes WHERE postId = ?');
    return stmt.all(postId);
  }

  async getLikeByUserAndPost(userId: number, postId: number) {
    const stmt = this.db.prepare('SELECT * FROM likes WHERE userId = ? AND postId = ?');
    return stmt.get(userId, postId);
  }

  async createLike(likeData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO likes (postId, userId)
      VALUES (?, ?)
    `);
    
    const result = stmt.run(likeData.postId, likeData.userId);
    return { id: result.lastInsertRowid, ...likeData, createdAt: new Date() };
  }

  async deleteLike(id: number) {
    const stmt = this.db.prepare('DELETE FROM likes WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Comment methods
  async getCommentsByPostId(postId: number) {
    const stmt = this.db.prepare(`
      SELECT c.*, u.name as userName, u.profileImage as userProfileImage
      FROM comments c
      JOIN users u ON c.userId = u.id
      WHERE c.postId = ?
      ORDER BY c.createdAt ASC
    `);
    return stmt.all(postId);
  }

  async getCommentById(id: number) {
    const stmt = this.db.prepare('SELECT * FROM comments WHERE id = ?');
    return stmt.get(id);
  }

  async createComment(commentData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO comments (postId, userId, content)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(commentData.postId, commentData.userId, commentData.content);
    return { id: result.lastInsertRowid, ...commentData, createdAt: new Date(), updatedAt: new Date() };
  }

  async updateComment(id: number, commentData: any) {
    const stmt = this.db.prepare('UPDATE comments SET content = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(commentData.content, id);
    return this.getCommentById(id);
  }

  async deleteComment(id: number) {
    const stmt = this.db.prepare('DELETE FROM comments WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Message methods
  async getConversation(userId1: number, userId2: number) {
    const stmt = this.db.prepare(`
      SELECT m.*, 
             s.name as senderName, s.profileImage as senderProfileImage,
             r.name as receiverName, r.profileImage as receiverProfileImage
      FROM messages m
      JOIN users s ON m.senderId = s.id
      JOIN users r ON m.receiverId = r.id
      WHERE (m.senderId = ? AND m.receiverId = ?) OR (m.senderId = ? AND m.receiverId = ?)
      ORDER BY m.createdAt ASC
    `);
    return stmt.all(userId1, userId2, userId2, userId1);
  }

  async getMessagesByUser(userId: number) {
    const stmt = this.db.prepare(`
      SELECT m.*, 
             s.name as senderName, s.profileImage as senderProfileImage,
             r.name as receiverName, r.profileImage as receiverProfileImage
      FROM messages m
      JOIN users s ON m.senderId = s.id
      JOIN users r ON m.receiverId = r.id
      WHERE m.senderId = ? OR m.receiverId = ?
      ORDER BY m.createdAt DESC
    `);
    return stmt.all(userId, userId);
  }

  async getUnreadMessageCount(userId: number) {
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM messages WHERE receiverId = ? AND read = 0');
    const result = stmt.get(userId) as { count: number };
    return result.count;
  }

  async createMessage(messageData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO messages (senderId, receiverId, content)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(messageData.senderId, messageData.receiverId, messageData.content);
    return { id: result.lastInsertRowid, ...messageData, read: false, createdAt: new Date(), updatedAt: new Date() };
  }

  async markMessageAsRead(id: number) {
    const stmt = this.db.prepare('UPDATE messages SET read = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
    
    const getStmt = this.db.prepare('SELECT * FROM messages WHERE id = ?');
    return getStmt.get(id);
  }

  async deleteMessage(id: number) {
    const stmt = this.db.prepare('DELETE FROM messages WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Product methods
  async getAllProducts() {
    const stmt = this.db.prepare('SELECT * FROM products ORDER BY createdAt DESC');
    return stmt.all().map(this.parseProduct);
  }

  async getProductById(id: number) {
    const stmt = this.db.prepare('SELECT * FROM products WHERE id = ?');
    const product = stmt.get(id);
    return product ? this.parseProduct(product) : undefined;
  }

  async getProductsBySellerId(sellerId: number) {
    const stmt = this.db.prepare('SELECT * FROM products WHERE sellerId = ? ORDER BY createdAt DESC');
    return stmt.all(sellerId).map(this.parseProduct);
  }

  async getProductsByCategory(category: string) {
    const stmt = this.db.prepare('SELECT * FROM products WHERE category = ? ORDER BY createdAt DESC');
    return stmt.all(category).map(this.parseProduct);
  }

  async getProductsBySubcategory(subcategory: string) {
    const stmt = this.db.prepare('SELECT * FROM products WHERE subcategory = ? ORDER BY createdAt DESC');
    return stmt.all(subcategory).map(this.parseProduct);
  }

  async getProductsByStyle(style: string) {
    const stmt = this.db.prepare('SELECT * FROM products WHERE style LIKE ? ORDER BY createdAt DESC');
    return stmt.all(`%${style}%`).map(this.parseProduct);
  }

  async getProductsByPriceRange(min: number, max: number) {
    const stmt = this.db.prepare('SELECT * FROM products WHERE price BETWEEN ? AND ? ORDER BY createdAt DESC');
    return stmt.all(min, max).map(this.parseProduct);
  }

  async searchProducts(query: string) {
    const stmt = this.db.prepare(`
      SELECT * FROM products 
      WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
      ORDER BY createdAt DESC
    `);
    const searchTerm = `%${query}%`;
    return stmt.all(searchTerm, searchTerm, searchTerm).map(this.parseProduct);
  }

  async getFeaturedProducts(limit?: number) {
    let stmt;
    if (limit) {
      stmt = this.db.prepare('SELECT * FROM products WHERE featured = 1 ORDER BY createdAt DESC LIMIT ?');
      return stmt.all(limit).map(this.parseProduct);
    } else {
      stmt = this.db.prepare('SELECT * FROM products WHERE featured = 1 ORDER BY createdAt DESC');
      return stmt.all().map(this.parseProduct);
    }
  }

  async createProduct(productData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO products (sellerId, name, description, price, category, subcategory, style, images, featured, inStock, stockQuantity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      productData.sellerId,
      productData.name,
      productData.description || null,
      productData.price,
      productData.category,
      productData.subcategory || null,
      productData.style || null,
      JSON.stringify(productData.images || []),
      productData.featured ? 1 : 0,
      productData.inStock ? 1 : 0,
      productData.stockQuantity || 0
    );
    
    return this.getProductById(result.lastInsertRowid as number);
  }

  async updateProduct(id: number, productData: any) {
    const fields = [];
    const values = [];
    
    Object.keys(productData).forEach(key => {
      if (productData[key] !== undefined) {
        if (key === 'images') {
          fields.push(`${key} = ?`);
          values.push(JSON.stringify(productData[key]));
        } else if (['featured', 'inStock'].includes(key)) {
          fields.push(`${key} = ?`);
          values.push(productData[key] ? 1 : 0);
        } else {
          fields.push(`${key} = ?`);
          values.push(productData[key]);
        }
      }
    });
    
    if (fields.length === 0) return this.getProductById(id);
    
    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    return this.getProductById(id);
  }

  async deleteProduct(id: number) {
    const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Product Review methods
  async getReviewsByProductId(productId: number) {
    const stmt = this.db.prepare(`
      SELECT pr.*, u.name as userName, u.profileImage as userProfileImage
      FROM product_reviews pr
      JOIN users u ON pr.userId = u.id
      WHERE pr.productId = ?
      ORDER BY pr.createdAt DESC
    `);
    return stmt.all(productId);
  }

  async createProductReview(reviewData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO product_reviews (productId, userId, rating, comment)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(reviewData.productId, reviewData.userId, reviewData.rating, reviewData.comment || null);
    return { id: result.lastInsertRowid, ...reviewData, createdAt: new Date(), updatedAt: new Date() };
  }

  async deleteProductReview(id: number) {
    const stmt = this.db.prepare('DELETE FROM product_reviews WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Helper methods to parse JSON fields
  private parseUser(user: any) {
    return {
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    };
  }

  private parseDesigner(designer: any) {
    return {
      ...designer,
      portfolioImages: JSON.parse(designer.portfolioImages || '[]'),
      specialties: JSON.parse(designer.specialties || '[]'),
      certifications: JSON.parse(designer.certifications || '[]'),
      languages: JSON.parse(designer.languages || '[]'),
      createdAt: new Date(designer.createdAt),
      updatedAt: new Date(designer.updatedAt)
    };
  }

  private parsePost(post: any) {
    return {
      ...post,
      images: JSON.parse(post.images || '[]'),
      tags: JSON.parse(post.tags || '[]'),
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt)
    };
  }

  private parseProduct(product: any) {
    return {
      ...product,
      images: JSON.parse(product.images || '[]'),
      featured: Boolean(product.featured),
      inStock: Boolean(product.inStock),
      createdAt: new Date(product.createdAt),
      updatedAt: new Date(product.updatedAt)
    };
  }

  async close() {
    this.db.close();
  }
}
