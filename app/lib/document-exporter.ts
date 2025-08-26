'use client'

import { SerializedEditorState } from 'lexical'

export interface ExportOptions {
  format: 'txt' | 'html' | 'md' | 'json'
  title?: string
  filename?: string
}

export class DocumentExporter {
  async exportDocument(content: SerializedEditorState, options: ExportOptions): Promise<string> {
    console.log('📤 Rozpoczynam eksport dokumentu w formacie:', options.format)

    switch (options.format) {
      case 'txt':
        return this.exportAsText(content)
      case 'html':
        return this.exportAsHTML(content, options.title)
      case 'md':
        return this.exportAsMarkdown(content, options.title)
      case 'json':
        return this.exportAsJSON(content, options.title)
      default:
        throw new Error(`Nieobsługiwany format eksportu: ${options.format}`)
    }
  }

  private extractTextFromNodes(nodes: any[]): string {
    let text = ''
    
    for (const node of nodes) {
      if (node.type === 'text') {
        text += node.text || ''
      } else if (node.children && Array.isArray(node.children)) {
        text += this.extractTextFromNodes(node.children)
      }
      
      // Add spacing for paragraph breaks
      if (node.type === 'paragraph') {
        text += '\n\n'
      }
    }
    
    return text
  }

  private async exportAsText(content: SerializedEditorState): Promise<string> {
    try {
      const text = this.extractTextFromNodes(content.root.children || [])
      return text.trim()
    } catch (error) {
      console.error('Błąd podczas eksportu do TXT:', error)
      return ''
    }
  }

  private async exportAsHTML(content: SerializedEditorState, title?: string): Promise<string> {
    try {
      const text = this.extractTextFromNodes(content.root.children || [])
      
      const fullHTML = `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Dokument'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        h1 {
            border-bottom: 2px solid #3498db;
            padding-bottom: 0.5rem;
        }
        p {
            margin-bottom: 1rem;
        }
        .export-info {
            border-top: 1px solid #dee2e6;
            padding-top: 2rem;
            margin-top: 3rem;
            color: #6c757d;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    ${title ? `<h1>${title}</h1>` : ''}
    <div>${text.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('')}</div>
    <div class="export-info">
        <p>Dokument wyeksportowany z systemu zarządzania dokumentami • ${new Date().toLocaleString('pl-PL')}</p>
    </div>
</body>
</html>`
      
      return fullHTML
    } catch (error) {
      console.error('Błąd podczas eksportu do HTML:', error)
      return `<html><body><h1>${title || 'Błąd eksportu'}</h1><p>Nie udało się wyeksportować dokumentu.</p></body></html>`
    }
  }

  private async exportAsMarkdown(content: SerializedEditorState, title?: string): Promise<string> {
    try {
      let markdown = ''
      
      if (title) {
        markdown += `# ${title}\n\n`
      }
      
      const text = this.extractTextFromNodes(content.root.children || [])
      markdown += text
      
      // Add export info
      markdown += `\n\n---\n\n*Dokument wyeksportowany z systemu zarządzania dokumentami • ${new Date().toLocaleString('pl-PL')}*`
      
      return markdown
    } catch (error) {
      console.error('Błąd podczas eksportu do Markdown:', error)
      const fallback = title ? `# ${title}\n\n*Nie udało się wyeksportować dokumentu.*` : '*Nie udało się wyeksportować dokumentu.*'
      return fallback
    }
  }

  private async exportAsJSON(content: SerializedEditorState, title?: string): Promise<string> {
    const exportData = {
      title: title || 'Dokument',
      content: content,
      exportedAt: new Date().toISOString(),
      format: 'lexical-editor-state',
      version: '1.0'
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  async downloadDocument(
    content: SerializedEditorState, 
    options: ExportOptions
  ): Promise<void> {
    try {
      console.log('📁 Rozpoczynam pobieranie dokumentu:', options)
      
      const exportedContent = await this.exportDocument(content, options)
      
      // Determine MIME type and file extension
      let mimeType: string
      let extension: string
      
      switch (options.format) {
        case 'txt':
          mimeType = 'text/plain'
          extension = 'txt'
          break
        case 'html':
          mimeType = 'text/html'
          extension = 'html'
          break
        case 'md':
          mimeType = 'text/markdown'
          extension = 'md'
          break
        case 'json':
          mimeType = 'application/json'
          extension = 'json'
          break
        default:
          throw new Error(`Nieobsługiwany format: ${options.format}`)
      }
      
      // Create filename
      const timestamp = new Date().toISOString().slice(0, 10)
      const filename = options.filename 
        ? `${options.filename}.${extension}`
        : `dokument-${timestamp}.${extension}`
      
      // Create and download blob
      const blob = new Blob([exportedContent], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Cleanup
      window.URL.revokeObjectURL(url)
      
      console.log('✅ Dokument został pomyślnie pobrany:', filename)
    } catch (error) {
      console.error('❌ Błąd podczas pobierania dokumentu:', error)
      throw error
    }
  }
}

// Export singleton instance
export const documentExporter = new DocumentExporter()
