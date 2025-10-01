import { NextRequest, NextResponse } from 'next/server';

// Tymczasowe przechowywanie kolumn w pamięci
// W przyszłości można to przenieść do bazy danych
let customColumns: Array<{
  id: string;
  name: string;
  type: 'text' | 'checkbox' | 'number';
  values: Record<string, any>;
}> = [];

export async function GET() {
  try {
    return NextResponse.json(customColumns);
  } catch (error) {
    console.error('Error fetching custom columns:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const columnData = await request.json();
    
    const newColumn = {
      id: columnData.id,
      name: columnData.name,
      type: columnData.type,
      values: columnData.values || {},
    };
    
    customColumns.push(newColumn);
    
    return NextResponse.json(newColumn);
  } catch (error) {
    console.error('Error creating custom column:', error);
    return NextResponse.json(
      { error: 'Nie udało się dodać kolumny' },
      { status: 500 }
    );
  }
}