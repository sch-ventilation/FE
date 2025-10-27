import React from "react";
import CircularProgress from "../common/CircularProgress";

const TopRowCards = ({ data, isDarkMode }) => {
  // 각 센서별 기준치와 퍼센테이지 계산
  const getSensorPercentage = (value, type) => {
    const thresholds = {
      fineDust: 75,    // PM10 기준치
      ultrafineDust: 35, // PM2.5 기준치
      co2: 1000,       // CO2 기준치
      voc: 400         // TVOC 기준치
    };
    
    const threshold = thresholds[type];
    if (!threshold) return 0;
    
    // 기준치 대비 퍼센테이지 계산 (최대 100%)
    const percentage = Math.min((value / threshold) * 100, 100);
    return Math.round(percentage);
  };

  const getSensorColor = (percentage) => {
    if (percentage <= 60) return '#61BC90'; // 좋음 (녹색)
    if (percentage <= 80) return '#f59e0b'; // 보통 (노란색)
    return '#ef4444'; // 나쁨 (빨간색)
  };

  const getSensorStatus = (percentage) => {
    if (percentage <= 60) return '좋음';
    if (percentage <= 80) return '보통';
    return '나쁨';
  };

  return (
    <div className="grid grid-cols-10 gap-6 mb-6">
      {/* 추천 환기 시간 */}
      <div className={`rounded-2xl p-6 col-span-3 shadow-lg transition-colors duration-300 flex flex-col ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`} style={isDarkMode ? { 
        boxShadow: '0 0 6px 2px rgba(55, 65, 81, 0.4), 0 0 12px 4px rgba(55, 65, 81, 0.2), 0 0 18px 6px rgba(55, 65, 81, 0.1)',
        filter: 'blur(0.5px)'
      } : {}}>
        <h2 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>추천 환기 시간</h2>
        <div className="flex-1 flex justify-center items-center">
          <div className="flex flex-col gap-3 items-start">
            <p className="px-4 py-2 rounded-lg text-3xl font-medium" style={{ color: '#000000', backgroundColor: '#FDCF1D' }}>{data.etaMinutes}분 후</p>
            <div className="flex items-baseline justify-center gap-2 w-full">
              <span className={`text-7xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.recommendedTime.split(' ')[0]}</span>
              <span className={`text-2xl font-normal transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{data.recommendedTime.split(' ')[1]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 현재 공기질 점수 */}
      <div className={`rounded-2xl p-6 col-span-3 shadow-lg transition-colors duration-300 flex flex-col ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`} style={isDarkMode ? { 
        boxShadow: '0 0 6px 2px rgba(55, 65, 81, 0.4), 0 0 12px 4px rgba(55, 65, 81, 0.2), 0 0 18px 6px rgba(55, 65, 81, 0.1)',
        filter: 'blur(0.5px)'
      } : {}}>
        <h2 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>현재 공기질 점수</h2>
        <div className="flex justify-center items-center flex-1">
          <CircularProgress percentage={data.accuracy} size={220} isDarkMode={isDarkMode} />
        </div>
      </div>

      {/* 현재 공기질 지수 */}
      <div className={`rounded-2xl p-6 col-span-4 shadow-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`} style={isDarkMode ? { 
        boxShadow: '0 0 6px 2px rgba(55, 65, 81, 0.4), 0 0 12px 4px rgba(55, 65, 81, 0.2), 0 0 18px 6px rgba(55, 65, 81, 0.1)',
        filter: 'blur(0.5px)'
      } : {}}>
        <h2 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>현재 공기질 지수</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className={`rounded-lg p-3 py-5 flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>온도</span>
            </div>
            <p className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.temperature}°C</p>
          </div>
          <div className={`rounded-lg p-3 py-5 flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className={`text-xs transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>습도</span>
            </div>
            <p className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.humidity}%</p>
          </div>
          <div className={`rounded-lg p-3 py-5 flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-xs mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>미세먼지</p>
            <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {getSensorStatus(getSensorPercentage(data.fineDust.value, 'fineDust'))} ({data.fineDust.value}{data.fineDust.unit})
            </p>
            <div className="w-3/4 mt-2">
              <div className={`h-6 rounded-full w-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ borderRadius: '9999px' }}>
                <div 
                  className="h-6 transition-all duration-500"
                  style={{ 
                    width: `${getSensorPercentage(data.fineDust.value, 'fineDust')}%`,
                    backgroundColor: getSensorColor(getSensorPercentage(data.fineDust.value, 'fineDust')),
                    borderRadius: '9999px'
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className={`rounded-lg p-3 py-5 flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-xs mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>초미세먼지</p>
            <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {getSensorStatus(getSensorPercentage(data.ultrafineDust.value, 'ultrafineDust'))} ({data.ultrafineDust.value}{data.ultrafineDust.unit})
            </p>
            <div className="w-3/4 mt-2">
              <div className={`h-6 rounded-full w-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ borderRadius: '9999px' }}>
                <div 
                  className="h-6 transition-all duration-500"
                  style={{ 
                    width: `${getSensorPercentage(data.ultrafineDust.value, 'ultrafineDust')}%`,
                    backgroundColor: getSensorColor(getSensorPercentage(data.ultrafineDust.value, 'ultrafineDust')),
                    borderRadius: '9999px'
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className={`rounded-lg p-3 py-5 flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-xs mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>이산화탄소</p>
            <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {getSensorStatus(getSensorPercentage(data.co2.value, 'co2'))} ({data.co2.value}{data.co2.unit})
            </p>
            <div className="w-3/4 mt-2">
              <div className={`h-6 rounded-full w-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ borderRadius: '9999px' }}>
                <div 
                  className="h-6 transition-all duration-500"
                  style={{ 
                    width: `${getSensorPercentage(data.co2.value, 'co2')}%`,
                    backgroundColor: getSensorColor(getSensorPercentage(data.co2.value, 'co2')),
                    borderRadius: '9999px'
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className={`rounded-lg p-3 py-5 flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-xs mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>휘발성유기화합물</p>
            <p className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {getSensorStatus(getSensorPercentage(data.voc.value, 'voc'))} ({data.voc.value}{data.voc.unit})
            </p>
            <div className="w-3/4 mt-2">
              <div className={`h-6 rounded-full w-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ borderRadius: '9999px' }}>
                <div 
                  className="h-6 transition-all duration-500"
                  style={{ 
                    width: `${getSensorPercentage(data.voc.value, 'voc')}%`,
                    backgroundColor: getSensorColor(getSensorPercentage(data.voc.value, 'voc')),
                    borderRadius: '9999px'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopRowCards;

