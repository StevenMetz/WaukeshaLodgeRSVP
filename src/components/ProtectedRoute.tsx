"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import LodgeEmblem from "./LodgeEmblem";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push("/admin");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="bg-lodge-gray-light flex items-center justify-center min-h-screen p-4">
        <div className="animate-pulse flex flex-col items-center">
          <LodgeEmblem size={70} />
          <p className="mt-4 text-lodge-navy font-semibold text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
}
