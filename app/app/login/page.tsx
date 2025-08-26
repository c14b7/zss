"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Account, Client, Models } from "appwrite";
import { LoginForm } from "@/components/login-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setProject("687abe96000d2d31f914");

const account = new Account(client);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await account.createEmailSession(email, password);
    await checkAuth();
  };

  const register = async (email: string, password: string, name: string) => {
    await account.create("unique()", email, password, name);
    await login(email, password);
  };

  const logout = async () => {
    await account.deleteSession("current");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default function LoginPage() {
  const { login, register, user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");

  // Redirect if already logged in
  if (user) {
    router.push("/inbox");
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success("Zalogowano pomyślnie!");
        router.push("/inbox");
      } else {
        if (!formData.name.trim()) {
          setError("Nazwa użytkownika jest wymagana");
          return;
        }
        await register(formData.email, formData.password, formData.name);
        toast.success("Konto zostało utworzone i jesteś zalogowany!");
        router.push("/inbox");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message?.includes("Invalid credentials")) {
        setError("Nieprawidłowy email lub hasło");
      } else if (error.message?.includes("password")) {
        setError("Hasło musi mieć co najmniej 8 znaków");
      } else if (error.message?.includes("email")) {
        setError("Nieprawidłowy format adresu email");
      } else if (error.message?.includes("user_already_exists")) {
        setError("Użytkownik z tym adresem email już istnieje");
      } else {
        setError(isLogin ? "Błąd logowania" : "Błąd rejestracji");
      }
      toast.error(isLogin ? "Błąd logowania" : "Błąd rejestracji");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "Zaloguj się" : "Utwórz konto"}
          </CardTitle>
          <p className="text-muted-foreground">
            {isLogin
              ? "Wprowadź swoje dane, aby uzyskać dostęp do aplikacji"
              : "Wypełnij formularz, aby utworzyć nowe konto"}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa użytkownika</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Jan Kowalski"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required={!isLogin}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Adres email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nazwa@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isLogin ? "Wprowadź hasło" : "Co najmniej 8 znaków"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  minLength={isLogin ? undefined : 8}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="animate-in slide-in-from-top-1">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Logowanie..." : "Tworzenie konta..."}
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  {isLogin ? "Zaloguj się" : "Utwórz konto"}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Nie masz jeszcze konta?" : "Masz już konto?"}
            </p>
            <Button
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setFormData({ email: "", password: "", name: "" });
              }}
              className="mt-1 font-medium"
            >
              {isLogin ? "Zarejestruj się" : "Zaloguj się"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
