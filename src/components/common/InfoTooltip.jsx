import React, { useState } from 'react';

const InfoTooltip = ({ isDarkMode }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      {/* i 버튼 */}
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-200 ${
          isDarkMode 
            ? 'bg-gray-600 text-gray-300 hover:bg-gray-500' 
            : 'bg-gray-300 text-gray-600 hover:bg-gray-400'
        }`}
      >
        i
      </button>

      {/* 툴팁 */}
      {isVisible && (
        <div className="absolute left-0 top-8 z-50 w-80 p-4 rounded-lg shadow-lg border transition-all duration-200"
             style={{
               backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
               borderColor: isDarkMode ? '#374151' : '#e5e7eb',
               boxShadow: '0 10px 25px rgba(0,0,0,0.15), 0 4px 6px rgba(0,0,0,0.1)'
             }}>
          {/* 제목 */}
          <h3 className="text-lg font-bold text-black mb-3">
            교육부 학교 실내공기질 기준
          </h3>
          
          {/* 내용 */}
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-bold text-black">실내온도</span> 18℃~28℃ (난방: 18~20℃, 냉방: 26~28℃)
            </div>
            <div>
              <span className="font-bold text-black">비교습도</span> 30%~80%
            </div>
            <div>
              <span className="font-bold text-black">미세먼지</span> 75(㎍/㎥)이하
            </div>
            <div>
              <span className="font-bold text-black">초미세먼지</span> 35(㎍/㎥)이하
            </div>
            <div>
              <span className="font-bold text-black">이산화탄소</span> 1,000(ppm)이하
            </div>
            <div>
              <span className="font-bold text-black">총휘발성유기화합물</span> 400(㎍/㎥)이하
            </div>
          </div>
          
          {/* 출처 */}
          <div className="mt-4 pt-3 border-t border-gray-300">
            <p className="text-xs text-gray-600">
              출처: 학교보건법 시행규칙 [별표 4의2] 한국공기청정협회 홈페이지
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
