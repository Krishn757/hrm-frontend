import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogOut, UserPlus, Users } from "lucide-react";
import api from "@/lib/api";
import { CameraView } from "@/components/CameraView";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, email, role } = useAuthStore();
  const [empEmail, setEmpEmail] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState<{email: string, created_at: string}[]>([]);
  const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (role !== "admin") {
      navigate("/admin/login");
      return;
    }
    
    // Fetch Employees
    const fetchEmployees = async () => {
      try {
        const res = await api.get('/admin/employees');
        setEmployees(res.data.employees);
      } catch (err) {
        toast.error("Failed to fetch employees");
      }
    };
    fetchEmployees();
  }, [role, navigate]);

  if (role !== "admin") return null;

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empEmail || !empPassword) {
      toast.error("Please provide both email and password");
      return;
    }
    if (!capturedImage) {
      toast.error("Please capture employee face first");
      return;
    }

    setIsLoading(true);
    setValidationStatus("idle");
    try {
      await api.post('/admin/create-employee', { 
        email: empEmail, 
        password: empPassword,
        image: capturedImage
      });
      setValidationStatus("success");
      setEmployees([...employees, { email: empEmail, created_at: new Date().toISOString() }]);
      setEmpEmail("");
      setEmpPassword("");
      toast.success("Employee and Face registered successfully!");
      
      setTimeout(() => {
        setCapturedImage(null);
        setValidationStatus("idle");
      }, 1500);

    } catch (err: any) {
      setValidationStatus("error");
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to create employee");
      
      setTimeout(() => {
        setValidationStatus("idle");
        // We let them keep the image or retake it
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col p-4 md:p-8">
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Admin Control Panel</h1>
          <p className="text-sm text-muted-foreground">Logged in as {email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2"><LogOut className="w-4 h-4" /> Logout</Button>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
        <div className="md:col-span-1">
          <Card className="shadow-lg border-primary/20 sticky top-8">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2"><UserPlus className="w-5 h-5 text-primary" /> <CardTitle className="text-xl">Add Employee</CardTitle></div>
              <CardDescription>Create new credentials for staff</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateEmployee}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="empEmail">Email Address</Label>
                  <Input id="empEmail" type="email" placeholder="employee@company.com" value={empEmail} onChange={(e) => setEmpEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empPassword">Temporary Password</Label>
                  <Input id="empPassword" type="password" placeholder="••••••••" value={empPassword} onChange={(e) => setEmpPassword(e.target.value)} />
                </div>
                <div className="space-y-2 border rounded-lg p-2 bg-secondary/20">
                  <Label>Employee Face Registration</Label>
                  {capturedImage ? (
                    <div className="relative rounded overflow-hidden">
                      <img src={capturedImage} alt="Captured" className="w-full h-auto" />
                      <Button type="button" size="sm" variant="destructive" className="absolute top-2 right-2" onClick={() => setCapturedImage(null)}>
                        Retake
                      </Button>
                    </div>
                  ) : (
                    <CameraView onCapture={(img) => setCapturedImage(img)} validationStatus={validationStatus} />
                  )}
                </div>
                <Button className="w-full mt-2" type="submit" disabled={isLoading || !capturedImage}>{isLoading ? "Registering..." : "Create Account & Register Face"}</Button>
              </CardContent>
            </form>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="shadow-lg min-h-[400px]">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-primary" /> <CardTitle className="text-xl">Recent Employees</CardTitle></div>
              <CardDescription>List of newly registered staff members</CardDescription>
            </CardHeader>
            <CardContent>
              {employees.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg bg-secondary/20">
                  <Users className="w-12 h-12 mb-4 opacity-20" />
                  <p>No employees created yet.</p>
                  <p className="text-sm">Use the form to add a new employee.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employees.map((emp, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm">
                      <div>
                        <p className="font-medium">{emp.email}</p>
                        <p className="text-sm text-muted-foreground">Joined: {new Date(emp.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
