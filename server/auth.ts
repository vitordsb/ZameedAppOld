import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { storage } from './storage';
import { User } from '@shared/schema';
import type { Express } from 'express';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import { log } from './vite';

// Create memorystore
const MemoryStore = createMemoryStore(session);

export function setupAuth(app: Express) {
  // Session setup with MemoryStore
  app.use(
    session({
      secret: 'designer-marketplace-secret',
      resave: false,
      saveUninitialized: false,
      cookie: { 
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Helps prevent CSRF
        httpOnly: true, // Prevents client-side JS from reading the cookie
      },
      store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      })
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure LocalStrategy for username/password authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Validate username and password
        const user = await storage.validateUserPassword(username, password);
        
        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }
        
        return done(null, user);
      } catch (error) {
        log(`Login error: ${error}`, 'auth');
        return done(error);
      }
    })
  );

  // Serialize user for session storage
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as User).id);
  });

  // Deserialize user from session storage
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || false);
    } catch (error) {
      done(error);
    }
  });

  // Authentication middleware that returns 401 for API routes
  // when user is not authenticated, but allows public routes
  app.use((req, res, next) => {
    // List of public routes that don't require authentication
    const publicRoutes = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/guest-login',
      '/api/designers',
      '/api/designers/filter/style',
      '/api/designers/filter/price',
      '/api/designers/filter/location',
      '/api/posts',
      '/api/posts/likes',
      '/api/posts/comments',
      '/api/admin/bootstrap'
    ];
    
    // Debug all API routes
    if (req.path.startsWith('/api/')) {
      console.log('API Path:', req.path, 'Method:', req.method, 'Is Authenticated:', req.isAuthenticated());
    }
    
    // Check if the path is a public route or starts with a public route
    const isPublicRoute = publicRoutes.some(route => 
      req.path === route || req.path.startsWith(`${route}/`)
    );
    
    if (req.path.startsWith('/api/') && 
        !isPublicRoute && 
        !req.isAuthenticated()) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  });
}

// Middleware to check if user is authenticated
export function isAuthenticated(req: any, res: any, next: any) {
  console.log(`isAuthenticated check for ${req.path}:`, {
    isAuthenticated: req.isAuthenticated(),
    hasUser: !!req.user,
    session: req.session?.id,
    cookiesHeader: req.headers.cookie,
  });
  
  if (req.isAuthenticated()) {
    return next();
  }
  
  console.log("Authentication failed for path:", req.path);
  res.status(401).json({ message: 'Unauthorized' });
}

// Middleware to check if user is a designer
export function isDesigner(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user.userType === 'designer') {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Designer role required.' });
}

// Middleware to check if user is an admin
export function isAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user.userType === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Admin role required.' });
}