import { NextRequest, NextResponse } from 'next/server';

// Importuj customColumns z columns route
// W praktyce to powinno być w wspólnej bazie danych lub storage
export async function PUT(request: NextRequest) {
  try {
    const { columnId, userId, value } = await request.json();
    
    // Tymczasowe rozwiązanie - zwróć sukces
    // W prawdziwej aplikacji tutaj należałoby zaktualizować bazę danych
    
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