import React from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

/**
 * UploadHelpSection - PGN format help for uploads
 * Uses design tokens and is fully responsive.
 */
const UploadHelpSection = React.memo(() => (
  <section aria-label="PGN format help" className="bg-background-light dark:bg-background-dark border border-accent shadow-md rounded-xl p-5 sm:p-6 transition-all duration-200 max-w-7xl mx-auto mb-6">
    <div className="flex items-start gap-3">
      <span className="flex-shrink-0">
        <InformationCircleIcon className="w-7 h-7 text-accent transition-all duration-200" aria-hidden="true" />
      </span>
      <div>
        <h3 className="text-xl font-semibold text-primary mb-2">PGN Format Help</h3>
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
