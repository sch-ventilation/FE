import React from "react";
import CircularProgress from "../common/CircularProgress";

const TopRowCards = ({ data, sensorStatus, thresholds, isDarkMode, predictionData }) => {
  // 센서 상태 데이터가 없을 때 기본값 사용
  const currentSensorData = sensorStatus || {
    temperature: 0,
    humidity: 0,
    pm25: 0,
    pm10: 0,
    co2: 0,
    tvoc: 0
  };

  // 각 센서별 기준치와 퍼센테이지 계산
  const getSensorPercentage = (value, type) => {
    // API에서 받은 기준치 사용, 없으면 기본값
    const defaultThresholds = {
      fineDust: 75,    // PM10 기준치
      ultrafineDust: 35, // PM2.5 기준치
      co2: 1000,       // CO2 기준치
      voc: 400,        // TVOC 기준치
      temperature: { min: 18, max: 28 }, // 온도 기준치 (범위)
      humidity: { min: 30, max: 80 }     // 습도 기준치 (범위)
    };
    
    const thresholdsData = thresholds || defaultThresholds;
    
    // API 기준치 매핑
    const thresholdMapping = {
      fineDust: thresholdsData.pm10,
      ultrafineDust: thresholdsData.pm25,
      co2: thresholdsData.co2,
      voc: thresholdsData.tvoc,
      temperature: thresholdsData.temperature,
      humidity: thresholdsData.humidity
    };
    
    const threshold = thresholdMapping[type];
    if (!threshold) return 0;
    
    // 범위 기준치 (온도, 습도) 처리
    if (type === 'temperature' || type === 'humidity') {
      const { min, max } = threshold;
      if (value >= min && value <= max) {
        return 50; // 적정 범위 내면 50% (보통)
      } else {
        // 범위에서 벗어난 정도에 따라 계산
        const center = (min + max) / 2;
        const deviation = Math.abs(value - center);
        const maxDeviation = Math.max(center - min, max - center);
        const percentage = Math.min(100, (deviation / maxDeviation) * 100);
        return Math.round(percentage);
      }
    }
    
    // 단일 기준치 처리 (PM10, PM2.5, CO2, TVOC)
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

  // cross_time(ISO) -> "h:mm 오전/오후" 문자열 생성
  const formatKoreanTimeString = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const rawHour = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = rawHour < 12 ? '오전' : '오후';
    let hour12 = rawHour % 12;
    if (hour12 === 0) hour12 = 12;
    return `${hour12}:${minutes} ${ampm}`;
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
          {predictionData && predictionData.vent_time_estimate !== undefined ? (
            predictionData.vent_time_estimate === null ? (
              <span className="text-3xl font-bold transition-colors duration-300" style={{ color: '#61BC90' }}>쾌적</span>
            ) : (typeof predictionData.vent_time_estimate === 'object' && predictionData.vent_time_estimate.cross_time) ? (
              <div className="flex flex-col gap-3 items-start">
                <p className="px-4 py-2 rounded-lg text-3xl font-medium" style={{ color: '#000000', backgroundColor: '#FDCF1D' }}>
                  {Math.round(Number(predictionData.vent_time_estimate.minutes_to_cross))}분 후
                </p>
                <div className="flex items-baseline justify-center gap-2 w-full">
                  {/* 시간과 오전/오후 분리 표시 */}
                  {(() => {
                    const timeText = formatKoreanTimeString(predictionData.vent_time_estimate.cross_time);
                    const [timePart, meridiemPart] = timeText.split(' ');
                    return (
                      <>
                        <span className={`text-7xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{timePart}</span>
                        <span className={`text-2xl font-normal transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{meridiemPart}</span>
                      </>
                    );
                  })()}
                </div>
              </div>
            ) : (
              // 예기치 않은 형태면 빈 상태 유지
              <></>
            )
          ) : (
            // API 응답 전: 박스만, 텍스트 없음
            <></>
          )}
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
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getSensorColor(getSensorPercentage(currentSensorData.temperature, 'temperature')) }}
              ></div>
              <span className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>온도</span>
            </div>
            <p className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentSensorData.temperature}°C</p>
          </div>
          <div className={`rounded-lg p-3 py-5 flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getSensorColor(getSensorPercentage(currentSensorData.humidity, 'humidity')) }}
              ></div>
              <span className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>습도</span>
            </div>
            <p className={`text-2xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentSensorData.humidity}%</p>
          </div>
          <div className={`rounded-lg p-3 py-5 flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-base font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>미세먼지</p>
            <p className={`text-lg font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {getSensorStatus(getSensorPercentage(currentSensorData.pm10, 'fineDust'))} ({currentSensorData.pm10}㎍/㎥)
            </p>
            <div className="w-3/4 mt-2">
              <div className={`h-6 rounded-full w-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ borderRadius: '9999px' }}>
                <div 
                  className="h-6 transition-all duration-500"
                  style={{ 
                    width: `${getSensorPercentage(currentSensorData.pm10, 'fineDust')}%`,
                    backgroundColor: getSensorColor(getSensorPercentage(currentSensorData.pm10, 'fineDust')),
                    borderRadius: '9999px'
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className={`rounded-lg p-3 py-5 flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-base font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>초미세먼지</p>
            <p className={`text-lg font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {getSensorStatus(getSensorPercentage(currentSensorData.pm25, 'ultrafineDust'))} ({currentSensorData.pm25}㎍/㎥)
            </p>
            <div className="w-3/4 mt-2">
              <div className={`h-6 rounded-full w-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ borderRadius: '9999px' }}>
                <div 
                  className="h-6 transition-all duration-500"
                  style={{ 
                    width: `${getSensorPercentage(currentSensorData.pm25, 'ultrafineDust')}%`,
                    backgroundColor: getSensorColor(getSensorPercentage(currentSensorData.pm25, 'ultrafineDust')),
                    borderRadius: '9999px'
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className={`rounded-lg p-3 py-5 flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-base font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>이산화탄소</p>
            <p className={`text-lg font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {getSensorStatus(getSensorPercentage(currentSensorData.co2, 'co2'))} ({currentSensorData.co2}ppm)
            </p>
            <div className="w-3/4 mt-2">
              <div className={`h-6 rounded-full w-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ borderRadius: '9999px' }}>
                <div 
                  className="h-6 transition-all duration-500"
                  style={{ 
                    width: `${getSensorPercentage(currentSensorData.co2, 'co2')}%`,
                    backgroundColor: getSensorColor(getSensorPercentage(currentSensorData.co2, 'co2')),
                    borderRadius: '9999px'
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div className={`rounded-lg p-3 py-5 flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <p className={`text-base font-semibold mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>휘발성유기화합물</p>
            <p className={`text-lg font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {getSensorStatus(getSensorPercentage(currentSensorData.tvoc, 'voc'))} ({currentSensorData.tvoc}㎍/㎥)
            </p>
            <div className="w-3/4 mt-2">
              <div className={`h-6 rounded-full w-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`} style={{ borderRadius: '9999px' }}>
                <div 
                  className="h-6 transition-all duration-500"
                  style={{ 
                    width: `${getSensorPercentage(currentSensorData.tvoc, 'voc')}%`,
                    backgroundColor: getSensorColor(getSensorPercentage(currentSensorData.tvoc, 'voc')),
                    borderRadius: '9999px'
                  }}
                ></div>
              </div>
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
          {predictionData?.aqi_score && (
            <div className="flex flex-col items-center gap-3">
              <CircularProgress 
                percentage={predictionData.aqi_score.overall || 0} 
                size={220} 
                isDarkMode={isDarkMode}
                showIcon={false}
                status={predictionData.aqi_score.status}
                customColor={
                  predictionData.aqi_score.status === 'good' ? '#61BC90' :
                  predictionData.aqi_score.status === 'moderate' ? '#f59e0b' :
                  predictionData.aqi_score.status === 'bad' ? '#ef4444' :
                  undefined
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopRowCards;

