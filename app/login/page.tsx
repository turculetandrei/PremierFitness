"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [eroare, setEroare] = useState<string | null>(null);
  const [seIncarca, setSeIncarca] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEroare(null);
    setSeIncarca(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: parola,
    });

    if (error) {
      setEroare("Email sau parolă incorecte. Încearcă din nou.");
      setSeIncarca(false);
      return;
    }

    // Reîmprospătează componentele server cu noua sesiune
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      {/* fundal cu glow portocaliu discret */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <Card className="relative w-full max-w-sm p-6 sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size="lg" />
          <p className="mt-6 text-sm text-muted">
            Autentifică-te pentru a gestiona membrii și abonamentele.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              placeholder="nume@premierfitness.ro"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="parola">Parolă</Label>
            <Input
              id="parola"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={parola}
              onChange={(e) => setParola(e.target.value)}
            />
          </div>

          {eroare && (
            <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              {eroare}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={seIncarca}
          >
            {seIncarca ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogIn />
            )}
            {seIncarca ? "Se autentifică..." : "Autentificare"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
