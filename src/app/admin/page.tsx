"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase";
import { useRouter } from "next/navigation";
import LodgeEmblem from "../../components/LodgeEmblem";
import InputField from "../../components/ui/InputField";
import SubmitButton from "../../components/ui/SubmitButton";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      console.error("Login failed", err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-lodge-gray-light flex items-center justify-center min-h-screen p-4">
      <div className="bg-lodge-white p-7 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center mb-7">
          <div className="flex flex-col items-center justify-center gap-4 mb-4">
            <LodgeEmblem size={70} />
            <h1 className="text-2xl font-serif font-bold text-lodge-navy mt-2">Admin Login</h1>
            <p className="text-base text-lodge-navy">Sign in to manage RSVP configurations</p>
          </div>
        </div>

        <div className="w-full h-1 bg-lodge-gold mb-7"></div>

        <form onSubmit={handleLogin} className="space-y-5">
          <InputField
            label="Email Address"
            placeholder="admin@example.com"
            type="email"
            name="email"
            fieldId="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />

          <InputField
            label="Password"
            placeholder="••••••••"
            type="password"
            name="password"
            fieldId="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />

          {error && (
            <p className="text-red-500 text-sm font-medium text-center">{error}</p>
          )}

          <SubmitButton
            isLoading={isLoading}
            text="Sign In"
            loadingText="Signing In..."
          />
        </form>
      </div>
    </div>
  );
}
