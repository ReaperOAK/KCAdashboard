import React, { useState } from 'react';
import { 
  ArrowUpTrayIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import PGNViewer from '../../components/chess/PGNViewer';
import PGNUpload from '../../components/chess/PGNUpload';
import PGNLibrary from '../../components/chess/PGNLibrary';

/**
 * Main PGN Management Page
 * Combines upload, library, and viewer functionality
 */
const PGNManagementPage = () => {
  const [activeTab, setActiveTab] = useState('viewer');
  const [selectedPGN, setSelectedPGN] = useState('');

  // Sample PGN for demo
  const samplePGN = `[Event "World Championship"]
[Site "New York"]
[Date "1972.07.11"]
[Round "6"]
[White "Fischer, Robert James"]
[Black "Spassky, Boris V"]
[Result "1-0"]
[ECO "D59"]
[WhiteElo "2785"]
[BlackElo "2660"]

1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 
7. Bh4 b6 8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 
12. Qa4 c5 13. Qa3 Rc8 14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 
17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6 20. e4 d4 21. f4 Qe7 
22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5 exf5 
27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7 
32. Qe5 Qe8 33. a4 Qd8 34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8 
37. Qe4 Nf6 38. Rxf6 gxf6 39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4 1-0`;

  const tabs = [
    { id: 'viewer', label: 'PGN Viewer', icon: BookOpenIcon, description: 'View and analyze chess games' },
    { id: 'upload', label: 'Upload PGN', icon: ArrowUpTrayIcon, description: 'Upload new PGN files' },
    { id: 'library', label: 'Game Library', icon: Cog6ToothIcon, description: 'Browse your game collection' }
  ];

  const handlePGNParsed = (pgnData) => {
    setSelectedPGN(pgnData.content);
    // Optionally switch to viewer tab after successful parse
    // setActiveTab('viewer');
  };

  const handleUploadComplete = (result) => {
    if (result.success) {
      // Switch to library tab to see the uploaded game
      setActiveTab('library');
    }
  };

  const handleGameSelect = (game) => {
    setSelectedPGN(game.pgn_content);
    // Optionally switch to viewer tab
    // setActiveTab('viewer');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Chess PGN Manager
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Upload, analyze, and manage your chess game collection with support for complex PGNs,
            variations, comments, and annotations.
          </p>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Advanced PGN Support
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Handle complex PGNs with multiple games, variations, comments, and NAGs
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Interactive Analysis
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Navigate through games with autoplay, annotations, and variation exploration
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                Game Management
              </h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Organize, search, and share your chess game collection
              </p>
            </div>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Tab descriptions */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab content */}
        <div className="tab-content">
          {activeTab === 'viewer' && (
            <div className="space-y-6">
              {/* Quick actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Start
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedPGN(samplePGN)}
                    className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      Load Sample Game
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Fischer vs Spassky - World Championship 1972
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      Upload Your PGN
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Upload files from your computer
                    </div>
                  </button>
                </div>
              </div>
              
              {/* PGN Viewer */}
              <PGNViewer
                initialPgn={selectedPGN}
                width={500}
                height={500}
                showControls={true}
                showHeaders={true}
                showMoveList={true}
                autoPlay={false}
                theme="light"
                className="bg-white dark:bg-gray-800 shadow-lg"
              />
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-6">
              <PGNUpload
                onPGNParsed={handlePGNParsed}
                onUploadComplete={handleUploadComplete}
                className="bg-white dark:bg-gray-800 shadow-lg"
              />
              
              {/* Help section */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-6 h-6 text-blue-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      PGN Format Help
                    </h3>
                    <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                      <p>
                        <strong>Supported features:</strong> Multiple games, variations, comments, NAGs, headers
                      </p>
                      <p>
                        <strong>File formats:</strong> .pgn, .txt files up to 10MB
                      </p>
                      <p>
                        <strong>Comments:</strong> Use {`{}`} for annotations, variations supported with parentheses
                      </p>
                      <p>
                        <strong>NAGs:</strong> Numeric Annotation Glyphs like $1 (good move), $2 (mistake) are supported
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <PGNLibrary
              onGameSelect={handleGameSelect}
              showViewer={true}
              className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PGNManagementPage;
