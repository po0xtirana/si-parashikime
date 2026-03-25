import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Auth() {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isSignUp) {
      if (username.length < 3) { toast.error("Emri i përdoruesit duhet të ketë të paktën 3 karaktere"); setSubmitting(false); return; }
      const { error } = await signUp(email, password, username);
      if (error) toast.error(error);
      else toast.success("Llogaria u krijua! Kontrolloni email-in tuaj.");
    } else {
      const { error } = await signIn(email, password);
      if (error) toast.error(error);
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold mb-1">SI Parashikime</h1>
          <p className="text-muted-foreground text-sm">
            {isSignUp ? "Krijoni llogarinë tuaj" : "Hyni në llogarinë tuaj"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="username">Emri i përdoruesit</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Emri juaj publik"
                required
                minLength={3}
                maxLength={30}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ju@shembull.com"
              required
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Fjalëkalimi</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              maxLength={128}
            />
          </div>
          <Button type="submit" className="w-full font-semibold" disabled={submitting}>
            {submitting ? "Duke ngarkuar..." : isSignUp ? "Krijo Llogarinë" : "Hyr"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? "Keni tashmë një llogari?" : "Nuk keni llogari?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-foreground hover:underline font-medium"
          >
            {isSignUp ? "Hyni" : "Regjistrohuni"}
          </button>
        </p>

        {isSignUp && (
          <p className="text-xs text-center text-muted-foreground/60">
            Do të merrni 1,000 Kredite SI pas regjistrimit.
          </p>
        )}
      </div>
    </div>
  );
}
