import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'appwrite';

// Konfiguracja Appwrite
const client = new Client()
  .setEndpoint('https://fra.cloud.appwrite.io/v1')
  .setProject('687abe96000d2d31f914');

const databases = new Databases(client);
const databaseId = 'votes';
const customColumnsCollectionId = 'user_custom_columns';

export async function PUT(request: NextRequest) {
  try {
    const { columnId, userId, value } = await request.json();

    // Pobierz aktualną kolumnę
    const column = await databases.getDocument(
      databaseId,
      customColumnsCollectionId,
      columnId
    );

    // Zaktualizuj wartości kolumny
    const updatedValues = {
      ...column.values,
      [userId]: value
    };

    const response = await databases.updateDocument(
      databaseId,
      customColumnsCollectionId,
      columnId,
      { values: updatedValues }
    );

    return NextResponse.json({
      success: true,
      columnId,
      userId,
      value
    });
  } catch (error) {
    console.error('Error updating column value:', error);
    return NextResponse.json(
      { error: 'Nie udało się zaktualizować wartości' },
      { status: 500 }
    );
  }
}