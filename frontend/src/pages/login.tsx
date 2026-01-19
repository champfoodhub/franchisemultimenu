import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@shared/routes";
import { Button, Input, Card } from "@/components/ui-custom";
import { Menu, UtensilsCrossed } from "lucide-react";
import { Redirect } from "wouter";

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  
  const formSchema = api.auth.login.input;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { username: "", password: "" },
  });

  if (user) {
    if (user.role === "HQ_ADMIN") return <Redirect to="/hq" />;
    return <Redirect to="/branch" />;
  }

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    login(data);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/20 p-4 font-body">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-xl shadow-primary/30 mb-6 rotate-3">
            <Menu className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold font-display tracking-tight text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground text-lg">Sign in to manage your FoodHub restaurant.</p>
        </div>

        <Card className="border-t-4 border-t-primary shadow-2xl shadow-primary/5">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-2">
            <Input 
              label="Username" 
              placeholder="admin" 
              {...form.register("username")} 
              error={form.formState.errors.username?.message}
            />
            
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              {...form.register("password")}
              error={form.formState.errors.password?.message}
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign In to Dashboard
            </Button>

            <div className="text-center text-xs text-muted-foreground pt-2">
              <p>Demo accounts:</p>
              <p>HQ Admin: hq / password123</p>
              <p>Branch Manager: manager / password123</p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
