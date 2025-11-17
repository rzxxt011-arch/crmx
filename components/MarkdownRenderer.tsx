import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

// A very basic Markdown renderer for demonstration purposes.
// For a production app, consider a dedicated library like 'react-markdown'.
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderLine = (line: string, index: number) => {
    // Check for list items
    if (line.match(/^(\s*)- /)) {
      const depth = line.match(/^(\s*)- /)?.[1].length || 0;
      return <li key={index} style={{ marginLeft: `${depth * 10}px` }} className="mb-1">{line.replace(/^(\s*)- /, '')}</li>;
    }
    if (line.match(/^(\s*)\d+\. /)) {
      const depth = line.match(/^(\s*)\d+\. /)?.[1].length || 0;
      return <li key={index} style={{ marginLeft: `${depth * 10}px` }} className="mb-1">{line.replace(/^(\s*)\d+\. /, '')}</li>;
    }

    let processedLine = line;
    // Replace **text** with <strong>text</strong>
    processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace *text* with <em>text</em>
    processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Replace [link text](url) with <a href="url">link text</a>
    processedLine = processedLine.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>');
    // Replace # Heading with <h2>Heading</h2>
    processedLine = processedLine.replace(/^#\s(.*?)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>');
    // Replace ## Heading with <h3>Heading</h3>
    processedLine = processedLine.replace(/^##\s(.*?)$/gm, '<h3 class="text-lg font-semibold mt-3 mb-1">$1</h3>');

    return <p key={index} className="mb-2" dangerouslySetInnerHTML={{ __html: processedLine }} />;
  };

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let currentListItems: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const isListItem = line.match(/^(\s*)[*-] /) || line.match(/^(\s*)\d+\. /);
    const isDivider = line.startsWith('---');

    if (isDivider) {
      if (inList) {
        renderedElements.push(listType === 'ul' ? <ul key={`ul-end-${index}`}>{currentListItems}</ul> : <ol key={`ol-end-${index}`}>{currentListItems}</ol>);
        currentListItems = [];
        inList = false;
        listType = null;
      }
      renderedElements.push(<hr key={index} className="my-4 border-t border-gray-200" />);
    } else if (isListItem) {
      if (!inList) {
        inList = true;
        listType = line.match(/^(\s*)\d+\. /) ? 'ol' : 'ul';
      } else if ((listType === 'ul' && line.match(/^(\s*)\d+\. /)) || (listType === 'ol' && line.match(/^(\s*)[*-] /))) {
        // Change of list type
        renderedElements.push(listType === 'ul' ? <ul key={`ul-switch-${index}`}>{currentListItems}</ul> : <ol key={`ol-switch-${index}`}>{currentListItems}</ol>);
        currentListItems = [];
        listType = line.match(/^(\s*)\d+\. /) ? 'ol' : 'ul';
      }
      currentListItems.push(renderLine(line, index));
    } else {
      if (inList) {
        renderedElements.push(listType === 'ul' ? <ul key={`ul-after-${index}`}>{currentListItems}</ul> : <ol key={`ol-after-${index}`}>{currentListItems}</ol>);
        currentListItems = [];
        inList = false;
        listType = null;
      }
      if (line.trim() !== '') {
        renderedElements.push(renderLine(line, index));
      }
    }
  });

  if (inList) {
    renderedElements.push(listType === 'ul' ? <ul key="ul-final">{currentListItems}</ul> : <ol key="ol-final">{currentListItems}</ol>);
  }

  return (
    <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none text-gray-800">
      {renderedElements}
    </div>
  );
};

export default MarkdownRenderer;