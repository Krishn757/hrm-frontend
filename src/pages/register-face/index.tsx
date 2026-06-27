import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { CameraView } from "@/components/CameraView";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RegisterFace() {
  const navigate = useNavigate();
  const { setFaceRegistered, email } = useAuthStore();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCapture = (base64Image: string) => {
    setIsCapturing(true);
    toast.info("Analyzing facial features...");
    
    setTimeout(() => {
      setIsCapturing(false);
      setIsSuccess(true);
      setFaceRegistered(true);
      toast.success("Face registered successfully!");
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Face Registration</CardTitle>
          <CardDescription>
            {isSuccess ? "Registration complete." : "Please register your face once to enable AI Attendance."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          {!isSuccess ? (
            <CameraView onCapture={handleCapture} isLoading={isCapturing} />
          ) : (
            <div className="flex flex-col items-center py-8 gap-4">
              <CheckCircle2 className="w-24 h-24 text-green-500" />
              <p className="text-lg font-medium text-center">
                Face ID configured for <br/> <span className="text-primary">{email}</span>
              </p>
              <Button onClick={() => navigate("/dashboard")} className="w-full mt-4" size="lg">
                Go to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
