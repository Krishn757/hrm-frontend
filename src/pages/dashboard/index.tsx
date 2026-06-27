import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useAttendanceStore } from "@/store/useAttendanceStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Fingerprint, MapPin, CheckCircle2 } from "lucide-react";
import { CameraView } from "@/components/CameraView";
import { GeoLocationTracker } from "@/components/GeoLocationTracker";
import { toast } from "sonner";
import api from "@/lib/api";

type Step = "idle" | "location" | "camera" | "verifying" | "done";

export default function Dashboard() {
  const navigate = useNavigate();
  const { email, logout } = useAuthStore();
  const { hasPunchedIn, hasPunchedOut, punchInTime, punchOutTime, setPunchIn, setPunchOut } = useAttendanceStore();
  
  const [step, setStep] = useState<Step>("idle");
  const [actionType, setActionType] = useState<"in" | "out" | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationText, setLocationText] = useState<string | null>(null);
  const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error">("idle");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const startAction = (type: "in" | "out") => {
    setActionType(type);
    setStep("location");
  };

  const handleLocationVerified = async (isValid: boolean, lat?: number, lng?: number) => {
    if (isValid && lat !== undefined && lng !== undefined) {
      setCurrentLocation({ lat, lng });
      
      // Fetch text address using Backend Proxy for Google Maps API (to bypass CORS)
      try {
        const res = await api.get(`/attendance/geocode?lat=${lat}&lng=${lng}`);
        const data = res.data;
        
        if (data.status === "OK" && data.results && data.results.length > 0) {
          setLocationText(data.results[0].formatted_address);
        } else {
          setLocationText(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
          console.error("Geocoding Error:", data);
        }
      } catch (err) {
        setLocationText(`Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
        console.error("Geocoding Fetch Failed:", err);
      }

      setTimeout(() => setStep("camera"), 1000);
    } else if (isValid) {
      setTimeout(() => setStep("camera"), 1000);
    } else {
      setTimeout(() => setStep("idle"), 2000);
    }
  };

  const handleFaceCaptured = async (base64Image: string) => {
    setStep("verifying");
    setValidationStatus("idle");
    toast.info("Verifying face identity...");
    
    try {
      if (actionType === "in") {
        const response = await api.post('/attendance/punch-in', { 
          lat: currentLocation?.lat, 
          lng: currentLocation?.lng,
          image: base64Image
        });
        setPunchIn(response.data.punchInTime);
        setValidationStatus("success");
        toast.success("Successfully Punched In!");
      } else {
        const response = await api.post('/attendance/punch-out', {
          image: base64Image
        });
        setPunchOut(response.data.punchOutTime);
        setValidationStatus("success");
        toast.success("Successfully Punched Out!");
      }

      // Wait a moment so user can see the green border
      setTimeout(() => {
        setStep("idle");
        setActionType(null);
        setValidationStatus("idle");
      }, 1500);

    } catch (error: any) {
      setValidationStatus("error");
      toast.error(error.response?.data?.error || "Failed to process attendance");
      
      // Wait a moment so user can see the red border, then let them try again
      setTimeout(() => {
        setStep("camera");
        setValidationStatus("idle");
      }, 2000);
    }
  };

  const isDayCompleted = hasPunchedIn && hasPunchedOut;

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 md:p-8">
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between py-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">HRM Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome, {email}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full gap-8">
        {step !== "idle" ? (
          <Card className="w-full max-w-md shadow-lg border-primary/20">
            <CardHeader className="text-center">
              <CardTitle>{actionType === "in" ? "Punch In" : "Punch Out"} Verification</CardTitle>
              <CardDescription>
                {step === "location" && "Verifying your office location"}
                {step === "camera" && "Please look at the camera"}
                {step === "verifying" && "Checking AI Identity..."}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 pb-8">
              {step === "location" && <div className="w-full"><GeoLocationTracker onVerified={handleLocationVerified} /></div>}
              {(step === "camera" || step === "verifying") && <CameraView onCapture={handleFaceCaptured} isLoading={step === "verifying"} validationStatus={validationStatus} />}
            </CardContent>
            {step === "location" && (
              <CardFooter>
                <Button variant="ghost" className="w-full" onClick={() => setStep("idle")}>Cancel</Button>
              </CardFooter>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
            <Card className="shadow-md bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Punch In</span>
                  <span className="font-medium">{hasPunchedIn && punchInTime ? new Date(punchInTime).toLocaleTimeString() : "--:--"}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Punch Out</span>
                  <span className="font-medium">{hasPunchedOut && punchOutTime ? new Date(punchOutTime).toLocaleTimeString() : "--:--"}</span>
                </div>
                {isDayCompleted && (
                  <div className="flex items-center gap-2 text-green-600 font-medium py-2">
                    <CheckCircle2 className="w-5 h-5" /> Day Completed
                  </div>
                )}
                {locationText && currentLocation && (
                  <div className="flex flex-col py-2 border-t mt-2 text-xs gap-1">
                    <span className="text-muted-foreground flex items-center justify-between gap-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</span>
                      <a 
                        href={`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View on Maps
                      </a>
                    </span>
                    <span className="bg-secondary/50 px-2 py-1.5 rounded text-primary text-right leading-relaxed font-medium">
                      {locationText}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-md border-primary/20 bg-card/50 flex flex-col justify-center items-center p-8 text-center gap-6">
              {!hasPunchedIn ? (
                <>
                  <div className="p-4 bg-primary/10 rounded-full"><MapPin className="w-8 h-8 text-primary" /></div>
                  <Button size="lg" className="w-full text-lg h-14 shadow-lg" onClick={() => startAction("in")}>Punch In</Button>
                </>
              ) : !hasPunchedOut ? (
                <>
                  <div className="p-4 bg-secondary rounded-full"><Fingerprint className="w-8 h-8 text-primary" /></div>
                  <Button size="lg" variant="secondary" className="w-full text-lg h-14 shadow-lg border border-primary/20" onClick={() => startAction("out")}>Punch Out</Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 opacity-80">
                  <div className="p-4 bg-green-100 text-green-600 rounded-full"><CheckCircle2 className="w-12 h-12" /></div>
                  <h3 className="text-xl font-bold">See you tomorrow!</h3>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
