// Markdown conversion functionality
class NoteViewerMarkdown extends NoteViewerPrinting {
  // Simple markdown to HTML converter
  markdownToHTML(markdown) {
    this.debug('Converting markdown to HTML, input length:', markdown.length);
    
    let html = markdown;

    // Convert headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Convert bold and italic
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace/\*(.*?)\*/g, '<em>$1</em>');

    // Convert inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

    // Convert links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Convert line breaks to paragraphs
    const paragraphs = html.split('\n\n').filter(p => p.trim());
    html = paragraphs.map(p => {
      p = p.trim();
      
      // Skip if it's already a header, list, or code block
      if (p.startsWith('<h') || p.startsWith('<pre') || p.startsWith('<ul') || p.startsWith('<ol')) {
        return p;
      }
      
      // Handle lists
      if (p.includes('\n- ') || p.includes('\n* ')) {
        const lines = p.split('\n');
        let listItems = [];
        let currentP = '';
        
        for (let line of lines) {
          if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            if (currentP) {
              listItems.push(`<p>${currentP.trim()}</p>`);
              currentP = '';
            }
            listItems.push(`<li>${line.trim().substring(2)}</li>`);
          } else {
            currentP += line + ' ';
          }
        }
        
        if (currentP) {
          listItems.push(`<p>${currentP.trim()}</p>`);
        }
        
        // Group consecutive <li> elements in <ul>
        let result = '';
        let inList = false;
        
        for (let item of listItems) {
          if (item.startsWith('<li>')) {
            if (!inList) {
              result += '<ul>';
              inList = true;
            }
            result += item;
          } else {
            if (inList) {
              result += '</ul>';
              inList = false;
            }
            result += item;
          }
        }
        
        if (inList) {
          result += '</ul>';
        }
        
        return result;
      }
      
      // Regular paragraph
      return `<p>${p}</p>`;
    }).join('');

    this.debug('Markdown conversion complete, output length:', html.length);
    return html;
  }
}

window.NoteViewerMarkdown = NoteViewerMarkdown;