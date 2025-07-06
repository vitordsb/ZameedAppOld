import { createContext, ReactNode, useContext, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User, insertUserSchema } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {useEffect } from "react";
import { parseJwt } from "@/lib/utils";
export interface OldAuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}
const loginSchema = z.object({
  email: z.string().min(1, "email is required"),
  password: z.string().min(1, "Password is required"),
});
const registerSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "Confirme sua senha"),
  cpf: z.string().min(11, "CPF inválido"),
  type: z.enum(["contratante", "prestador"]),
  termos_aceitos: z.boolean().refine((val) => val === true, {
    message: "É preciso aceitar os termos",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterPayload>;
};

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type RegisterPayload = Omit<RegisterData, "confirmPassword">;

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = parseJwt<{ user: User}>(token);
      setUser(payload?.user ?? null);
    } else {
      setUser(null);
    }
    setIsLoading(false)
  })

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Attempting login with:", credentials);
      const res = await apiRequest("POST", "/auth/login", credentials);
      const user = await res.json();
      console.log("Login response:", user);
      return user; // Server now returns the user object directly
    },
    onSuccess: (user: User) => {
      console.log("Login successful:", user);
      queryClient.setQueryData(["/auth/login"], user);
      toast({
        title: "Login successful",
        description: "You have been successfully logged in",
      });
    },
    onError: (error: Error) => {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your username and password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<User, Error, RegisterPayload>({
    mutationFn: async (userData) => {
      console.log("Attempting registration with:", userData);
      const res = await apiRequest("POST", "/auth/register", userData);
      const data = await res.json();
      console.log("Registration response:", data);
      return data.user; // We expect server to return { user: User }
    },
    onSuccess: (user: User) => {
      console.log("Registration successful:", user);
      queryClient.setQueryData(["/auth/login"], user);
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Registration failed:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different credentials",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/auth/login"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error: null,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType & OldAuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  // Add backward compatibility with old AuthContext
  const oldContextCompatibility: OldAuthContextType = {
    user: context.user,
    isLoading: context.isLoading,
    isLoggedIn: !!context.user,
    logout: async () => {
      await context.logoutMutation.mutateAsync();
    },
    refetchUser: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/auth/login"] });
    }
  };
  
  return {
    ...context,
    ...oldContextCompatibility
  };
}
