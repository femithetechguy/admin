// Print functionality
class NoteViewerPrinting extends NoteViewerSharing {
  // Print shared content popup
  printSharedContent(shareData) {
    this.debug('Printing shared content:', shareData.title);
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const printHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${shareData.title} - Study Notes</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          
          .header {
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .badges {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
          }
          
          .badge {
            background: #f3f4f6;
            color: #374151;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
          }
          
          .badge.serial {
            background: #dbeafe;
            color: #1e40af;
          }
          
          h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            color: #1f2937;
          }
          
          h2 {
            font-size: 24px;
            font-weight: 600;
            margin: 30px 0 15px 0;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
          }
          
          h3 {
            font-size: 20px;
            font-weight: 600;
            margin: 25px 0 12px 0;
            color: #4b5563;
          }
          
          h4 {
            font-size: 18px;
            font-weight: 600;
            margin: 20px 0 10px 0;
            color: #6b7280;
          }
          
          p {
            margin: 0 0 15px 0;
            color: #374151;
          }
          
          ul, ol {
            margin: 0 0 15px 0;
            padding-left: 25px;
          }
          
          li {
            margin-bottom: 8px;
            color: #374151;
          }
          
          strong {
            font-weight: 600;
            color: #1f2937;
          }
          
          code {
            background: #f3f4f6;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #1f2937;
          }
          
          pre {
            background: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
            border: 1px solid #e5e7eb;
          }
          
          pre code {
            background: none;
            padding: 0;
          }
          
          blockquote {
            border-left: 4px solid #e5e7eb;
            margin: 15px 0;
            padding-left: 20px;
            color: #6b7280;
            font-style: italic;
          }
          
          hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 30px 0;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
          
          .content {
            margin-top: 20px;
          }
          
          @media print {
            body {
              padding: 0;
              max-width: none;
            }
            
            .header {
              page-break-after: avoid;
            }
            
            h1, h2, h3, h4 {
              page-break-after: avoid;
            }
            
            p, ul, ol {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="badges">
            <span class="badge serial">#${shareData.serialNo}</span>
            <span class="badge">${shareData.category}</span>
            <span class="badge">📤 Shared Content</span>
          </div>
          <h1>${shareData.title}</h1>
        </div>
        
        <div class="content">
          ${shareData.content}
        </div>
        
        <div class="footer">
          <p>
            📅 Shared on ${new Date(shareData.timestamp).toLocaleDateString()} • 
            ⏰ Expires ${new Date(shareData.expiresAt).toLocaleDateString()}
          </p>
          <p>Generated from Study Notes App</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
  }

  // Print regular note content
  printNoteContent(containerId, title, content, serialNo, category) {
    this.debug('Printing note content:', title);
    
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const printHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Study Notes</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          
          .header {
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          
          .badges {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
          }
          
          .badge {
            background: #f3f4f6;
            color: #374151;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
          }
          
          .badge.serial {
            background: #dbeafe;
            color: #1e40af;
          }
          
          h1 {
            font-size: 28px;
            font-weight: 700;
            margin: 0;
            color: #1f2937;
          }
          
          h2 {
            font-size: 24px;
            font-weight: 600;
            margin: 30px 0 15px 0;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
          }
          
          h3 {
            font-size: 20px;
            font-weight: 600;
            margin: 25px 0 12px 0;
            color: #4b5563;
          }
          
          h4 {
            font-size: 18px;
            font-weight: 600;
            margin: 20px 0 10px 0;
            color: #6b7280;
          }
          
          p {
            margin: 0 0 15px 0;
            color: #374151;
          }
          
          ul, ol {
            margin: 0 0 15px 0;
            padding-left: 25px;
          }
          
          li {
            margin-bottom: 8px;
            color: #374151;
          }
          
          strong {
            font-weight: 600;
            color: #1f2937;
          }
          
          code {
            background: #f3f4f6;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            color: #1f2937;
          }
          
          pre {
            background: #f9fafb;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            margin: 15px 0;
            border: 1px solid #e5e7eb;
          }
          
          pre code {
            background: none;
            padding: 0;
          }
          
          blockquote {
            border-left: 4px solid #e5e7eb;
            margin: 15px 0;
            padding-left: 20px;
            color: #6b7280;
            font-style: italic;
          }
          
          hr {
            border: none;
            border-top: 1px solid #e5e7eb;
            margin: 30px 0;
          }
          
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }
          
          .content {
            margin-top: 20px;
          }
          
          @media print {
            body {
              padding: 0;
              max-width: none;
            }
            
            .header {
              page-break-after: avoid;
            }
            
            h1, h2, h3, h4 {
              page-break-after: avoid;
            }
            
            p, ul, ol {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="badges">
            <span class="badge serial">#${serialNo}</span>
            <span class="badge">${category}</span>
            <span class="badge">📚 Study Notes</span>
          </div>
          <h1>${title}</h1>
        </div>
        
        <div class="content">
          ${content}
        </div>
        
        <div class="footer">
          <p>📅 Generated on ${new Date().toLocaleDateString()}</p>
          <p>Study Notes App</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    printWindow.onload = function() {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
  }
}

window.NoteViewerPrinting = NoteViewerPrinting;