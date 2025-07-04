import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  ArrowUpTrayIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import PGNViewer from '../../components/chess/PGNViewer';
import PGNUpload from '../../components/chess/PGNUpload';
import { PGNLibrary } from '../../components/chess/PGNLibrary';

/**
 * Main PGN Management Page
 * Combines upload, library, and viewer functionality
 */

// --- Constants ---
const SAMPLE_PGN = `[Event "World Championship"]\n[Site "New York"]\n[Date "1972.07.11"]\n[Round "6"]\n[White "Fischer, Robert James"]\n[Black "Spassky, Boris V"]\n[Result "1-0"]\n[ECO "D59"]\n[WhiteElo "2785"]\n[BlackElo "2660"]\n\n1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 \n7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 \n12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 \n17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7 \n22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5 \n27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7 \n32. Qe5 Qe8 33. a4 Qd8 34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8 \n37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4 1-0`;

const TABS = [
  { id: 'viewer', label: 'PGN Viewer', icon: BookOpenIcon, description: 'View and analyze chess games' },
  { id: 'upload', label: 'Upload PGN', icon: ArrowUpTrayIcon, description: 'Upload new PGN files' },
  { id: 'library', label: 'Game Library', icon: Cog6ToothIcon, description: 'Browse your game collection' },
];

// --- Subcomponents ---

const FeatureHighlights = React.memo(() => (
  <section aria-label="Feature highlights" className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="bg-blue-50 p-4 sm:p-6 rounded-lg">
      <h3 className="font-semibold text-blue-900 mb-2 text-base sm:text-lg">Advanced PGN Support</h3>
      <p className="text-sm sm:text-base text-blue-700">Handle complex PGNs with multiple games, variations, comments, and NAGs</p>
    </div>
    <div className="bg-green-50 p-4 sm:p-6 rounded-lg">
      <h3 className="font-semibold text-green-900 mb-2 text-base sm:text-lg">Interactive Analysis</h3>
      <p className="text-sm sm:text-base text-green-700">Navigate through games with autoplay, annotations, and variation exploration</p>
    </div>
    <div className="bg-purple-50 p-4 sm:p-6 rounded-lg">
      <h3 className="font-semibold text-purple-900 mb-2 text-base sm:text-lg">Game Management</h3>
      <p className="text-sm sm:text-base text-purple-700">Organize, search, and share your chess game collection</p>
    </div>
  </section>
));

const TabNav = React.memo(({ activeTab, onTabChange, tabs }) => (
  <div className="border-b border-gray-200" role="tablist" aria-label="PGN management tabs">
    <nav className="-mb-px flex overflow-x-auto no-scrollbar space-x-4 sm:space-x-8">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            className={
              `group inline-flex items-center py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-sm sm:text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap ` +
              (activeTab === tab.id
                ? 'border-accent text-accent '
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')
            }
          >
            <Icon className="w-5 h-5 mr-2" aria-hidden="true" />
            {tab.label}
          </button>
        );
      })}
    </nav>
    <div className="mt-3 sm:mt-4">
      <p className="text-sm text-gray-600">
        {tabs.find(tab => tab.id === activeTab)?.description}
      </p>
    </div>
  </div>
));

const QuickActions = React.memo(({ onLoadSample, onUploadClick }) => (
  <section aria-label="Quick actions" className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Quick Start</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        type="button"
        onClick={onLoadSample}
        className="p-3 sm:p-4 border border-gray-light rounded-lg hover:bg-gray-light/30 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Load sample game"
      >
        <div className="font-medium text-gray-900">Load Sample Game</div>
        <div className="text-sm text-gray-600">Fischer vs Spassky - World Championship 1972</div>
      </button>
      <button
        type="button"
        onClick={onUploadClick}
        className="p-3 sm:p-4 border border-gray-light rounded-lg hover:bg-gray-light/30 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-label="Upload your PGN"
      >
        <div className="font-medium text-gray-900">Upload Your PGN</div>
        <div className="text-sm text-gray-600">Upload files from your computer</div>
      </button>
    </div>
  </section>
));

const UploadHelpSection = React.memo(() => (
  <section aria-label="PGN format help" className="bg-blue-50  border border-blue-200  rounded-lg p-6">
    <div className="flex items-start">
      <InformationCircleIcon className="w-6 h-6 text-blue-500 mr-3 mt-0.5" aria-hidden="true" />
      <div>
        <h3 className="text-lg font-semibold text-blue-900 ">PGN Format Help</h3>
        <div className="text-sm text-blue-800  space-y-2">
          <p><strong>Supported features:</strong> Multiple games, variations, comments, NAGs, headers</p>
          <p><strong>File formats:</strong> .pgn, .txt files up to 10MB</p>
          <p><strong>Comments:</strong> Use {'{}'} for annotations, variations supported with parentheses</p>
          <p><strong>NAGs:</strong> Numeric Annotation Glyphs like $1 (good move), $2 (mistake) are supported</p>
        </div>
      </div>
    </div>
  </section>
));

// --- Main Page ---

export const PGNManagementPage = React.memo(function PGNManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('viewer');
  const [selectedPGN, setSelectedPGN] = useState('');

  // Only show upload tab if not student
  const tabs = useMemo(() => {
    if (user && user.role && user.role.toLowerCase() === 'student') {
      return TABS.filter(tab => tab.id !== 'upload');
    }
    return TABS;
  }, [user]);

  // --- Handlers ---
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
  }, []);

  const handleLoadSample = useCallback(() => {
    setSelectedPGN(SAMPLE_PGN);
  }, []);

  const handleUploadClick = useCallback(() => {
    if (user && user.role && user.role.toLowerCase() === 'student') {
      // Do nothing or show a message
      return;
    }
    setActiveTab('upload');
  }, [user]);

  const handlePGNParsed = useCallback((pgnData) => {
    setSelectedPGN(pgnData.content);
    // Optionally: setActiveTab('viewer');
  }, []);

  const handleUploadComplete = useCallback((result) => {
    if (result.success) {
      setActiveTab('library');
    }
  }, []);

  const handleGameSelect = useCallback((game) => {
    setSelectedPGN(game.pgn_content);
    // Optionally: setActiveTab('viewer');
  }, []);

  // --- Render ---
  return (
    <div className="min-h-screen bg-background-light py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        <header className="mb-6 sm:mb-8" aria-label="Page header">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-3 sm:mb-4">Chess PGN Manager</h1>
          <p className="text-base sm:text-lg text-text-dark mb-4 sm:mb-6">
            Upload, analyze, and manage your chess game collection with support for complex PGNs, variations, comments, and annotations.
          </p>
          <FeatureHighlights />
        </header>
        <section className="mb-6 sm:mb-8">
          <TabNav activeTab={activeTab} onTabChange={handleTabChange} tabs={tabs} />
        </section>
        <section className="tab-content w-full" id={`tabpanel-${activeTab}`} role="tabpanel" aria-labelledby={activeTab}>
          {activeTab === 'viewer' && (
            <>
              <QuickActions onLoadSample={handleLoadSample} onUploadClick={handleUploadClick} />
              <div className="w-full">
                <PGNViewer
                  initialPgn={selectedPGN}
                  width={550}
                  height={undefined}
                  showControls
                  showHeaders
                  showMoveList
                  autoPlay={false}
                  theme="light"
                  className="bg-white shadow-lg w-full h-auto"
                />
              </div>
            </>
          )}
          {activeTab === 'upload' && (
            <div className="w-full">
              {user && user.role && user.role.toLowerCase() === 'student' ? (
                <div className="bg-yellow-100 border border-yellow-300 text-yellow-900 rounded-lg p-6 text-center">
                  Students are not allowed to upload PGN files.
                </div>
              ) : (
                <>
                  <PGNUpload
                    onPGNParsed={handlePGNParsed}
                    onUploadComplete={handleUploadComplete}
                    className="bg-white shadow-lg w-full h-auto"
                  />
                  <UploadHelpSection />
                </>
              )}
            </div>
          )}
          {activeTab === 'library' && (
            <div className="w-full">
              <PGNLibrary
                onGameSelect={handleGameSelect}
                showViewer
                className="bg-white shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
});

export default PGNManagementPage;
