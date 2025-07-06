
// src/hooks/use-auth.tsx
import React, { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { parseJwt } from "@/lib/utils";

export interface OldAuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

type LoginData = z.infer<typeof loginSchema>;
const loginSchema = z.object({
  email: z.string().min(1, "email is required"),
  password: z.string().min(1, "Password is required"),
});
type RegisterData = z.infer<typeof registerSchema>;
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
type RegisterPayload = Omit<RegisterData, "confirmPassword">;

export type AuthContextType = OldAuthContextType & {
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterPayload>;
  isGuest: boolean;
  loginAsGuest: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = parseJwt<{ user: User }>(token);
      setUser(payload?.user ?? null);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials) => {
      loginSchema.parse(credentials);
      const res = await apiRequest("POST", "/auth/login", credentials);
      const data = await res.json();
      return data as User;
    },
    onSuccess: (user) => {
      setUser(user);
      setIsGuest(false);
      toast({ title: "Login realizado", description: "Parabéns, você efetuou o login com sucesso!" });
      queryClient.setQueryData(["/auth/login"], user);
    },
    onError: (error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation<User, Error, RegisterPayload>({
    mutationFn: async (userData) => {
      registerSchema.parse({ ...userData, confirmPassword: userData.password });
      const res = await apiRequest("POST", "/auth/register", userData);
      const data = await res.json();
      return data.user as User;
    },
    onSuccess: (user) => {
      setUser(user);
      setIsGuest(false);
      toast({ title: "Registration successful", description: "Your account has been created successfully" });
      queryClient.setQueryData(["/auth/login"], user);
    },
    onError: (error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      localStorage.removeItem("token");
      setUser(null);
      setIsGuest(false);
      toast({ title: "Logged out", description: "You have been successfully logged out" });
      queryClient.setQueryData(["/auth/login"], null);
    },
    onError: (error) => {
      toast({ title: "Logout failed", description: error.message, variant: "destructive" });
    },
  });

  const loginAsGuest = () => {
    setIsGuest(true);
    setUser(null);
  };

  // Compatibilidade com OldAuthContextType
  const oldContext: OldAuthContextType = {
    user,
    isLoading,
    isLoggedIn: !!user,
    logout: () => logoutMutation.mutateAsync(),
    refetchUser: () => queryClient.invalidateQueries(["/auth/login"]),
  };

  return (
    <AuthContext.Provider
      value={{
        ...oldContext,
        error: null,
        loginMutation,
        logoutMutation,
        registerMutation,
        isGuest,
        loginAsGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

