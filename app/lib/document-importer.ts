"use client"

import { SerializedEditorState } from "lexical"

export interface ImportResult {
  title?: string
  content: SerializedEditorState
  originalFormat: string
}

export class DocumentImporter {
  async importFromFile(file: File): Promise<ImportResult> {
    console.log("📥 Rozpoczynam import pliku:", file.name, "Type:", file.type)

    const extension = file.name.split('.').pop()?.toLowerCase()
    const fileContent = await this.readFileContent(file)

    switch (extension) {
      case 'txt':
        return this.importFromText(fileContent, file.name)
      case 'html':
      case 'htm':
        return this.importFromHTML(fileContent, file.name)
      case 'md':
      case 'markdown':
        return this.importFromMarkdown(fileContent, file.name)
      case 'json':
        return this.importFromJSON(fileContent, file.name)
      default:
        throw new Error(`Nieobsługiwany format pliku: ${extension}`)
    }
  }

  private async readFileContent(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const content = event.target?.result as string
        resolve(content)
      }
      
      reader.onerror = () => {
        reject(new Error('Błąd podczas czytania pliku'))
      }
      
      reader.readAsText(file, 'utf-8')
    })
  }

  private importFromText(content: string, filename: string): ImportResult {
    console.log("📝 Import z pliku tekstowego")
    
    // Extract title from filename
    const title = filename.replace(/\.(txt|text)$/i, '')
    
    // Split content into paragraphs
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim())
    
    // Create lexical editor state
    const editorState: SerializedEditorState = {
      root: {
        children: paragraphs.map(paragraph => ({
          children: [{
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: paragraph.replace(/\n/g, ' ').trim(),
            type: "text",
            version: 1,
          } as any],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        } as any)),
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      } as any,
    } as SerializedEditorState

    return {
      title,
      content: editorState,
      originalFormat: 'text'
    }
  }

  private importFromHTML(content: string, filename: string): ImportResult {
    console.log("🌐 Import z pliku HTML")
    
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    
    // Extract title
    let title = doc.querySelector('title')?.textContent || filename.replace(/\.(html?|htm)$/i, '')
    
    // If no title in document, try to get first h1
    if (!title || title === 'Document') {
      const h1 = doc.querySelector('h1')
      if (h1) {
        title = h1.textContent || filename.replace(/\.(html?|htm)$/i, '')
      }
    }
    
    // Extract content from body
    const body = doc.querySelector('body') || doc
    const textContent = this.extractTextFromHTML(body)
    
    // Convert to paragraphs
    const paragraphs = textContent.split(/\n\s*\n/).filter(p => p.trim())
    
    const editorState: SerializedEditorState = {
      root: {
        children: paragraphs.map(paragraph => ({
          children: [{
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: paragraph.trim(),
            type: "text",
            version: 1,
          } as any],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        } as any)),
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      } as any,
    } as SerializedEditorState

    return {
      title,
      content: editorState,
      originalFormat: 'html'
    }
  }

  private extractTextFromHTML(element: Element | Document): string {
    let text = ''
    
    // Skip script and style elements
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const elem = node as Element
            if (elem.tagName === 'SCRIPT' || elem.tagName === 'STYLE') {
              return NodeFilter.FILTER_REJECT
            }
            // Add line breaks for block elements
            if (['P', 'DIV', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(elem.tagName)) {
              return NodeFilter.FILTER_ACCEPT
            }
          }
          return NodeFilter.FILTER_ACCEPT
        }
      }
    )

    let node
    while (node = walker.nextNode()) {
      if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent?.trim()
        if (textContent) {
          text += textContent + ' '
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const elem = node as Element
        if (['P', 'DIV', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(elem.tagName)) {
          text += '\n\n'
        }
      }
    }

    return text.replace(/\s+/g, ' ').trim()
  }

  private importFromMarkdown(content: string, filename: string): ImportResult {
    console.log("📋 Import z pliku Markdown")
    
    // Extract title from first # heading or filename
    let title = filename.replace(/\.(md|markdown)$/i, '')
    
    const lines = content.split('\n')
    const firstHeading = lines.find(line => line.startsWith('# '))
    if (firstHeading) {
      title = firstHeading.replace(/^#\s+/, '').trim()
    }
    
    // Convert markdown to plain text (simplified)
    const plainText = content
      .replace(/^#{1,6}\s+/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/>\s+/gm, '') // Remove blockquotes
      .replace(/^\s*[-*+]\s+/gm, '') // Remove bullet points
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered lists
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
      .trim()
    
    // Split into paragraphs
    const paragraphs = plainText.split(/\n\s*\n/).filter(p => p.trim())
    
    const editorState: SerializedEditorState = {
      root: {
        children: paragraphs.map(paragraph => ({
          children: [{
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: paragraph.replace(/\n/g, ' ').trim(),
            type: "text",
            version: 1,
          } as any],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        } as any)),
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      } as any,
    } as SerializedEditorState

    return {
      title,
      content: editorState,
      originalFormat: 'markdown'
    }
  }

  private importFromJSON(content: string, filename: string): ImportResult {
    console.log("🔧 Import z pliku JSON")
    
    try {
      const jsonData = JSON.parse(content)
      
      // Check if it's a previously exported document
      if (jsonData.content && jsonData.format === 'lexical-editor-state') {
        return {
          title: jsonData.title || filename.replace(/\.json$/i, ''),
          content: jsonData.content,
          originalFormat: 'lexical-json'
        }
      }
      
      // Generic JSON import - convert to text
      const jsonString = JSON.stringify(jsonData, null, 2)
      
    const editorState: SerializedEditorState = {
      root: {
        children: [{
          children: [{
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
            text: jsonString,
            type: "text",
            version: 1,
          } as any],
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        } as any],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      } as any,
    } as SerializedEditorState

    return {
        title: filename.replace(/\.json$/i, ''),
        content: editorState,
        originalFormat: 'json'
      }
    } catch (error) {
      console.error('Błąd parsowania JSON:', error)
      throw new Error('Nieprawidłowy format JSON')
    }
  }

  // Method to validate file before import
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'text/plain',
      'text/html',
      'text/markdown',
      'application/json',
      '.txt',
      '.html',
      '.htm',
      '.md',
      '.markdown',
      '.json'
    ]

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Plik jest za duży. Maksymalny rozmiar to 10MB.'
      }
    }

    const extension = file.name.split('.').pop()?.toLowerCase()
    const isValidType = allowedTypes.some(type => 
      file.type === type || extension === type.replace('.', '')
    )

    if (!isValidType) {
      return {
        valid: false,
        error: 'Nieobsługiwany typ pliku. Obsługiwane formaty: TXT, HTML, Markdown, JSON.'
      }
    }

    return { valid: true }
  }
}

// Export singleton instance
export const documentImporter = new DocumentImporter()
