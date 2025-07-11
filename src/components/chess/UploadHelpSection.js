import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

/**
 * UploadHelpSection - PGN format help for uploads
 * Uses design tokens and is fully responsive.
 */
const UploadHelpSection = React.memo(() => (
  <section aria-label="PGN format help" className="bg-background-light dark:bg-background-dark border border-accent rounded-lg p-6 transition-all duration-200">
    <div className="flex items-start">
      <InformationCircleIcon className="w-6 h-6 text-accent mr-3 mt-0.5" aria-hidden="true" />
      <div>
        <h3 className="text-lg font-semibold text-primary">PGN Format Help</h3>
        <div className="text-sm text-accent space-y-2">
          <p><strong>Supported features:</strong> Multiple games, variations, comments, NAGs, headers</p>
          <p><strong>File formats:</strong> .pgn, .txt files up to 10MB</p>
          <p><strong>Comments:</strong> Use {'{}'} for annotations, variations supported with parentheses</p>
          <p><strong>NAGs:</strong> Numeric Annotation Glyphs like $1 (good move), $2 (mistake) are supported</p>
        </div>
      </div>
    </div>
  </section>
));

export default UploadHelpSection;
