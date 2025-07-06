
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type LoginForm = {
  email: string;
  password: string;
};

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
  type: "contratante" | "prestador";
  termos_aceitos: boolean;
};


interface AuthModalsProps {
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  onLoginClose: () => void;
  onRegisterClose: () => void;
  onAuthSuccess?: () => void;
  onSwitchToRegister: () => void;
  onSwitchToLogin: () => void;
}

export const AuthModals = ({
  isLoginOpen,
  isRegisterOpen,
  onLoginClose,
  onRegisterClose,
  onAuthSuccess,
  onSwitchToRegister,
  onSwitchToLogin,
}: AuthModalsProps) => {
  const { toast } = useToast();
  const { loginMutation, isLoading } = useAuth();
  const { registerMutation, isLoading: isRegisterLoading } = useAuth();

  const loginForm = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

const registerForm = useForm<RegisterForm>({
  defaultValues: {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    type: "contratante",
    termos_aceitos: false,
  },
});

const onLoginSubmit = async (data: LoginForm) => {
  try {
    await loginMutation.mutateAsync({
      email: data.email,
      password: data.password,
    });
    console.log("✅ Login efetuado com sucesso!");
    loginForm.reset();
    onLoginClose();
    onAuthSuccess?.();
  } catch (error) {
    toast({
      title: "Erro no login",
      description:
        (error as Error).message || "Não foi possível fazer login.",
      variant: "destructive",
    });
  }
};

const onRegisterSubmit = async (data: RegisterForm) => {
  try {
    const { confirmPassword, ...payload } = data;
    await registerMutation.mutateAsync(payload);
    console.log("✅ Cadastro efetuado com sucesso!");
    registerForm.reset();
    onRegisterClose();
    onAuthSuccess?.();
  } catch (error) {
    toast({
      title: "Erro no cadastro",
      description: (error as Error).message || "Erro desconhecido",
      variant: "destructive",
    });
  }
};

  return (
    <>
      {/* Login Modal */}
      <Dialog open={isLoginOpen} onOpenChange={onLoginClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Login</DialogTitle>
            <DialogDescription>
              Acesse sua conta usando e-mail e senha.
            </DialogDescription>
          </DialogHeader>
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
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
                      <Input type="password" placeholder="••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button disabled={isLoading} type="submit">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Entrar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={isRegisterOpen} onOpenChange={onRegisterClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastro</DialogTitle>
            <DialogDescription>
              Crie sua conta preenchendo os campos abaixo.
            </DialogDescription>
          </DialogHeader>
          <Form {...registerForm}>
  <form
    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
    className="space-y-4"
  >
    <FormField
      control={registerForm.control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome</FormLabel>
          <FormControl>
            <Input placeholder="Seu nome" {...field} />
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
            <Input placeholder="email@exemplo.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={registerForm.control}
      name="cpf"
      render={({ field }) => (
        <FormItem>
          <FormLabel>CPF</FormLabel>
          <FormControl>
            <Input placeholder="12345678900" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={registerForm.control}
      name="type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de usuário</FormLabel>
          <FormControl>
            <select {...field} className="w-full border rounded p-2">
              <option value="contratante">Contratante</option>
              <option value="prestador">Prestador</option>
            </select>
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
            <Input type="password" placeholder="••••••" {...field} />
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
          <FormLabel>Confirme a Senha</FormLabel>
          <FormControl>
            <Input type="password" placeholder="••••••" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={registerForm.control}
      name="termos_aceitos"
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <FormLabel>Aceito os termos e condições.</FormLabel>
          <FormMessage />
        </FormItem>
      )}
    />
    <DialogFooter>
      <Button disabled={isLoading} type="submit">
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Cadastrar
      </Button>
    </DialogFooter>
  </form>
</Form>        </DialogContent>
      </Dialog>
    </>
  );
};

