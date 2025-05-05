import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@shared/schema';

// Define the shape of the auth context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // Query for the current user
  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ['/api/auth/me'],
    // We want to render even if the query fails (user is not logged in)
    retry: false,
    // This prevents a flash of unauthenticated state on page loads
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Update logged in state when user data changes
  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Clear user from cache
      queryClient.setQueryData(['/api/auth/me'], null);
      setIsLoggedIn(false);
      
      // Invalidate queries that might depend on auth state
      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to refetch user data
  const refetchUser = async () => {
    await refetch();
  };

  // Context value
  const value = {
    user: user || null,
    isLoading,
    isLoggedIn,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};