import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

// Schema for login
const loginSchema = z.object({
  username: z.string().min(1, "Apelido é necessário"),
  password: z.string().min(1, "Senha é indispensável"),
});

// Schema for registration
const registerSchema = z.object({
  username: z.string().min(3, "Apelido deve conter no mínimo 3 caracteres"),
  name: z.string().min(2, "Nome completo é necessário"),
  email: z.string().email("Por favor preencha um email válido"),
  password: z.string().min(6, "Senha deve conter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(6, "Por favor confirme sua senha"),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "É obrigatório aceitar os termos para se cadastrar" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface AuthModalsProps {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  onLoginClose: () => void;
  onRegisterClose: () => void;
  onSuccess: () => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
}

export const AuthModals = ({
  isLoginOpen,
  isRegisterOpen,
  onLoginClose,
  onRegisterClose,
  onSuccess,
  onSwitchToRegister,
  onSwitchToLogin,
}: AuthModalsProps) => {
  const { toast } = useToast();
  
  // Login form
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });


  // Watch for login success
  const { loginMutation, registerMutation } = useAuth();
  useEffect(() => {
    if (loginMutation.isSuccess) {
      toast({
        title: "Login com sucesso",
        description: "Você está logado com sucesso",
      });
      
      loginForm.reset();
      onLoginClose();
      onSuccess();
    }
  }, [loginMutation.isSuccess, toast, loginForm, onLoginClose, onSuccess]);

  // Watch for login errors
  useEffect(() => {
    if (loginMutation.isError) {
      toast({
        title: "Algo deu errado",
        description: loginMutation.error?.message || "Por favor verifique as credênciais",
        variant: "destructive",
      });
    }
  }, [loginMutation.isError, loginMutation.error, toast]);

  // Watch for register success
  useEffect(() => {
    if (registerMutation.isSuccess) {
      toast({
        title: "Registro com sucesso",
        description: "Sua conta foi criada com sucesso",
      });
      
      registerForm.reset();
      onRegisterClose();
      onSwitchToLogin();
    }
  }, [registerMutation.isSuccess, toast, registerForm, onRegisterClose, onSwitchToLogin]);

  // Watch for register errors
  useEffect(() => {
    if (registerMutation.isError) {
      toast({
        title: "Registro falhou",
        description: registerMutation.error?.message || "Por favor, preencha corretamente",
        variant: "destructive",
      });
    }
  }, [registerMutation.isError, registerMutation.error, toast]);

  const onLoginSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  return (
    <>
      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={onLoginClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Login para ZameedApp</DialogTitle>
            <DialogDescription>
            Preencha as informações abaixo para fazer o login
            </DialogDescription>
          </DialogHeader>
          
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apelido</FormLabel>
                    <FormControl>
                      <Input placeholder="Insira seu nome" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Coloque sua senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-2 sm:mt-0"
                  onClick={onSwitchToRegister}
                >
                Não possui uma conta? Crie agora
                </Button>
                <Button type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Por favor espere
                    </>
                  ) : (
                    "Fazer login"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRegisterOpen} onOpenChange={onRegisterClose}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Crie sua conta</DialogTitle>
            <DialogDescription>
              Crie sua conta para começar a usar ZameedApp
            </DialogDescription>
          </DialogHeader>
          
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apelido</FormLabel>
                    <FormControl>
                      <Input placeholder="Escolha um apelido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo </FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Coloque seu email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Crie sua senha" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={registerForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar senha</FormLabel>
                    <Input type="password" placeholder="Confirme sua senha" {...field} />
                    <FormControl>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
  control={registerForm.control}
  name="acceptTerms"
  render={({ field }) => (
    <FormItem>
      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          id="acceptTerms"
          className="mt-1"
          {...field}
          checked={field.value}
          onChange={(e) => field.onChange(e.target.checked)}  
        />
        <FormLabel htmlFor="acceptTerms" className="text-sm cursor-pointer">
          Declaro que li e aceito integralmente os <a href="/termos" className="underline text-amber-600">termos de uso</a> da plataforma
        </FormLabel>
      </div>
      <FormMessage />
    </FormItem>
  )}
/>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-2 sm:mt-0"
                  onClick={onSwitchToLogin}
                >
                Já possui conta? Faça login
                </Button>
                <Button type="submit" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />Por favor espere
                    </>
                  ) : (
                    "Enviar registro"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
