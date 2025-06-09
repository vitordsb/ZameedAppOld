import { MySQLStorage } from './server/mysql-storage';

async function initializeDatabase() {
  console.log('🔄 Initializing database...');
  
  const storage = new MySQLStorage();
  
  try {
    // Test connection
    await storage.getAllUsers();
    console.log('✅ Database connection successful');
    
    // Create admin user
    const adminUser = await storage.createUser({
      username: 'root',
      email: 'admin@zameed.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
      name: 'Administrator',
      userType: 'admin'
    });
    console.log('✅ Admin user created:', adminUser.username);
    
    // Create guest user
    const guestUser = await storage.createUser({
      username: 'guest_user',
      email: 'guest@zameed.com',
      password: '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', // guestpass
      name: 'Guest User',
      userType: 'user'
    });
    console.log('✅ Guest user created:', guestUser.username);
    
    // Create test designer user
    const designerUser = await storage.createUser({
      username: 'test_designer',
      email: 'designer@zameed.com',
      password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
      name: 'Test Designer',
      userType: 'designer'
    });
    console.log('✅ Designer user created:', designerUser.username);
    
    // Create designer profile
    const designer = await storage.createDesigner({
      userId: designerUser.id,
      name: 'Test Designer',
      title: 'Senior Interior Designer',
      bio: 'Experienced interior designer specializing in modern and contemporary styles.',
      style: 'Modern',
      description: 'I create beautiful, functional spaces that reflect your personality and lifestyle.',
      hourlyRate: 100,
      rating: 4.8,
      reviewCount: 25,
      location: 'Lisboa, Portugal',
      portfolioImages: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
      ],
      specialties: ['Interior Design', 'Space Planning', 'Color Consultation'],
      experienceYears: 8,
      education: 'Master in Interior Design - Universidade de Lisboa',
      certifications: ['NCIDQ Certified', 'LEED AP'],
      languages: ['Portuguese', 'English', 'Spanish'],
      availabilityStatus: 'available',
      responseTime: '2 hours'
    });
    console.log('✅ Designer profile created:', designer.name);
    
    // Create sample posts
    const post1 = await storage.createPost({
      designerId: designer.id,
      title: 'Modern Living Room Transformation',
      content: 'Check out this amazing living room transformation! We focused on clean lines, neutral colors, and natural light to create a serene and sophisticated space.',
      images: [
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2'
      ],
      tags: ['modern', 'living room', 'transformation']
    });
    console.log('✅ Sample post created:', post1.title);
    
    // Create sample products
    const product1 = await storage.createProduct({
      sellerId: designerUser.id,
      name: 'Modern Minimalist Chair',
      description: 'A beautifully crafted minimalist chair perfect for modern interiors. Made with sustainable materials and designed for comfort.',
      price: 299.99,
      category: 'Furniture',
      subcategory: 'Chairs',
      style: 'Modern',
      images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237'],
      featured: true,
      inStock: true,
      stockQuantity: 15
    });
    console.log('✅ Sample product created:', product1.name);
    
    // Create sample messages
    const message1 = await storage.createMessage({
      senderId: guestUser.id,
      receiverId: designerUser.id,
      content: 'Hi! I\'m interested in your interior design services. Could we schedule a consultation?'
    });
    console.log('✅ Sample message created');
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied. Please check your MySQL credentials.');
    } else if (error.code === 'ENOTFOUND') {
      console.error('Host not found. Please check your MySQL host.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist. Please create the database first.');
    }
  } finally {
    await storage.close();
  }
}

// Run initialization
initializeDatabase();


