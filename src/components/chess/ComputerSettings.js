import React from 'react';

const ComputerSettings = React.memo(({ engineLevel, setEngineLevel, engineColor, setEngineColor, useOnlineAPI, setUseOnlineAPI }) => (
  <div className="w-full lg:flex-1 order-1 lg:order-2">
    <div className="bg-background-light dark:bg-background-dark p-4 sm:p-6 rounded-xl shadow-md border border-gray-light transition-all duration-200">
      {/* Engine Level */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary mb-2">Engine Level</label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <input
            type="range"
            min="1"
            max="20"
            value={engineLevel}
            onChange={e => setEngineLevel(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-light rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 min-w-0"
            aria-label="Engine Level"
          />
          <span className="min-w-[32px] text-center font-bold text-primary text-lg">{engineLevel}</span>
        </div>
      </div>
      {/* Play as */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-primary mb-2">Play as</label>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="color"
              value="white"
              checked={engineColor === 'white'}
              onChange={() => setEngineColor('white')}
              className="w-4 h-4 text-accent bg-gray-light border-gray-light focus:ring-accent transition-all duration-200"
              aria-label="Play as White"
              tabIndex={0}
            />
            <span className="text-text-dark">White</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="color"
              value="black"
              checked={engineColor === 'black'}
              onChange={() => setEngineColor('black')}
              className="w-4 h-4 text-accent bg-gray-light border-gray-light focus:ring-accent transition-all duration-200"
              aria-label="Play as Black"
              tabIndex={0}
            />
            <span className="text-text-dark">Black</span>
          </label>
        </div>
      </div>
      {/* Online API */}
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useOnlineAPI}
            onChange={e => setUseOnlineAPI(e.target.checked)}
            className="w-4 h-4 text-accent bg-gray-light border-gray-light rounded focus:ring-accent transition-all duration-200"
            aria-label="Use Online API"
            tabIndex={0}
          />
          <span className="text-text-dark">Use Online API (more powerful analysis)</span>
        </label>
        <p className="text-sm text-gray-dark mt-1">
          The online API provides stronger analysis but requires an internet connection.
        </p>
      </div>
    </div>
  </div>
));

export default ComputerSettings;
