import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, ID, Query } from 'appwrite';

// Konfiguracja Appwrite
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('687abe96000d2d31f914');

const databases = new Databases(client);
const databaseId = 'votes';
const customColumnsCollectionId = 'user_custom_columns';

export interface CustomColumn {
  $id?: string;
  id: string;
  name: string;
  type: 'text' | 'checkbox' | 'number';
  values: Record<string, any>;
  $createdAt?: string;
  $updatedAt?: string;
}

export async function GET() {
  try {
    const response = await databases.listDocuments(
      databaseId,
      customColumnsCollectionId,
      [Query.orderAsc('$createdAt')]
    );

    const columns = response.documents.map(doc => ({
      id: doc.id || doc.$id,
      name: doc.name,
      type: doc.type,
      values: doc.values || {},
    }));

    return NextResponse.json(columns);
  } catch (error) {
    console.error('Error fetching custom columns:', error);
    
    // Zwróć pustą tablicę jeśli nie ma połączenia z Appwrite
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const columnData: Omit<CustomColumn, '$id' | '$createdAt' | '$updatedAt'> = await request.json();

    const response = await databases.createDocument(
      databaseId,
      customColumnsCollectionId,
      ID.unique(),
      columnData
    );

    return NextResponse.json({
      id: response.id || response.$id,
      name: response.name,
      type: response.type,
      values: response.values || {},
    });
  } catch (error) {
    console.error('Error creating custom column:', error);
    return NextResponse.json(
      { error: 'Nie udało się dodać kolumny' },
      { status: 500 }
    );
  }
}