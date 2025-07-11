import React from 'react';

const ComputerSettings = ({ engineLevel, setEngineLevel, engineColor, setEngineColor, useOnlineAPI, setUseOnlineAPI }) => (
  <div className="w-full lg:flex-1 space-y-6 order-1 lg:order-2">
    <div className="bg-background-light p-4 sm:p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <label className="block text-sm font-medium text-primary mb-2">Engine Level</label>
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3">
          <input
            type="range"
            min="1"
            max="20"
            value={engineLevel}
            onChange={e => setEngineLevel(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-light rounded-lg appearance-none cursor-pointer slider:bg-accent min-w-0"
            aria-label="Engine Level"
          />
          <span className="min-w-[24px] text-center font-bold text-primary">{engineLevel}</span>
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-primary mb-2">Play as</label>
        <div className="flex flex-col xs:flex-row gap-3 xs:gap-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="color"
              value="white"
              checked={engineColor === 'black'}
              onChange={() => setEngineColor('black')}
              className="w-4 h-4 text-accent bg-gray-light border-gray-light focus:ring-accent"
              aria-label="Play as White"
            />
            <span className="text-text-dark">White</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="color"
              value="black"
              checked={engineColor === 'white'}
              onChange={() => setEngineColor('white')}
              className="w-4 h-4 text-accent bg-gray-light border-gray-light focus:ring-accent"
              aria-label="Play as Black"
            />
            <span className="text-text-dark">Black</span>
          </label>
        </div>
      </div>
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useOnlineAPI}
            onChange={e => setUseOnlineAPI(e.target.checked)}
            className="w-4 h-4 text-accent bg-gray-light border-gray-light rounded focus:ring-accent"
            aria-label="Use Online API"
          />
          <span className="text-text-dark">Use Online API (more powerful analysis)</span>
        </label>
        <p className="text-sm text-gray-dark mt-1">
          The online API provides stronger analysis but requires an internet connection.
        </p>
      </div>
    </div>
  </div>
);

export default ComputerSettings;
