import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID, Query } from 'appwrite';

// Konfiguracja Appwrite
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('687abe96000d2d31f914');

const databases = new Databases(client);
const databaseId = 'votes';
const usersCollectionId = 'users';

export interface User {
  $id?: string;
  firstName: string;
  lastName: string;
  function?: string;
  group: string;
  email?: string;
  phone?: string;
  notes?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

export async function GET() {
  try {
    const response = await databases.listDocuments(
      databaseId,
      usersCollectionId,
      [Query.orderAsc('firstName')]
    );

    // Transformuj dokumenty do wymaganego formatu
    const users = response.documents.map(doc => ({
      id: doc.$id,
      firstName: doc.firstName,
      lastName: doc.lastName,
      function: doc.function,
      group: doc.group,
      email: doc.email,
      phone: doc.phone,
      notes: doc.notes,
    }));

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Zwróć przykładowe dane jeśli nie ma połączenia z Appwrite
    const fallbackUsers = [
      {
        id: '1',
        firstName: 'Adam',
        lastName: 'Kowalski',
        function: 'Przewodniczący',
        group: 'Grupa 1',
        email: 'adam.kowalski@szkola.edu.pl',
        phone: '+48 123 456 789'
      },
      {
        id: '2',
        firstName: 'Anna',
        lastName: 'Nowak',
        function: 'Zastępca',
        group: 'Grupa 1',
        email: 'anna.nowak@szkola.edu.pl',
        phone: '+48 987 654 321'
      },
      {
        id: '3',
        firstName: 'Michał',
        lastName: 'Wiśniewski',
        function: 'Uczeń',
        group: 'Grupa 2',
        email: 'michal.wisniewski@szkola.edu.pl',
        phone: '+48 555 111 222'
      },
      {
        id: '4',
        firstName: 'Katarzyna',
        lastName: 'Zielińska',
        function: 'Uczeń',
        group: 'Grupa 2',
        email: 'katarzyna.zielinska@szkola.edu.pl',
        phone: '+48 666 333 444'
      }
    ];
    
    return NextResponse.json(fallbackUsers);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData: Omit<User, '$id' | '$createdAt' | '$updatedAt'> = await request.json();

    const response = await databases.createDocument(
      databaseId,
      usersCollectionId,
      ID.unique(),
      userData
    );

    return NextResponse.json({
      id: response.$id,
      firstName: response.firstName,
      lastName: response.lastName,
      function: response.function,
      group: response.group,
      email: response.email,
      phone: response.phone,
      notes: response.notes,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Nie udało się dodać użytkownika' },
      { status: 500 }
    );
  }
}