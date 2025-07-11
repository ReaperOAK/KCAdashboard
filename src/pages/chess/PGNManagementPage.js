import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ArrowUpTrayIcon, BookOpenIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import PGNViewer from '../../components/chess/PGNViewer';
import PGNUpload from '../../components/chess/PGNUpload';
import { PGNLibrary } from '../../components/chess/PGNLibrary';
import FeatureHighlights from '../../components/chess/FeatureHighlights';
import TabNav from '../../components/chess/TabNav';
import QuickActions from '../../components/chess/QuickActions';
import UploadHelpSection from '../../components/chess/UploadHelpSection';

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
                  className="bg-background-light dark:bg-background-dark border border-gray-light shadow-lg w-full h-auto"
                />
              </div>
            </>
          )}
          {activeTab === 'upload' && (
            <div className="w-full">
              {user && user.role && user.role.toLowerCase() === 'student' ? (
                <div className="bg-warning border border-warning text-white rounded-lg p-6 text-center">
                  Students are not allowed to upload PGN files.
                </div>
              ) : (
                <>
                  <PGNUpload
                    onPGNParsed={handlePGNParsed}
                    onUploadComplete={handleUploadComplete}
                    className="bg-background-light dark:bg-background-dark border border-gray-light shadow-lg w-full h-auto"
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
                className="bg-background-light dark:bg-background-dark border border-gray-light shadow-lg rounded-lg p-4 sm:p-6 w-full h-auto"
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
});

export default PGNManagementPage;
