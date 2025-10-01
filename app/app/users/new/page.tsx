'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface NewUser {
    firstName: string;
    lastName: string;
    function?: string;
    group: string;
    email?: string;
    phone?: string;
    notes?: string;
}

const availableGroups = [
    'Grupa 1',
    'Grupa 2'
];

const availableFunctions = [
    'Przewodniczący',
    'Zastępca',
    'Skarbnik',
    'Sekretarz',
    'Uczeń'
];

export default function NewUserPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState<NewUser>({
        firstName: '',
        lastName: '',
        function: '',
        group: '',
        email: '',
        phone: '',
        notes: ''
    });

    const [errors, setErrors] = useState<Partial<NewUser>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<NewUser> = {};

        if (!user.firstName.trim()) {
            newErrors.firstName = 'Imię jest wymagane';
        }

        if (!user.lastName.trim()) {
            newErrors.lastName = 'Nazwisko jest wymagane';
        }

        if (!user.group) {
            newErrors.group = 'Grupa jest wymagana';
        }

        if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            newErrors.email = 'Nieprawidłowy format email';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field: keyof NewUser, value: string) => {
        setUser(prev => ({ ...prev, [field]: value }));
        // Usuń błąd dla tego pola po zmianie
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });

            if (!response.ok) {
                throw new Error('Błąd podczas tworzenia użytkownika');
            }

            toast.success('Nowy uczeń został dodany pomyślnie');
            router.push('/users');
        } catch (error) {
            console.error('Error creating user:', error);
            toast.error('Nie udało się dodać nowego ucznia');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/users');
    };

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Powrót
                </Button>
                <h1 className="text-3xl font-bold">Dodaj nowego ucznia</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        Dane osobowe
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Imię *</Label>
                                <Input
                                    id="firstName"
                                    value={user.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    placeholder="Wprowadź imię"
                                    className={errors.firstName ? 'border-red-500' : ''}
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-red-500">{errors.firstName}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName">Nazwisko *</Label>
                                <Input
                                    id="lastName"
                                    value={user.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    placeholder="Wprowadź nazwisko"
                                    className={errors.lastName ? 'border-red-500' : ''}
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-red-500">{errors.lastName}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="group">Grupa *</Label>
                                <Select
                                    value={user.group}
                                    onValueChange={(value) => handleInputChange('group', value)}
                                >
                                    <SelectTrigger className={errors.group ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Wybierz grupę" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableGroups.map((group) => (
                                            <SelectItem key={group} value={group}>
                                                {group}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.group && (
                                    <p className="text-sm text-red-500">{errors.group}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="function">Funkcja</Label>
                                <Select
                                    value={user.function || ''}
                                    onValueChange={(value) => handleInputChange('function', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Wybierz funkcję (opcjonalne)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableFunctions.map((func) => (
                                            <SelectItem key={func} value={func}>
                                                {func}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={user.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="email@example.com"
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input
                                    id="phone"
                                    value={user.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="+48 123 456 789"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notatki</Label>
                            <Textarea
                                id="notes"
                                value={user.notes || ''}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="                            Dodatkowe informacje o uczniu..."
                                rows={3}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? (
                                    "Dodawanie..."
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Dodaj ucznia
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isLoading}
                            >
                                Anuluj
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}