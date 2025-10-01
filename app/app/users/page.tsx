'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem,                         </Table>
                    </div>
                </div>
            )}
        </div>
    );tTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Grid, List, Edit2, Check, X, UserPlus } from 'lucide-react';
import Link from 'next/link';


interface User {
    id: string;
    firstName: string;
    lastName: string;
    function?: string;
    group: string;
}

interface CustomColumn {
    id: string;
    name: string;
    type: 'text' | 'checkbox' | 'number';
    values: Record<string, any>;
}

type ViewMode = 'cards' | 'list';

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('cards');
    const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnName, setNewColumnName] = useState('');
    const [newColumnType, setNewColumnType] = useState<'text' | 'checkbox' | 'number'>('text');
    const [editingColumn, setEditingColumn] = useState<string | null>(null);
    const [editingColumnName, setEditingColumnName] = useState('');

    useEffect(() => {
        // Fetch users from database
        fetchUsers();
        fetchCustomColumns();
    }, []);

    const fetchUsers = async () => {
        try {
            // Replace with actual API call
            const response = await fetch('/api/users');
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchCustomColumns = async () => {
        try {
            // Replace with actual API call
            const response = await fetch('/api/users/columns');
            const data = await response.json();
            setCustomColumns(data);
        } catch (error) {
            console.error('Error fetching custom columns:', error);
        }
    };

    const saveCustomColumn = async (column: CustomColumn) => {
        try {
            await fetch('/api/users/columns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(column),
            });
        } catch (error) {
            console.error('Error saving custom column:', error);
        }
    };

    const updateColumnValue = async (columnId: string, userId: string, value: any) => {
        try {
            await fetch('/api/users/column-values', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ columnId, userId, value }),
            });
        } catch (error) {
            console.error('Error updating column value:', error);
        }
    };

    const handleAddColumn = () => {
        if (newColumnName.trim()) {
            const newColumn: CustomColumn = {
                id: Date.now().toString(),
                name: newColumnName,
                type: newColumnType,
                values: {},
            };
            setCustomColumns([...customColumns, newColumn]);
            saveCustomColumn(newColumn);
            setNewColumnName('');
            setIsAddingColumn(false);
        }
    };

    const handleEditColumnName = (columnId: string, newName: string) => {
        setCustomColumns(prev =>
            prev.map(col =>
                col.id === columnId ? { ...col, name: newName } : col
            )
        );
        // Save to database
        const column = customColumns.find(col => col.id === columnId);
        if (column) {
            saveCustomColumn({ ...column, name: newName });
        }
    };

    const handleCellValueChange = (columnId: string, userId: string, value: any) => {
        setCustomColumns(prev =>
            prev.map(col =>
                col.id === columnId
                    ? { ...col, values: { ...col.values, [userId]: value } }
                    : col
            )
        );
        updateColumnValue(columnId, userId, value);
    };

    const renderCellInput = (column: CustomColumn, userId: string) => {
        const value = column.values[userId] || '';

        switch (column.type) {
            case 'text':
                return (
                    <Input
                        value={value}
                        onChange={(e) => handleCellValueChange(column.id, userId, e.target.value)}
                        className="h-8"
                    />
                );
            case 'number':
                return (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleCellValueChange(column.id, userId, Number(e.target.value))}
                        className="h-8"
                    />
                );
            case 'checkbox':
                return (
                    <Checkbox
                        checked={value || false}
                        onCheckedChange={(checked) => handleCellValueChange(column.id, userId, checked)}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-3 sm:p-4 md:p-6">
            <div className="flex flex-col space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                    <h1 className="text-2xl sm:text-3xl font-bold">Uczniowie</h1>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Link href="/users/new" className="w-full sm:w-auto">
                            <Button className="w-full sm:w-auto">
                                <UserPlus className="h-4 w-4 mr-2" />
                                <span className="sm:hidden">Dodaj</span>
                                <span className="hidden sm:inline">Dodaj ucznia</span>
                            </Button>
                        </Link>
                        <div className="flex gap-2">
                            <Button
                                variant={viewMode === 'cards' ? 'default' : 'outline'}
                                onClick={() => setViewMode('cards')}
                                size="sm"
                                className="flex-1 sm:flex-none"
                            >
                                <Grid className="h-4 w-4 mr-2" />
                                <span className="sm:hidden">Karty</span>
                                <span className="hidden sm:inline">Karty</span>
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                onClick={() => setViewMode('list')}
                                size="sm"
                                className="flex-1 sm:flex-none"
                            >
                                <List className="h-4 w-4 mr-2" />
                                <span className="sm:hidden">Lista</span>
                                <span className="hidden sm:inline">Lista</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {users.map((user) => (
                        <Card key={user.id} className="transition-shadow hover:shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base sm:text-lg">
                                    {user.firstName} {user.lastName}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex flex-col gap-2">
                                    {user.function && (
                                        <Badge variant="secondary" className="text-xs">
                                            {user.function}
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                        {user.group}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="overflow-x-auto -mx-3 sm:mx-0">
                    <div className="min-w-full inline-block align-middle">
                        <Table className="min-w-full">
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nr</TableHead>
                                <TableHead>Imię i nazwisko</TableHead>
                                {customColumns.map((column) => (
                                    <TableHead key={column.id}>
                                        {editingColumn === column.id ? (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={editingColumnName}
                                                    onChange={(e) => setEditingColumnName(e.target.value)}
                                                    className="h-8"
                                                />
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        handleEditColumnName(column.id, editingColumnName);
                                                        setEditingColumn(null);
                                                    }}
                                                >
                                                    <Check className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditingColumn(null)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {column.name}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditingColumn(column.id);
                                                        setEditingColumnName(column.name);
                                                    }}
                                                >
                                                    <Edit2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableHead>
                                ))}
                                <TableHead>
                                    {isAddingColumn ? (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                placeholder="Nazwa kolumny"
                                                value={newColumnName}
                                                onChange={(e) => setNewColumnName(e.target.value)}
                                                className="h-8 w-32"
                                            />
                                            <Select value={newColumnType} onValueChange={(value: any) => setNewColumnType(value)}>
                                                <SelectTrigger className="h-8 w-24">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="text">Tekst</SelectItem>
                                                    <SelectItem value="checkbox">Checkbox</SelectItem>
                                                    <SelectItem value="number">Liczba</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Button size="sm" onClick={handleAddColumn}>
                                                <Check className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setIsAddingColumn(false)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setIsAddingColumn(true)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user, index) => (
                                <TableRow key={user.id}>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                                    {customColumns.map((column) => (
                                        <TableCell key={column.id}>
                                            {renderCellInput(column, user.id)}
                                        </TableCell>
                                    ))}
                                    <TableCell></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}