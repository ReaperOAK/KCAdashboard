/**
 * This is a fallback implementation when we can't load the lichess-pgn-viewer
 * It creates an iframe that loads the PGN in lichess.org
 */
export const createFallbackViewer = (container, options) => {
  if (!container) return null;
  
  const { pgn } = options || {};
  
  if (!pgn) {
    container.innerHTML = '<div class="p-4 text-red-600">No PGN data provided</div>';
    return null;
  }

  // Create an iframe to lichess analysis board
  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.minHeight = '450px';
  iframe.style.border = 'none';
  iframe.title = 'Chess Analysis';
  
  try {
    // Clean the PGN content and encode it
    const cleanedPgn = pgn.trim();
    
    // If PGN is too large for URL, use a post form via the iframe
    if (cleanedPgn.length > 2000) {
      // We'll use a hidden form to POST the data
      container.innerHTML = `
        <div class="h-full flex flex-col">
          <div class="bg-gray-100 p-2 text-sm text-gray-700 mb-2">
            PGN is too large for direct URL. Loading in external viewer...
          </div>
          <div id="viewer-container" class="flex-1 min-h-[400px]"></div>
        </div>
      `;
      
      const viewerContainer = container.querySelector('#viewer-container');
      viewerContainer.appendChild(iframe);
      
      // Set a basic URL first - we'll post to it later
      iframe.src = 'https://lichess.org/analysis';
      
      iframe.onload = () => {
        try {
          // Try to open the PGN in the iframe's analysis board via console
          iframe.contentWindow.postMessage({
            action: 'analyse.load',
            pgn: cleanedPgn
          }, 'https://lichess.org');
        } catch (e) {
          console.error('Failed to post PGN to iframe:', e);
        }
      };
    } else {
      // For smaller PGNs, use the URL method
      iframe.src = `https://lichess.org/analysis/pgn/${encodeURIComponent(cleanedPgn)}`;
    }
    
    container.innerHTML = '';
    container.appendChild(iframe);
    
    return {
      destroy: () => {
        if (container.contains(iframe)) {
          container.removeChild(iframe);
        }
      },
      pgn: pgn
    };
  } catch (error) {
    console.error('Error creating fallback viewer:', error);
    container.innerHTML = `
      <div class="p-4 bg-red-100 text-red-700 rounded">
        <p class="font-bold">Error loading PGN viewer</p>
        <p class="text-sm mt-1">${error.message}</p>
      </div>
    `;
    return null;
  }
};
