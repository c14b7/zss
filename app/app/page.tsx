"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vote, Users, FileText, BarChart3, ArrowRight, Shield, CheckCircle, Sparkles, Star, Zap, Globe, Award } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-violet-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-white/20 bg-white/10 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <div className="relative">
                <Shield className="h-10 w-10 text-indigo-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                  <Sparkles className="h-2 w-2 text-white" />
                </div>
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ZSSR</span>
              <Badge className="ml-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0">Premium</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-700 hover:text-indigo-600 hover:bg-white/50 backdrop-blur-sm transition-all duration-300">
                  Zaloguj się
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  Rozpocznij
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 backdrop-blur-sm mb-8">
            <Star className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Najnowocześniejszy system samorządowy</span>
            <Star className="h-4 w-4 text-purple-600" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-tight">
            Zintegrowany System
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Samorządowy
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Rewolucyjne rozwiązanie dla samorządów lokalnych. Zarządzaj projektami, 
            organizuj głosowania, komunikuj się z mieszkańcami i kontroluj budżet 
            w jednym <span className="font-semibold text-indigo-600">zintegrowanym ekosystemie</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link href="/login">
              <Button size="lg" className="text-lg px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl">
                <Zap className="mr-3 h-5 w-5" />
                Rozpocznij pracę
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-10 py-4 border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 rounded-xl backdrop-blur-sm">
              <Globe className="mr-3 h-5 w-5" />
              Dowiedz się więcej
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
              <div className="text-3xl font-bold text-indigo-600 mb-2">500+</div>
              <div className="text-gray-600">Aktywnych samorządów</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">99.9%</div>
              <div className="text-gray-600">Niezawodność systemu</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg">
              <div className="text-3xl font-bold text-pink-600 mb-2">24/7</div>
              <div className="text-gray-600">Wsparcie techniczne</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 backdrop-blur-sm mb-6">
              <Award className="h-4 w-4 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">Funkcje premium</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Wszystko czego potrzebujesz
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kompleksowe rozwiązanie zaprojektowane z myślą o efektywności 
              i nowoczesności samorządów lokalnych
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg group">
              <CardHeader className="pb-4">
                <div className="relative mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Vote className="h-10 w-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Głosowania Online</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  Bezpieczne głosowania elektroniczne z zaawansowanym systemem weryfikacji 
                  i pełną transparencją procesów demokratycznych
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg group">
              <CardHeader className="pb-4">
                <div className="relative mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-10 w-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Zarządzanie Zespołem</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  Inteligentne zarządzanie pracownikami z dynamicznym systemem ról, 
                  uprawnień i monitorowaniem wydajności zespołu
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg group">
              <CardHeader className="pb-4">
                <div className="relative mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-10 w-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Dokumenty AI</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  Zaawansowane zarządzanie dokumentacją z AI-powered organizacją, 
                  automatyczną kategoryzacją i inteligentnym wyszukiwaniem
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-0 shadow-lg group">
              <CardHeader className="pb-4">
                <div className="relative mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="h-10 w-10 text-white" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Smart Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  Zaawansowana analityka budżetowa z predykcyjnym modelowaniem, 
                  automatycznymi raportami i AI-powered insights
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 backdrop-blur-sm mb-8">
                <Shield className="h-4 w-4 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Zaufanie i jakość</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Dlaczego
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> ZSSR</span>?
              </h2>
              
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Nasz system został zaprojektowany specjalnie z myślą o potrzebach 
                polskich samorządów. Oferujemy kompleksowe rozwiązanie, które rewolucjonizuje 
                efektywność pracy i jakość komunikacji z mieszkańcami.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Zgodność z polskim prawem</h3>
                    <p className="text-gray-600">Pełna zgodność z regulacjami prawnymi i standardami bezpieczeństwa</p>
                  </div>
                </div>
                
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Enterprise Security</h3>
                    <p className="text-gray-600">Najwyższy poziom bezpieczeństwa z szyfrowaniem end-to-end</p>
                  </div>
                </div>
                
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Intuicyjny UX/UI Design</h3>
                    <p className="text-gray-600">Nowoczesny interfejs zaprojektowany z myślą o użytkownikach</p>
                  </div>
                </div>
                
                <div className="flex items-start group">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Premium Support 24/7</h3>
                    <p className="text-gray-600">Dedykowane wsparcie techniczne w języku polskim</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:text-center">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl transform rotate-6"></div>
                <div className="relative p-12 bg-white/80 backdrop-blur-sm rounded-3xl border border-white/20 shadow-2xl">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-xl opacity-30"></div>
                    <Shield className="relative h-32 w-32 text-indigo-600 mx-auto" />
                  </div>
                  <p className="mt-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Bezpieczny, niezawodny i nowoczesny
                  </p>
                  <div className="flex justify-center mt-4 space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-medium">Rozpocznij transformację cyfrową już dziś</span>
            <Zap className="h-5 w-5 text-yellow-400" />
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Gotowy na rewolucję
            <br />
            <span className="text-yellow-400">cyfrową</span>?
          </h2>
          
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Dołącz do grona najbardziej innowacyjnych samorządów w Polsce, 
            które już korzystają z naszego systemu i obserwują 
            <span className="font-semibold text-yellow-400"> spektakularne rezultaty</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <Link href="/login">
              <Button size="lg" className="text-lg px-12 py-4 bg-white text-indigo-600 hover:bg-gray-50 hover:text-indigo-700 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 rounded-xl font-semibold">
                <Zap className="mr-3 h-5 w-5" />
                Zaloguj się teraz
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-12 py-4 border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 rounded-xl backdrop-blur-sm">
              <Globe className="mr-3 h-5 w-5" />
              Poznaj możliwości
            </Button>
          </div>
          
          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-white/80">
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <span>Bez zobowiązań</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <span>Darmowy trial 30 dni</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              <span>Wsparcie 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <div className="flex items-center mb-6">
                <div className="relative">
                  <Shield className="h-8 w-8 text-indigo-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-1.5 w-1.5 text-white" />
                  </div>
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">ZSSR</span>
                <Badge className="ml-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 text-xs">Premium</Badge>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed max-w-md">
                Zintegrowany System Samorządowy Rzeczypospolitej - najbardziej zaawansowane 
                rozwiązanie dla nowoczesnego zarządzania samorządem lokalnym w Polsce.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PL</span>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Funkcje Premium</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Głosowania AI</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Smart Analytics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Budżet 2.0</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Team Management</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Wsparcie & Kontakt</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-indigo-500" />
                  <span>Dokumentacja</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-500" />
                  <span>Live Chat 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-indigo-500" />
                  <span>Premium Support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-indigo-500" />
                  <span>Community</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 mb-4 md:mb-0">
                &copy; 2024 ZSSR Premium. Wszystkie prawa zastrzeżone.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Made with</span>
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-red-500 fill-current" />
                  ))}
                </div>
                <span>in Poland</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
