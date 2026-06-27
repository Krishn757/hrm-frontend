import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import api from "@/lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuthData = useAuthStore((state) => state.setAuthData);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.user.role !== 'admin') {
         toast.error("Only admins can access this portal");
         setIsLoading(false);
         return;
      }
      
      setAuthData(response.data.token, response.data.user);
      toast.success("Admin login successful");
      navigate("/admin/dashboard");
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.error || error.message || "Login failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2"><ShieldCheck className="w-16 h-16 text-primary" /></div>
          <CardTitle className="text-2xl font-bold tracking-tight">Admin Portal</CardTitle>
          <CardDescription>Secure login for Human Resources Management</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input id="email" type="email" placeholder="admin@hrm.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={isLoading}>{isLoading ? "Authenticating..." : "Access Dashboard"}</Button>
            <div className="text-sm text-center text-muted-foreground mt-4">
              <Link to="/login" className="hover:text-primary transition-colors">&larr; Back to Employee Login</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
