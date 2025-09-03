"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vote, Users, FileText, BarChart3, ArrowRight, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  // Show loading or redirect while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is logged in, we'll redirect, but show loading state
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ZSSR</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Zaloguj się</Button>
              </Link>
              <Link href="/login">
                <Button>Rozpocznij</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Zintegrowany System
            <span className="text-blue-600"> Samorządowy</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Nowoczesne rozwiązanie dla samorządów lokalnych. Zarządzaj projektami, 
            organizuj głosowania, komunikuj się z mieszkańcami i kontroluj budżet 
            w jednym zintegrowanym systemie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 py-3">
                Rozpocznij pracę
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Dowiedz się więcej
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Funkcje systemu
            </h2>
            <p className="text-xl text-gray-600">
              Wszystko czego potrzebujesz do efektywnego zarządzania samorządem
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Vote className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Głosowania Online</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Organizuj bezpieczne głosowania elektroniczne z pełną kontrolą i transparencją
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Zarządzanie Zespołem</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Efektywne zarządzanie pracownikami, ich rolami i uprawnieniami w systemie
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Dokumenty i Uchwały</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Centralne zarządzanie dokumentami, uchwałami i całą dokumentacją urzędową
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle>Kontrola Budżetu</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Szczegółowe śledzenie wydatków, planowanie budżetu i raportowanie finansowe
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Dlaczego ZSSR?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Nasz system został zaprojektowany specjalnie z myślą o potrzebach 
                polskich samorządów. Oferujemy kompleksowe rozwiązanie, które zwiększa 
                efektywność pracy i poprawia komunikację z mieszkańcami.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-gray-700">Zgodność z polskim prawem</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-gray-700">Bezpieczeństwo danych na najwyższym poziomie</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-gray-700">Intuicyjny interfejs użytkownika</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="text-gray-700">Wsparcie techniczne w języku polskim</span>
                </div>
              </div>
            </div>
            <div className="lg:text-center">
              <div className="inline-block p-8 bg-blue-50 rounded-2xl">
                <Shield className="h-32 w-32 text-blue-600 mx-auto" />
                <p className="mt-4 text-blue-800 font-semibold">
                  Bezpieczny i niezawodny
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Gotowy na digitalizację swojego samorządu?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Dołącz do grona samorządów, które już korzystają z naszego systemu 
            i zobacz różnicę w efektywności pracy.
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Zaloguj się teraz
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
                <span className="ml-2 text-lg font-bold text-gray-900">ZSSR</span>
              </div>
              <p className="text-gray-600">
                Zintegrowany System Samorządowy Rzeczypospolitej - nowoczesne rozwiązanie 
                dla efektywnego zarządzania samorządem lokalnym.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">System</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Głosowania</li>
                <li>Dokumenty</li>
                <li>Budżet</li>
                <li>Zespół</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Wsparcie</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Dokumentacja</li>
                <li>Pomoc techniczna</li>
                <li>Kontakt</li>
                <li>FAQ</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 ZSSR. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
