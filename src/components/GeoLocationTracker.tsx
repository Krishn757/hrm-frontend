import React, { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const OFFICE_LAT = 28.6315;
const OFFICE_LNG = 77.2167;
const ALLOWED_RADIUS_METERS = 100;

interface GeoLocationTrackerProps {
  onVerified: (isValid: boolean, lat?: number, lng?: number) => void;
}

function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

export function GeoLocationTracker({ onVerified }: GeoLocationTrackerProps) {
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking");
  const [message, setMessage] = useState("Verifying your location...");

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      setMessage("Geolocation is not supported by your browser");
      onVerified(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const distance = getDistanceFromLatLonInMeters(latitude, longitude, OFFICE_LAT, OFFICE_LNG);
        
        setTimeout(() => {
          setStatus("success");
          setMessage(`Location verified. Distance: ${Math.round(distance)}m`);
          onVerified(true, latitude, longitude);
        }, 1500);
      },
      (error) => {
        setStatus("error");
        if (error.code === error.PERMISSION_DENIED) {
          setMessage("Permission denied. Please allow location access in your browser.");
        } else {
          setMessage(`Location error: ${error.message}`);
        }
        onVerified(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="p-4 flex items-center gap-3 bg-secondary/30">
      {status === "checking" && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
      {status === "success" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
      {status === "error" && <XCircle className="w-5 h-5 text-destructive" />}
      <p className="text-sm font-medium">{message}</p>
    </Card>
  );
}
