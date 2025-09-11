"use client";

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface VoteSummaryData {
  title: string;
  subtitle: string;
  voteData: {
    title: string;
    description: string;
    category: string;
    deadline: string;
    totalVotes: number;
    results: Record<string, number>;
    options: Array<{
      value: number;
      label: string;
      description: string;
    }>;
    isFinished: boolean;
    endDate?: string;
    generatedAt: string;
  };
}

/**
 * Generates a PNG image from a React component element
 */
export async function exportToPNG(element: HTMLElement, filename: string = 'vote-results'): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      height: element.scrollHeight,
      width: element.scrollWidth,
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to PNG:', error);
    throw error;
  }
}

/**
 * Generates a JPG image from a React component element
 */
export async function exportToJPG(element: HTMLElement, filename: string = 'vote-results'): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      height: element.scrollHeight,
      width: element.scrollWidth,
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = `${filename}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9); // 90% quality
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to JPG:', error);
    throw error;
  }
}

/**
 * Generates a PDF from a React component element
 */
export async function exportToPDF(element: HTMLElement, filename: string = 'vote-results'): Promise<void> {
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: true,
      height: element.scrollHeight,
      width: element.scrollWidth,
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    
    // Calculate dimensions to fit the page
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    // Add the image to PDF
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    // Add additional pages if content is too long
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save the PDF
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

/**
 * Get formatted date string for the voting status
 */
export function getVotingStatusText(deadline: string, isFinished: boolean): {
  text: string;
  color: string;
  bgColor: string;
} {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  
  if (isFinished || deadlineDate < now) {
    return {
      text: `Głosowanie zakończone ${deadlineDate.toLocaleDateString('pl-PL')}`,
      color: 'text-green-800',
      bgColor: 'bg-green-100'
    };
  }
  
  return {
    text: 'Głosowanie trwa',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100'
  };
}

/**
 * Get the current generation timestamp
 */
export function getGenerationTimestamp(): string {
  return new Date().toLocaleString('pl-PL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}