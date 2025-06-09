import mysql from 'mysql2/promise';
import * as bcrypt from "bcryptjs";
import { IStorage } from './storage';
import {
  type Designer, type InsertDesigner, type UpdateDesigner,
  type User, type InsertUser,
  type Post, type InsertPost,
  type Like, type InsertLike,
  type Comment, type InsertComment,
  type Message, type InsertMessage,
  type Product, type InsertProduct, type UpdateProduct,
  type ProductReview, type InsertProductReview
} from "../shared/schema.ts";

export class MySQLStorage implements IStorage {
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: 'rotiv2025',
      database: 'u876762984_manus',
    });
  }

  // Helper method to hash passwords
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // User methods
  async getAllUsers(): Promise<User[]> {
    const [rows] = await this.pool.execute(
      'SELECT id, username, email, name, profile_image, user_type, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    return rows as User[];
  }

  async getUser(id: number): Promise<User | undefined> {
    const [rows] = await this.pool.execute(
      'SELECT id, username, email, name, profile_image, user_type, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    const users = rows as User[];
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [rows] = await this.pool.execute(
      'SELECT id, username, email, password_hash, name, profile_image, user_type, created_at, updated_at FROM users WHERE username = ?',
      [username]
    );
    const users = rows as (User & { password_hash: string })[];
    if (users[0]) {
      const { password_hash, ...user } = users[0];
      return { ...user, password: password_hash };
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [rows] = await this.pool.execute(
      'SELECT id, username, email, password_hash, name, profile_image, user_type, created_at, updated_at FROM users WHERE email = ?',
      [email]
    );
    const users = rows as (User & { password_hash: string })[];
    if (users[0]) {
      const { password_hash, ...user } = users[0];
      return { ...user, password: password_hash };
    }
    return undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(user.password);
    
    const [result] = await this.pool.execute(
      'INSERT INTO users (username, email, password_hash, name, profile_image, user_type) VALUES (?, ?, ?, ?, ?, ?)',
      [user.username, user.email, hashedPassword, user.name, user.profileImage || null, user.userType || 'user']
    );
    
    const insertResult = result as mysql.ResultSetHeader;
    const newUser = await this.getUser(insertResult.insertId);
    
    if (!newUser) {
      throw new Error('Failed to create user');
    }
    
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (userData.username) {
      fields.push('username = ?');
      values.push(userData.username);
    }
    if (userData.email) {
      fields.push('email = ?');
      values.push(userData.email);
    }
    if (userData.name) {
      fields.push('name = ?');
      values.push(userData.name);
    }
    if (userData.profileImage !== undefined) {
      fields.push('profile_image = ?');
      values.push(userData.profileImage);
    }
    if (userData.userType) {
      fields.push('user_type = ?');
      values.push(userData.userType);
    }
    
    if (fields.length === 0) {
      return this.getUser(id);
    }
    
    values.push(id);
    
    await this.pool.execute(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    return this.getUser(id);
  }

  async validateUserPassword(username: string, password: string): Promise<User | undefined> {
    const [rows] = await this.pool.execute(
      'SELECT id, username, email, password_hash, name, profile_image, user_type, created_at, updated_at FROM users WHERE username = ?',
      [username]
    );
    const users = rows as (User & { password_hash: string })[];
    
    if (users[0]) {
      const isValid = await bcrypt.compare(password, users[0].password_hash);
      if (isValid) {
        const { password_hash, ...user } = users[0];
        return user;
      }
    }
    
    return undefined;
  }

  async getUserDesignerProfile(userId: number): Promise<Designer | undefined> {
    return this.getDesignerByUserId(userId);
  }

  // Designer methods
  async getAllDesigners(): Promise<Designer[]> {
    const [rows] = await this.pool.execute(`
      SELECT d.*, u.username, u.email 
      FROM designers d 
      JOIN users u ON d.user_id = u.id 
      ORDER BY d.created_at DESC
    `);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      profileImage: row.profile_image,
      title: row.title,
      bio: row.bio,
      style: row.style,
      description: row.description,
      hourlyRate: parseFloat(row.hourly_rate),
      rating: parseFloat(row.rating),
      reviewCount: row.review_count,
      location: row.location,
      portfolioImages: row.portfolio_images ? JSON.parse(row.portfolio_images) : [],
      specialties: row.specialties ? JSON.parse(row.specialties) : [],
      experienceYears: row.experience_years,
      education: row.education,
      certifications: row.certifications ? JSON.parse(row.certifications) : [],
      languages: row.languages ? JSON.parse(row.languages) : [],
      availabilityStatus: row.availability_status,
      responseTime: row.response_time,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getDesignerById(id: number): Promise<Designer | undefined> {
    const [rows] = await this.pool.execute(`
      SELECT d.*, u.username, u.email 
      FROM designers d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.id = ?
    `, [id]);
    
    const designers = rows as any[];
    if (designers[0]) {
      const row = designers[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        profileImage: row.profile_image,
        title: row.title,
        bio: row.bio,
        style: row.style,
        description: row.description,
        hourlyRate: parseFloat(row.hourly_rate),
        rating: parseFloat(row.rating),
        reviewCount: row.review_count,
        location: row.location,
        portfolioImages: row.portfolio_images ? JSON.parse(row.portfolio_images) : [],
        specialties: row.specialties ? JSON.parse(row.specialties) : [],
        experienceYears: row.experience_years,
        education: row.education,
        certifications: row.certifications ? JSON.parse(row.certifications) : [],
        languages: row.languages ? JSON.parse(row.languages) : [],
        availabilityStatus: row.availability_status,
        responseTime: row.response_time,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    }
    
    return undefined;
  }

  async getDesignerByUserId(userId: number): Promise<Designer | undefined> {
    const [rows] = await this.pool.execute(`
      SELECT d.*, u.username, u.email 
      FROM designers d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.user_id = ?
    `, [userId]);
    
    const designers = rows as any[];
    if (designers[0]) {
      const row = designers[0];
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        profileImage: row.profile_image,
        title: row.title,
        bio: row.bio,
        style: row.style,
        description: row.description,
        hourlyRate: parseFloat(row.hourly_rate),
        rating: parseFloat(row.rating),
        reviewCount: row.review_count,
        location: row.location,
        portfolioImages: row.portfolio_images ? JSON.parse(row.portfolio_images) : [],
        specialties: row.specialties ? JSON.parse(row.specialties) : [],
        experienceYears: row.experience_years,
        education: row.education,
        certifications: row.certifications ? JSON.parse(row.certifications) : [],
        languages: row.languages ? JSON.parse(row.languages) : [],
        availabilityStatus: row.availability_status,
        responseTime: row.response_time,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    }
    
    return undefined;
  }

  async createDesigner(designer: InsertDesigner): Promise<Designer> {
    const [result] = await this.pool.execute(`
      INSERT INTO designers (
        user_id, name, profile_image, title, bio, style, description, 
        hourly_rate, rating, review_count, location, portfolio_images, 
        specialties, experience_years, education, certifications, 
        languages, availability_status, response_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      designer.userId,
      designer.name,
      designer.profileImage || null,
      designer.title || null,
      designer.bio || null,
      designer.style || null,
      designer.description || null,
      designer.hourlyRate || null,
      designer.rating || 0,
      designer.reviewCount || 0,
      designer.location || null,
      designer.portfolioImages ? JSON.stringify(designer.portfolioImages) : null,
      designer.specialties ? JSON.stringify(designer.specialties) : null,
      designer.experienceYears || null,
      designer.education || null,
      designer.certifications ? JSON.stringify(designer.certifications) : null,
      designer.languages ? JSON.stringify(designer.languages) : null,
      designer.availabilityStatus || 'available',
      designer.responseTime || null
    ]);
    
    const insertResult = result as mysql.ResultSetHeader;
    const newDesigner = await this.getDesignerById(insertResult.insertId);
    
    if (!newDesigner) {
      throw new Error('Failed to create designer');
    }
    
    return newDesigner;
  }

  async updateDesigner(id: number, designerData: UpdateDesigner): Promise<Designer | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (designerData.name) {
      fields.push('name = ?');
      values.push(designerData.name);
    }
    if (designerData.profileImage !== undefined) {
      fields.push('profile_image = ?');
      values.push(designerData.profileImage);
    }
    if (designerData.title !== undefined) {
      fields.push('title = ?');
      values.push(designerData.title);
    }
    if (designerData.bio !== undefined) {
      fields.push('bio = ?');
      values.push(designerData.bio);
    }
    if (designerData.style !== undefined) {
      fields.push('style = ?');
      values.push(designerData.style);
    }
    if (designerData.description !== undefined) {
      fields.push('description = ?');
      values.push(designerData.description);
    }
    if (designerData.hourlyRate !== undefined) {
      fields.push('hourly_rate = ?');
      values.push(designerData.hourlyRate);
    }
    if (designerData.location !== undefined) {
      fields.push('location = ?');
      values.push(designerData.location);
    }
    if (designerData.portfolioImages !== undefined) {
      fields.push('portfolio_images = ?');
      values.push(JSON.stringify(designerData.portfolioImages));
    }
    if (designerData.specialties !== undefined) {
      fields.push('specialties = ?');
      values.push(JSON.stringify(designerData.specialties));
    }
    if (designerData.experienceYears !== undefined) {
      fields.push('experience_years = ?');
      values.push(designerData.experienceYears);
    }
    if (designerData.education !== undefined) {
      fields.push('education = ?');
      values.push(designerData.education);
    }
    if (designerData.certifications !== undefined) {
      fields.push('certifications = ?');
      values.push(JSON.stringify(designerData.certifications));
    }
    if (designerData.languages !== undefined) {
      fields.push('languages = ?');
      values.push(JSON.stringify(designerData.languages));
    }
    if (designerData.availabilityStatus !== undefined) {
      fields.push('availability_status = ?');
      values.push(designerData.availabilityStatus);
    }
    if (designerData.responseTime !== undefined) {
      fields.push('response_time = ?');
      values.push(designerData.responseTime);
    }
    
    if (fields.length === 0) {
      return this.getDesignerById(id);
    }
    
    values.push(id);
    
    await this.pool.execute(
      `UPDATE designers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    return this.getDesignerById(id);
  }

  async getDesignersByStyle(style: string): Promise<Designer[]> {
    const [rows] = await this.pool.execute(`
      SELECT d.*, u.username, u.email 
      FROM designers d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.style LIKE ?
      ORDER BY d.rating DESC, d.review_count DESC
    `, [`%${style}%`]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      profileImage: row.profile_image,
      title: row.title,
      bio: row.bio,
      style: row.style,
      description: row.description,
      hourlyRate: parseFloat(row.hourly_rate),
      rating: parseFloat(row.rating),
      reviewCount: row.review_count,
      location: row.location,
      portfolioImages: row.portfolio_images ? JSON.parse(row.portfolio_images) : [],
      specialties: row.specialties ? JSON.parse(row.specialties) : [],
      experienceYears: row.experience_years,
      education: row.education,
      certifications: row.certifications ? JSON.parse(row.certifications) : [],
      languages: row.languages ? JSON.parse(row.languages) : [],
      availabilityStatus: row.availability_status,
      responseTime: row.response_time,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getDesignersByPriceRange(min: number, max: number): Promise<Designer[]> {
    const [rows] = await this.pool.execute(`
      SELECT d.*, u.username, u.email 
      FROM designers d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.hourly_rate BETWEEN ? AND ?
      ORDER BY d.rating DESC, d.review_count DESC
    `, [min, max]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      profileImage: row.profile_image,
      title: row.title,
      bio: row.bio,
      style: row.style,
      description: row.description,
      hourlyRate: parseFloat(row.hourly_rate),
      rating: parseFloat(row.rating),
      reviewCount: row.review_count,
      location: row.location,
      portfolioImages: row.portfolio_images ? JSON.parse(row.portfolio_images) : [],
      specialties: row.specialties ? JSON.parse(row.specialties) : [],
      experienceYears: row.experience_years,
      education: row.education,
      certifications: row.certifications ? JSON.parse(row.certifications) : [],
      languages: row.languages ? JSON.parse(row.languages) : [],
      availabilityStatus: row.availability_status,
      responseTime: row.response_time,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  async getDesignersByLocation(location: string): Promise<Designer[]> {
    const [rows] = await this.pool.execute(`
      SELECT d.*, u.username, u.email 
      FROM designers d 
      JOIN users u ON d.user_id = u.id 
      WHERE d.location LIKE ?
      ORDER BY d.rating DESC, d.review_count DESC
    `, [`%${location}%`]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      profileImage: row.profile_image,
      title: row.title,
      bio: row.bio,
      style: row.style,
      description: row.description,
      hourlyRate: parseFloat(row.hourly_rate),
      rating: parseFloat(row.rating),
      reviewCount: row.review_count,
      location: row.location,
      portfolioImages: row.portfolio_images ? JSON.parse(row.portfolio_images) : [],
      specialties: row.specialties ? JSON.parse(row.specialties) : [],
      experienceYears: row.experience_years,
      education: row.education,
      certifications: row.certifications ? JSON.parse(row.certifications) : [],
      languages: row.languages ? JSON.parse(row.languages) : [],
      availabilityStatus: row.availability_status,
      responseTime: row.response_time,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  }

  // Post methods
  async getAllPosts(): Promise<Post[]> {
    const [rows] = await this.pool.execute(`
      SELECT p.*, d.name as designer_name, d.profile_image as designer_profile_image
      FROM posts p 
      JOIN designers d ON p.designer_id = d.id 
      ORDER BY p.created_at DESC
    `);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      designerId: row.designer_id,
      title: row.title,
      content: row.content,
      images: row.images ? JSON.parse(row.images) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
      style: row.style,
      roomType: row.room_type,
      projectDuration: row.project_duration,
      budgetRange: row.budget_range,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      designerName: row.designer_name,
      designerProfileImage: row.designer_profile_image
    }));
  }

  async getPostById(id: number): Promise<Post | undefined> {
    const [rows] = await this.pool.execute(`
      SELECT p.*, d.name as designer_name, d.profile_image as designer_profile_image
      FROM posts p 
      JOIN designers d ON p.designer_id = d.id 
      WHERE p.id = ?
    `, [id]);
    
    const posts = rows as any[];
    if (posts[0]) {
      const row = posts[0];
      return {
        id: row.id,
        designerId: row.designer_id,
        title: row.title,
        content: row.content,
        images: row.images ? JSON.parse(row.images) : [],
        tags: row.tags ? JSON.parse(row.tags) : [],
        style: row.style,
        roomType: row.room_type,
        projectDuration: row.project_duration,
        budgetRange: row.budget_range,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        designerName: row.designer_name,
        designerProfileImage: row.designer_profile_image
      };
    }
    
    return undefined;
  }

  async getPostsByDesignerId(designerId: number): Promise<Post[]> {
    const [rows] = await this.pool.execute(`
      SELECT p.*, d.name as designer_name, d.profile_image as designer_profile_image
      FROM posts p 
      JOIN designers d ON p.designer_id = d.id 
      WHERE p.designer_id = ?
      ORDER BY p.created_at DESC
    `, [designerId]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      designerId: row.designer_id,
      title: row.title,
      content: row.content,
      images: row.images ? JSON.parse(row.images) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
      style: row.style,
      roomType: row.room_type,
      projectDuration: row.project_duration,
      budgetRange: row.budget_range,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      designerName: row.designer_name,
      designerProfileImage: row.designer_profile_image
    }));
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [result] = await this.pool.execute(`
      INSERT INTO posts (
        designer_id, title, content, images, tags, style, 
        room_type, project_duration, budget_range
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      post.designerId,
      post.title,
      post.content || null,
      post.images ? JSON.stringify(post.images) : null,
      post.tags ? JSON.stringify(post.tags) : null,
      post.style || null,
      post.roomType || null,
      post.projectDuration || null,
      post.budgetRange || null
    ]);
    
    const insertResult = result as mysql.ResultSetHeader;
    const newPost = await this.getPostById(insertResult.insertId);
    
    if (!newPost) {
      throw new Error('Failed to create post');
    }
    
    return newPost;
  }

  async updatePost(id: number, postData: Partial<Post>): Promise<Post | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (postData.title) {
      fields.push('title = ?');
      values.push(postData.title);
    }
    if (postData.content !== undefined) {
      fields.push('content = ?');
      values.push(postData.content);
    }
    if (postData.images !== undefined) {
      fields.push('images = ?');
      values.push(JSON.stringify(postData.images));
    }
    if (postData.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(postData.tags));
    }
    if (postData.style !== undefined) {
      fields.push('style = ?');
      values.push(postData.style);
    }
    if (postData.roomType !== undefined) {
      fields.push('room_type = ?');
      values.push(postData.roomType);
    }
    if (postData.projectDuration !== undefined) {
      fields.push('project_duration = ?');
      values.push(postData.projectDuration);
    }
    if (postData.budgetRange !== undefined) {
      fields.push('budget_range = ?');
      values.push(postData.budgetRange);
    }
    
    if (fields.length === 0) {
      return this.getPostById(id);
    }
    
    values.push(id);
    
    await this.pool.execute(
      `UPDATE posts SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    return this.getPostById(id);
  }

  async deletePost(id: number): Promise<boolean> {
    const [result] = await this.pool.execute('DELETE FROM posts WHERE id = ?', [id]);
    const deleteResult = result as mysql.ResultSetHeader;
    return deleteResult.affectedRows > 0;
  }

  // Like methods
  async getLikesByPostId(postId: number): Promise<Like[]> {
    const [rows] = await this.pool.execute(`
      SELECT l.*, u.username, u.name as user_name, u.profile_image as user_profile_image
      FROM likes l 
      JOIN users u ON l.user_id = u.id 
      WHERE l.post_id = ?
      ORDER BY l.created_at DESC
    `, [postId]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      createdAt: row.created_at,
      username: row.username,
      userName: row.user_name,
      userProfileImage: row.user_profile_image
    }));
  }

  async getLikeByUserAndPost(userId: number, postId: number): Promise<Like | undefined> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM likes WHERE user_id = ? AND post_id = ?',
      [userId, postId]
    );
    
    const likes = rows as Like[];
    return likes[0];
  }

  async createLike(like: InsertLike): Promise<Like> {
    const [result] = await this.pool.execute(
      'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
      [like.postId, like.userId]
    );
    
    const insertResult = result as mysql.ResultSetHeader;
    const [rows] = await this.pool.execute(
      'SELECT * FROM likes WHERE id = ?',
      [insertResult.insertId]
    );
    
    const likes = rows as Like[];
    return likes[0];
  }

  async deleteLike(id: number): Promise<boolean> {
    const [result] = await this.pool.execute('DELETE FROM likes WHERE id = ?', [id]);
    const deleteResult = result as mysql.ResultSetHeader;
    return deleteResult.affectedRows > 0;
  }

  // Comment methods
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    const [rows] = await this.pool.execute(`
      SELECT c.*, u.username, u.name as user_name, u.profile_image as user_profile_image
      FROM comments c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      username: row.username,
      userName: row.user_name,
      userProfileImage: row.user_profile_image
    }));
  }

  async getCommentById(id: number): Promise<Comment | undefined> {
    const [rows] = await this.pool.execute(
      'SELECT * FROM comments WHERE id = ?',
      [id]
    );
    
    const comments = rows as Comment[];
    return comments[0];
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [result] = await this.pool.execute(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [comment.postId, comment.userId, comment.content]
    );
    
    const insertResult = result as mysql.ResultSetHeader;
    const [rows] = await this.pool.execute(
      'SELECT * FROM comments WHERE id = ?',
      [insertResult.insertId]
    );
    
    const comments = rows as Comment[];
    return comments[0];
  }

  async updateComment(id: number, commentData: Partial<Comment>): Promise<Comment | undefined> {
    if (commentData.content) {
      await this.pool.execute(
        'UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [commentData.content, id]
      );
    }
    
    return this.getCommentById(id);
  }

  async deleteComment(id: number): Promise<boolean> {
    const [result] = await this.pool.execute('DELETE FROM comments WHERE id = ?', [id]);
    const deleteResult = result as mysql.ResultSetHeader;
    return deleteResult.affectedRows > 0;
  }

  // Message methods
  async getConversation(userId1: number, userId2: number): Promise<Message[]> {
    const [rows] = await this.pool.execute(`
      SELECT m.*, 
             s.username as sender_username, s.name as sender_name, s.profile_image as sender_profile_image,
             r.username as receiver_username, r.name as receiver_name, r.profile_image as receiver_profile_image
      FROM messages m 
      JOIN users s ON m.sender_id = s.id 
      JOIN users r ON m.receiver_id = r.id 
      WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [userId1, userId2, userId2, userId1]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      read: row.is_read,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      senderUsername: row.sender_username,
      senderName: row.sender_name,
      senderProfileImage: row.sender_profile_image,
      receiverUsername: row.receiver_username,
      receiverName: row.receiver_name,
      receiverProfileImage: row.receiver_profile_image
    }));
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    const [rows] = await this.pool.execute(`
      SELECT m.*, 
             s.username as sender_username, s.name as sender_name, s.profile_image as sender_profile_image,
             r.username as receiver_username, r.name as receiver_name, r.profile_image as receiver_profile_image
      FROM messages m 
      JOIN users s ON m.sender_id = s.id 
      JOIN users r ON m.receiver_id = r.id 
      WHERE m.sender_id = ? OR m.receiver_id = ?
      ORDER BY m.created_at DESC
    `, [userId, userId]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      read: row.is_read,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      senderUsername: row.sender_username,
      senderName: row.sender_name,
      senderProfileImage: row.sender_profile_image,
      receiverUsername: row.receiver_username,
      receiverName: row.receiver_name,
      receiverProfileImage: row.receiver_profile_image
    }));
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    const [rows] = await this.pool.execute(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = FALSE',
      [userId]
    );
    
    const result = rows as { count: number }[];
    return result[0].count;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [result] = await this.pool.execute(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [message.senderId, message.receiverId, message.content]
    );
    
    const insertResult = result as mysql.ResultSetHeader;
    const [rows] = await this.pool.execute(`
      SELECT m.*, 
             s.username as sender_username, s.name as sender_name, s.profile_image as sender_profile_image,
             r.username as receiver_username, r.name as receiver_name, r.profile_image as receiver_profile_image
      FROM messages m 
      JOIN users s ON m.sender_id = s.id 
      JOIN users r ON m.receiver_id = r.id 
      WHERE m.id = ?
    `, [insertResult.insertId]);
    
    const messages = rows as any[];
    const row = messages[0];
    
    return {
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      read: row.is_read,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      senderUsername: row.sender_username,
      senderName: row.sender_name,
      senderProfileImage: row.sender_profile_image,
      receiverUsername: row.receiver_username,
      receiverName: row.receiver_name,
      receiverProfileImage: row.receiver_profile_image
    };
  }

  async markMessageAsRead(id: number): Promise<Message | undefined> {
    await this.pool.execute(
      'UPDATE messages SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    const [rows] = await this.pool.execute(`
      SELECT m.*, 
             s.username as sender_username, s.name as sender_name, s.profile_image as sender_profile_image,
             r.username as receiver_username, r.name as receiver_name, r.profile_image as receiver_profile_image
      FROM messages m 
      JOIN users s ON m.sender_id = s.id 
      JOIN users r ON m.receiver_id = r.id 
      WHERE m.id = ?
    `, [id]);
    
    const messages = rows as any[];
    if (messages[0]) {
      const row = messages[0];
      return {
        id: row.id,
        senderId: row.sender_id,
        receiverId: row.receiver_id,
        content: row.content,
        read: row.is_read,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        senderUsername: row.sender_username,
        senderName: row.sender_name,
        senderProfileImage: row.sender_profile_image,
        receiverUsername: row.receiver_username,
        receiverName: row.receiver_name,
        receiverProfileImage: row.receiver_profile_image
      };
    }
    
    return undefined;
  }

  async deleteMessage(id: number): Promise<boolean> {
    const [result] = await this.pool.execute('DELETE FROM messages WHERE id = ?', [id]);
    const deleteResult = result as mysql.ResultSetHeader;
    return deleteResult.affectedRows > 0;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    const [rows] = await this.pool.execute(`
      SELECT p.*, u.username as seller_username, u.name as seller_name
      FROM products p 
      JOIN users u ON p.seller_id = u.id 
      ORDER BY p.created_at DESC
    `);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      sellerId: row.seller_id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      discountPrice: row.discount_price ? parseFloat(row.discount_price) : undefined,
      category: row.category,
      subcategory: row.subcategory,
      tags: row.tags ? JSON.parse(row.tags) : [],
      style: row.style,
      material: row.material,
      color: row.color,
      dimensions: row.dimensions ? JSON.parse(row.dimensions) : undefined,
      weight: row.weight ? parseFloat(row.weight) : undefined,
      weightUnit: row.weight_unit,
      images: row.images ? JSON.parse(row.images) : [],
      inStock: row.in_stock,
      stockQuantity: row.stock_quantity,
      featured: row.featured,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sellerUsername: row.seller_username,
      sellerName: row.seller_name
    }));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [rows] = await this.pool.execute(`
      SELECT p.*, u.username as seller_username, u.name as seller_name
      FROM products p 
      JOIN users u ON p.seller_id = u.id 
      WHERE p.id = ?
    `, [id]);
    
    const products = rows as any[];
    if (products[0]) {
      const row = products[0];
      return {
        id: row.id,
        sellerId: row.seller_id,
        name: row.name,
        description: row.description,
        price: parseFloat(row.price),
        discountPrice: row.discount_price ? parseFloat(row.discount_price) : undefined,
        category: row.category,
        subcategory: row.subcategory,
        tags: row.tags ? JSON.parse(row.tags) : [],
        style: row.style,
        material: row.material,
        color: row.color,
        dimensions: row.dimensions ? JSON.parse(row.dimensions) : undefined,
        weight: row.weight ? parseFloat(row.weight) : undefined,
        weightUnit: row.weight_unit,
        images: row.images ? JSON.parse(row.images) : [],
        inStock: row.in_stock,
        stockQuantity: row.stock_quantity,
        featured: row.featured,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        sellerUsername: row.seller_username,
        sellerName: row.seller_name
      };
    }
    
    return undefined;
  }

  async getProductsBySellerId(sellerId: number): Promise<Product[]> {
    const [rows] = await this.pool.execute(`
      SELECT p.*, u.username as seller_username, u.name as seller_name
      FROM products p 
      JOIN users u ON p.seller_id = u.id 
      WHERE p.seller_id = ?
      ORDER BY p.created_at DESC
    `, [sellerId]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      sellerId: row.seller_id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      discountPrice: row.discount_price ? parseFloat(row.discount_price) : undefined,
      category: row.category,
      subcategory: row.subcategory,
      tags: row.tags ? JSON.parse(row.tags) : [],
      style: row.style,
      material: row.material,
      color: row.color,
      dimensions: row.dimensions ? JSON.parse(row.dimensions) : undefined,
      weight: row.weight ? parseFloat(row.weight) : undefined,
      weightUnit: row.weight_unit,
      images: row.images ? JSON.parse(row.images) : [],
      inStock: row.in_stock,
      stockQuantity: row.stock_quantity,
      featured: row.featured,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sellerUsername: row.seller_username,
      sellerName: row.seller_name
    }));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const [rows] = await this.pool.execute(`
      SELECT p.*, u.username as seller_username, u.name as seller_name
      FROM products p 
      JOIN users u ON p.seller_id = u.id 
      WHERE p.category = ?
      ORDER BY p.created_at DESC
    `, [category]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      sellerId: row.seller_id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      discountPrice: row.discount_price ? parseFloat(row.discount_price) : undefined,
      category: row.category,
      subcategory: row.subcategory,
      tags: row.tags ? JSON.parse(row.tags) : [],
      style: row.style,
      material: row.material,
      color: row.color,
      dimensions: row.dimensions ? JSON.parse(row.dimensions) : undefined,
      weight: row.weight ? parseFloat(row.weight) : undefined,
      weightUnit: row.weight_unit,
      images: row.images ? JSON.parse(row.images) : [],
      inStock: row.in_stock,
      stockQuantity: row.stock_quantity,
      featured: row.featured,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sellerUsername: row.seller_username,
      sellerName: row.seller_name
    }));
  }

  async getProductsBySubcategory(subcategory: string): Promise<Product[]> {
    const [rows] = await this.pool.execute(`
      SELECT p.*, u.username as seller_username, u.name as seller_name
      FROM products p 
      JOIN users u ON p.seller_id = u.id 
      WHERE p.subcategory = ?
      ORDER BY p.created_at DESC
    `, [subcategory]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      sellerId: row.seller_id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      discountPrice: row.discount_price ? parseFloat(row.discount_price) : undefined,
      category: row.category,
      subcategory: row.subcategory,
      tags: row.tags ? JSON.parse(row.tags) : [],
      style: row.style,
      material: row.material,
      color: row.color,
      dimensions: row.dimensions ? JSON.parse(row.dimensions) : undefined,
      weight: row.weight ? parseFloat(row.weight) : undefined,
      weightUnit: row.weight_unit,
      images: row.images ? JSON.parse(row.images) : [],
      inStock: row.in_stock,
      stockQuantity: row.stock_quantity,
      featured: row.featured,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sellerUsername: row.seller_username,
      sellerName: row.seller_name
    }));
  }

  async getProductsByStyle(style: string): Promise<Product[]> {
    const [rows] = await this.pool.execute(`
      SELECT p.*, u.username as seller_username, u.name as seller_name
      FROM products p 
      JOIN users u ON p.seller_id = u.id 
      WHERE p.style LIKE ?
      ORDER BY p.created_at DESC
    `, [`%${style}%`]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      sellerId: row.seller_id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      discountPrice: row.discount_price ? parseFloat(row.discount_price) : undefined,
      category: row.category,
      subcategory: row.subcategory,
      tags: row.tags ? JSON.parse(row.tags) : [],
      style: row.style,
      material: row.material,
      color: row.color,
      dimensions: row.dimensions ? JSON.parse(row.dimensions) : undefined,
      weight: row.weight ? parseFloat(row.weight) : undefined,
      weightUnit: row.weight_unit,
      images: row.images ? JSON.parse(row.images) : [],
      inStock: row.in_stock,
      stockQuantity: row.stock_quantity,
      featured: row.featured,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sellerUsername: row.seller_username,
      sellerName: row.seller_name
    }));
  }

  async getProductsByPriceRange(min: number, max: number): Promise<Product[]> {
    const [rows] = await this.pool.execute(`
      SELECT p.*, u.username as seller_username, u.name as seller_name
      FROM products p 
      JOIN users u ON p.seller_id = u.id 
      WHERE p.price BETWEEN ? AND ?
      ORDER BY p.price ASC
    `, [min, max]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      sellerId: row.seller_id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      discountPrice: row.discount_price ? parseFloat(row.discount_price) : undefined,
      category: row.category,
      subcategory: row.subcategory,
      tags: row.tags ? JSON.parse(row.tags) : [],
      style: row.style,
      material: row.material,
      color: row.color,
      dimensions: row.dimensions ? JSON.parse(row.dimensions) : undefined,
      weight: row.weight ? parseFloat(row.weight) : undefined,
      weightUnit: row.weight_unit,
      images: row.images ? JSON.parse(row.images) : [],
      inStock: row.in_stock,
      stockQuantity: row.stock_quantity,
      featured: row.featured,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sellerUsername: row.seller_username,
      sellerName: row.seller_name
    }));
  }

  async searchProducts(query: string): Promise<Product[]> {
    const [rows] = await this.pool.execute(`
      SELECT p.*, u.username as seller_username, u.name as seller_name
      FROM products p 
      JOIN users u ON p.seller_id = u.id 
      WHERE MATCH(p.name, p.description) AGAINST(? IN NATURAL LANGUAGE MODE)
         OR p.name LIKE ? 
         OR p.description LIKE ?
         OR p.category LIKE ?
         OR p.style LIKE ?
      ORDER BY p.created_at DESC
    `, [query, `%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      sellerId: row.seller_id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      discountPrice: row.discount_price ? parseFloat(row.discount_price) : undefined,
      category: row.category,
      subcategory: row.subcategory,
      tags: row.tags ? JSON.parse(row.tags) : [],
      style: row.style,
      material: row.material,
      color: row.color,
      dimensions: row.dimensions ? JSON.parse(row.dimensions) : undefined,
      weight: row.weight ? parseFloat(row.weight) : undefined,
      weightUnit: row.weight_unit,
      images: row.images ? JSON.parse(row.images) : [],
      inStock: row.in_stock,
      stockQuantity: row.stock_quantity,
      featured: row.featured,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sellerUsername: row.seller_username,
      sellerName: row.seller_name
    }));
  }

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const limitClause = limit ? `LIMIT ${limit}` : '';
    
    const [rows] = await this.pool.execute(`
      SELECT p.*, u.username as seller_username, u.name as seller_name
      FROM products p 
      JOIN users u ON p.seller_id = u.id 
      WHERE p.featured = TRUE
      ORDER BY p.created_at DESC
      ${limitClause}
    `);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      sellerId: row.seller_id,
      name: row.name,
      description: row.description,
      price: parseFloat(row.price),
      discountPrice: row.discount_price ? parseFloat(row.discount_price) : undefined,
      category: row.category,
      subcategory: row.subcategory,
      tags: row.tags ? JSON.parse(row.tags) : [],
      style: row.style,
      material: row.material,
      color: row.color,
      dimensions: row.dimensions ? JSON.parse(row.dimensions) : undefined,
      weight: row.weight ? parseFloat(row.weight) : undefined,
      weightUnit: row.weight_unit,
      images: row.images ? JSON.parse(row.images) : [],
      inStock: row.in_stock,
      stockQuantity: row.stock_quantity,
      featured: row.featured,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      sellerUsername: row.seller_username,
      sellerName: row.seller_name
    }));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [result] = await this.pool.execute(`
      INSERT INTO products (
        seller_id, name, description, price, discount_price, category, 
        subcategory, tags, style, material, color, dimensions, weight, 
        weight_unit, images, in_stock, stock_quantity, featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      product.sellerId,
      product.name,
      product.description || null,
      product.price,
      product.discountPrice || null,
      product.category,
      product.subcategory || null,
      product.tags ? JSON.stringify(product.tags) : null,
      product.style || null,
      product.material || null,
      product.color || null,
      product.dimensions ? JSON.stringify(product.dimensions) : null,
      product.weight || null,
      product.weightUnit || null,
      product.images ? JSON.stringify(product.images) : null,
      product.inStock !== undefined ? product.inStock : true,
      product.stockQuantity || 0,
      product.featured !== undefined ? product.featured : false
    ]);
    
    const insertResult = result as mysql.ResultSetHeader;
    const newProduct = await this.getProductById(insertResult.insertId);
    
    if (!newProduct) {
      throw new Error('Failed to create product');
    }
    
    return newProduct;
  }

  async updateProduct(id: number, productData: UpdateProduct): Promise<Product | undefined> {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (productData.name) {
      fields.push('name = ?');
      values.push(productData.name);
    }
    if (productData.description !== undefined) {
      fields.push('description = ?');
      values.push(productData.description);
    }
    if (productData.price !== undefined) {
      fields.push('price = ?');
      values.push(productData.price);
    }
    if (productData.discountPrice !== undefined) {
      fields.push('discount_price = ?');
      values.push(productData.discountPrice);
    }
    if (productData.category) {
      fields.push('category = ?');
      values.push(productData.category);
    }
    if (productData.subcategory !== undefined) {
      fields.push('subcategory = ?');
      values.push(productData.subcategory);
    }
    if (productData.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(productData.tags));
    }
    if (productData.style !== undefined) {
      fields.push('style = ?');
      values.push(productData.style);
    }
    if (productData.material !== undefined) {
      fields.push('material = ?');
      values.push(productData.material);
    }
    if (productData.color !== undefined) {
      fields.push('color = ?');
      values.push(productData.color);
    }
    if (productData.dimensions !== undefined) {
      fields.push('dimensions = ?');
      values.push(JSON.stringify(productData.dimensions));
    }
    if (productData.weight !== undefined) {
      fields.push('weight = ?');
      values.push(productData.weight);
    }
    if (productData.weightUnit !== undefined) {
      fields.push('weight_unit = ?');
      values.push(productData.weightUnit);
    }
    if (productData.images !== undefined) {
      fields.push('images = ?');
      values.push(JSON.stringify(productData.images));
    }
    if (productData.inStock !== undefined) {
      fields.push('in_stock = ?');
      values.push(productData.inStock);
    }
    if (productData.stockQuantity !== undefined) {
      fields.push('stock_quantity = ?');
      values.push(productData.stockQuantity);
    }
    if (productData.featured !== undefined) {
      fields.push('featured = ?');
      values.push(productData.featured);
    }
    
    if (fields.length === 0) {
      return this.getProductById(id);
    }
    
    values.push(id);
    
    await this.pool.execute(
      `UPDATE products SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    return this.getProductById(id);
  }

  async deleteProduct(id: number): Promise<boolean> {
    const [result] = await this.pool.execute('DELETE FROM products WHERE id = ?', [id]);
    const deleteResult = result as mysql.ResultSetHeader;
    return deleteResult.affectedRows > 0;
  }

  // Product Review methods
  async getReviewsByProductId(productId: number): Promise<ProductReview[]> {
    const [rows] = await this.pool.execute(`
      SELECT pr.*, u.username, u.name as user_name, u.profile_image as user_profile_image
      FROM product_reviews pr 
      JOIN users u ON pr.user_id = u.id 
      WHERE pr.product_id = ?
      ORDER BY pr.created_at DESC
    `, [productId]);
    
    return (rows as any[]).map(row => ({
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      rating: row.rating,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      username: row.username,
      userName: row.user_name,
      userProfileImage: row.user_profile_image
    }));
  }

  async createProductReview(review: InsertProductReview): Promise<ProductReview> {
    const [result] = await this.pool.execute(
      'INSERT INTO product_reviews (product_id, user_id, rating, title, content) VALUES (?, ?, ?, ?, ?)',
      [review.productId, review.userId, review.rating, review.title || null, review.content || null]
    );
    
    const insertResult = result as mysql.ResultSetHeader;
    const [rows] = await this.pool.execute(`
      SELECT pr.*, u.username, u.name as user_name, u.profile_image as user_profile_image
      FROM product_reviews pr 
      JOIN users u ON pr.user_id = u.id 
      WHERE pr.id = ?
    `, [insertResult.insertId]);
    
    const reviews = rows as any[];
    const row = reviews[0];
    
    return {
      id: row.id,
      productId: row.product_id,
      userId: row.user_id,
      rating: row.rating,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      username: row.username,
      userName: row.user_name,
      userProfileImage: row.user_profile_image
    };
  }

  async deleteProductReview(id: number): Promise<boolean> {
    const [result] = await this.pool.execute('DELETE FROM product_reviews WHERE id = ?', [id]);
    const deleteResult = result as mysql.ResultSetHeader;
    return deleteResult.affectedRows > 0;
  }

  // Close the connection pool
  async close(): Promise<void> {
    await this.pool.end();
  }
}


