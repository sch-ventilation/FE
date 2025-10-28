import React, { useState } from "react";

const Header = ({ data, isDarkMode, setIsDarkMode, onRefresh }) => {
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-4xl font-bold">
            <span style={{ color: '#61BC90' }}>Air</span>
            <span className={`transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-black'}`}>HOS</span>
          </span>
        </div>
        <div className="relative inline-block">
          <button 
            onClick={() => setShowRoomDropdown(!showRoomDropdown)}
            className={`px-4 py-3 rounded-lg border flex items-center gap-2 transition-colors duration-300 whitespace-nowrap ${
              isDarkMode 
                ? 'bg-black border-gray-600 text-white hover:bg-gray-800' 
                : 'bg-gray-100 border-gray-400 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="text-lg font-medium">{data.roomName}</span>
            <svg className={`w-4 h-4 ${isDarkMode ? 'text-white' : 'text-black'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showRoomDropdown && (
            <div className={`absolute top-full left-0 mt-2 min-w-full rounded-lg shadow-lg z-50 ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
            }`}>
              <div className="py-1">
                <button className={`w-full text-left px-3 py-1.5 text-lg transition-colors duration-300 whitespace-nowrap ${
                  isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  강의실 A
                </button>
                <button className={`w-full text-left px-3 py-1.5 text-lg transition-colors duration-300 whitespace-nowrap ${
                  isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  강의실 B
                </button>
                <button className={`w-full text-left px-3 py-1.5 text-lg transition-colors duration-300 whitespace-nowrap ${
                  isDarkMode ? 'text-white hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                }`}>
                  강의실 C
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-3 rounded-lg shadow-lg transition-colors duration-300 ${
            isDarkMode 
              ? 'text-yellow-400 bg-white hover:bg-gray-100' 
              : 'text-white bg-gray-800 hover:bg-gray-700'
          }`}
        >
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          )}
        </button>
        
        {/* 새로고침 버튼 */}
        <button
          onClick={onRefresh}
          className={`p-3 rounded-lg transition-colors duration-300 ${
            isDarkMode 
              ? 'text-white bg-gray-800 hover:bg-gray-700' 
              : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
          }`}
          title="데이터 새로고침"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Header;

