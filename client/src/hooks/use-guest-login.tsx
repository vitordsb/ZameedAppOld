import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

export function useGuestLogin() {
  const { toast } = useToast();

  const guestLoginMutation = useMutation({
    mutationFn: async () => {
      try {
        const res = await apiRequest("POST", "/api/auth/guest-login");
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to login as guest");
        }
        
        const data = await res.json();
        return data.user as User;
      } catch (error) {
        console.error("Guest login fetch error:", error);
        throw error;
      }
    },
    onSuccess: (user) => {
      // Update the user data in the cache
      queryClient.setQueryData(["/api/auth/me"], user);
      
      toast({
        title: "Welcome, Guest!",
        description: "You are now logged in as a guest user.",
      });
    },
    onError: (error: any) => {
      console.error("Guest login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "Unable to log in as guest. Please try again.",
        variant: "destructive",
      });
    },
  });

  return guestLoginMutation;
}