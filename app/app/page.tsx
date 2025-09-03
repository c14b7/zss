"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vote, Users, FileText, BarChart3, ArrowRight, Shield, CheckCircle, Settings, Monitor } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-indigo-600" />
              <span className="ml-3 text-xl font-bold text-gray-900">ZSSR</span>
              <Badge variant="secondary" className="ml-3 text-xs">Beta</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Zaloguj się
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Rozpocznij
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Zintegrowany System
                <br />
                <span className="text-indigo-600">Samorządowy</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Nowoczesne rozwiązanie dla samorządów lokalnych. Zarządzaj projektami, 
                organizuj głosowania i komunikuj się z mieszkańcami w jednym miejscu.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Rozpocznij pracę
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Dowiedz się więcej
                </Button>
              </div>
            </div>
            
            <div className="lg:text-center">
              <div className="relative">
                {/* Security illustration placeholder */}
                <div className="w-full max-w-lg mx-auto aspect-square bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <Shield className="h-32 w-32 text-indigo-600 mx-auto mb-4" />
                    <div className="text-lg font-medium text-gray-900">Bezpieczny system</div>
                    <div className="text-sm text-gray-600">Najwyższy poziom zabezpieczeń</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Wszystko czego potrzebujesz
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Kompleksowe rozwiązanie zaprojektowane z myślą o efektywności 
              i nowoczesności samorządów lokalnych
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <Vote className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Głosowania Online</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Bezpieczne głosowania elektroniczne z systemem weryfikacji 
                  i pełną transparencją procesów
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Zarządzanie Zespołem</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Zarządzanie pracownikami z systemem ról, 
                  uprawnień i monitorowaniem zespołu
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Dokumenty</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Zarządzanie dokumentacją z organizacją, 
                  kategoryzacją i wyszukiwaniem
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">Analityka</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 leading-relaxed">
                  Analityka budżetowa z raportami 
                  i przeglądem wydatków
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                Dlaczego <span className="text-indigo-600">ZSSR</span>?
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Nasz system został zaprojektowany specjalnie z myślą o potrzebach 
                polskich samorządów. Oferujemy rozwiązanie, które usprawnia 
                efektywność pracy i jakość komunikacji.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Zgodność z polskim prawem</h3>
                    <p className="text-gray-600">Pełna zgodność z regulacjami prawnymi i standardami bezpieczeństwa</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Bezpieczeństwo</h3>
                    <p className="text-gray-600">Najwyższy poziom bezpieczeństwa z szyfrowaniem danych</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <Monitor className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Intuicyjny interfejs</h3>
                    <p className="text-gray-600">Nowoczesny interfejs zaprojektowany z myślą o użytkownikach</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                    <Settings className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Wsparcie techniczne</h3>
                    <p className="text-gray-600">Dedykowane wsparcie techniczne w języku polskim</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:text-center">
              <div className="relative">
                {/* System upgrade illustration placeholder */}
                <div className="w-full max-w-lg mx-auto aspect-square bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <Settings className="h-32 w-32 text-green-600 mx-auto mb-4" />
                    <div className="text-lg font-medium text-gray-900">Nowoczesny system</div>
                    <div className="text-sm text-gray-600">Zawsze aktualny i ulepszany</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional features with illustrations */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="lg:order-2">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Dostępny wszędzie
              </h3>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                System działa na wszystkich urządzeniach - komputerach, tabletach i telefonach. 
                Tryb ciemny dla wygodnej pracy w każdych warunkach.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Responsywny design</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Tryb ciemny</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <span className="text-gray-700">Praca offline</span>
                </div>
              </div>
            </div>
            
            <div className="lg:order-1">
              <div className="relative">
                {/* Dark mode illustration placeholder */}
                <div className="w-full max-w-lg mx-auto aspect-square bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl flex items-center justify-center">
                  <div className="text-center">
                    <Monitor className="h-32 w-32 text-white mx-auto mb-4" />
                    <div className="text-lg font-medium text-white">Tryb ciemny</div>
                    <div className="text-sm text-gray-300">Wygodny dla oczu</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Gotowy do rozpoczęcia?
          </h2>
          
          <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
            Dołącz do samorządów, które już korzystają z naszego systemu 
            i doświadczają jego korzyści.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/login">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-gray-50">
                Zaloguj się
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
              Dowiedz się więcej
            </Button>
          </div>
          
          {/* Simple trust indicators */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center text-indigo-100 text-sm">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Bezpieczne</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Zgodne z prawem</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Wsparcie w języku polskim</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-indigo-600" />
                <span className="ml-2 text-lg font-bold text-gray-900">ZSSR</span>
                <Badge variant="secondary" className="ml-2 text-xs">Beta</Badge>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Zintegrowany System Samorządowy Rzeczypospolitej - rozwiązanie 
                dla nowoczesnego zarządzania samorządem lokalnym.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Funkcje</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Głosowania online</li>
                <li>Zarządzanie zespołem</li>
                <li>Dokumenty</li>
                <li>Analityka budżetowa</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Wsparcie</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Dokumentacja</li>
                <li>Centrum pomocy</li>
                <li>Kontakt</li>
                <li>Status systemu</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm">
                &copy; 2024 ZSSR. Wszystkie prawa zastrzeżone.
              </p>
              <p className="text-gray-500 text-sm mt-2 md:mt-0">
                Made with ❤️ in Poland
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
