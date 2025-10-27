import React, { useRef, useState, useEffect } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  Line,
  Bar,
  Cell,
} from "recharts";
import CircularProgress from "../common/CircularProgress";

const AirStatusChart = ({ data, isDarkMode }) => {
  const [timeRange, setTimeRange] = useState("일");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollContainerRef = useRef(null);
  
  // 페이지 진입 시 오늘 날짜로 스크롤
  useEffect(() => {
    if (scrollContainerRef.current && timeRange === "일") {
      const today = new Date().getDate();
      // 약간의 지연을 두어 DOM이 완전히 렌더링된 후 스크롤
      const timer = setTimeout(() => {
        const buttonElement = scrollContainerRef.current.querySelector(`button:nth-child(${today})`);
        if (buttonElement) {
          buttonElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [timeRange]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollIntervalRef = useRef(null);

  // 달력 관련 함수들
  const formatDate = (date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setCurrentDate(newDate);
    setSelectedYear(newDate.getFullYear());
    setSelectedMonth(newDate.getMonth() + 1);
    setSelectedDay(newDate.getDate());
    setShowCalendar(false);
    
    // 선택한 일 버튼으로 스크롤 이동
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const buttonElement = scrollContainerRef.current.querySelector(`button:nth-child(${day})`);
        if (buttonElement) {
          buttonElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }, 100);
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // 달력 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCalendar && !event.target.closest('.calendar-container')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCalendar]);

  // 연속 스크롤 함수
  const startScrolling = (direction) => {
    if (scrollIntervalRef.current) return;
    
    scrollIntervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ 
          left: direction === 'left' ? -200 : 200, 
          behavior: 'smooth' 
        });
      }
    }, 50);
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  // 시간 형식 변환 함수 (10시, 22시 형식)
  const formatTime = (hour) => {
    return `${hour}시`;
  };

  // 날짜별 그래프 데이터 생성 (백엔드 연결 전까지 더미 데이터)
  const getGraphDataForDay = (day) => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const timeStr = formatTime(hour);
      // 날짜에 따라 다른 패턴의 데이터 생성 (더미)
      const dayOffset = day * 0.1;
      const baseTemp = 23 + Math.sin((i / 24 * Math.PI * 2) + dayOffset) * 2;
      const baseHumidity = 45 + Math.cos((i / 24 * Math.PI * 2) + dayOffset) * 5;
      const baseCO2 = 600 + Math.sin((i / 12 * Math.PI) + dayOffset) * 300;
      const basePM10 = 30 + Math.sin((i / 8 * Math.PI) + dayOffset) * 20;
      const basePM25 = 15 + Math.sin((i / 8 * Math.PI) + dayOffset) * 10;
      
      return {
        time: timeStr,
        temperature: Math.round(baseTemp * 10) / 10,
        humidity: Math.round(baseHumidity),
        co2: Math.round(baseCO2),
        pm10: Math.round(basePM10),
        pm25: Math.round(basePM25),
        predictedVent: i === 11 + (day % 5), // 날짜에 따라 예측 시점 변경
      };
    });
  };

  // 월별 그래프 데이터 생성 (1~31일)
  const getGraphDataForMonth = (month) => {
    return Array.from({ length: 31 }, (_, i) => {
      const day = i + 1;
      const dayStr = `${day}일`;
      // 월에 따라 다른 패턴의 데이터 생성 (더미)
      const monthOffset = month * 0.1;
      const baseTemp = 23 + Math.sin((i / 31 * Math.PI * 2) + monthOffset) * 2;
      const baseHumidity = 45 + Math.cos((i / 31 * Math.PI * 2) + monthOffset) * 5;
      const baseCO2 = 600 + Math.sin((i / 15 * Math.PI) + monthOffset) * 300;
      const basePM10 = 30 + Math.sin((i / 10 * Math.PI) + monthOffset) * 20;
      const basePM25 = 15 + Math.sin((i / 10 * Math.PI) + monthOffset) * 10;
      
      return {
        time: dayStr,
        temperature: Math.round(baseTemp * 10) / 10,
        humidity: Math.round(baseHumidity),
        co2: Math.round(baseCO2),
        pm10: Math.round(basePM10),
        pm25: Math.round(basePM25),
        predictedVent: i === 15 + (month % 5), // 월에 따라 예측 시점 변경
      };
    });
  };

  const graphData = timeRange === "월" ? getGraphDataForMonth(selectedMonth) : getGraphDataForDay(selectedDay);

  const thresholds = {
    co2: 1000,
    pm10: 75,
    pm25: 35,
    temperature: { min: 18, max: 28 },
    humidity: { min: 30, max: 80 },
    tvoc: 400,
  };

  const calculateAQI = (item) => {
    const co2Score = Math.min(100, (item.co2 / thresholds.co2) * 100);
    const pm25Score = Math.min(100, (item.pm25 / thresholds.pm25) * 100);
    const pm10Score = Math.min(100, (item.pm10 / thresholds.pm10) * 100);
    
    // 온도: 18~28℃ 범위에서 벗어나면 점수 감소
    const tempScore = item.temperature >= thresholds.temperature.min && item.temperature <= thresholds.temperature.max 
      ? 100 
      : Math.max(0, 100 - Math.abs(item.temperature - (thresholds.temperature.min + thresholds.temperature.max) / 2) * 10);
    
    // 습도: 30~80% 범위에서 벗어나면 점수 감소
    const humidityScore = item.humidity >= thresholds.humidity.min && item.humidity <= thresholds.humidity.max 
      ? 100 
      : Math.max(0, 100 - Math.abs(item.humidity - (thresholds.humidity.min + thresholds.humidity.max) / 2) * 2);
    
    const avg = (co2Score + pm25Score + pm10Score + tempScore + humidityScore) / 5;
    return Math.round(avg);
  };

  const processedData = graphData.map((item) => {
    const airIndex = calculateAQI(item);
    return {
      ...item,
      airIndex: airIndex,
      needsVent: airIndex <= 59,
      airIndex_bar: airIndex <= 59 ? airIndex : null, // 59 이하만 막대로 표시
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      
      const getAirQualityStatus = (index) => {
        if (index >= 80) return { text: "정상(좋음)", color: "#61BC90", bg: "#f0fdf4", border: "#bbf7d0" };
        if (index >= 60) return { text: "보통(주의)", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" };
        return { text: "나쁨(환기 필요)", color: "#ef4444", bg: "#fef2f2", border: "#fecaca" };
      };
      
      const getSensorName = (key) => {
        const names = {
          temperature: "온도",
          humidity: "습도", 
          co2: "CO₂",
          pm10: "미세먼지",
          pm25: "초미세먼지",
          tvoc: "TVOC"
        };
        return names[key] || key;
      };
      
      const airQualityStatus = getAirQualityStatus(d.airIndex);
      
      // 초과된 센서만 필터링
      const exceededSensors = Object.entries(thresholds).filter(([key, limit]) => d[key] > limit);

      return (
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.98)",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: 24,
            width: 320,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)",
            backdropFilter: "blur(10px)",
            transform: 'translate(10px, -300px)',
          }}
        >
          <strong style={{ fontSize: 18, color: '#1f2937', marginBottom: 16, display: 'block' }}>{label}</strong>
          
          <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
            {Object.entries(thresholds).map(([key, limit]) => {
              let isExceeded = false;
              
              if (key === 'temperature') {
                isExceeded = d[key] < limit.min || d[key] > limit.max;
              } else if (key === 'humidity') {
                isExceeded = d[key] < limit.min || d[key] > limit.max;
              } else {
                isExceeded = d[key] > limit;
              }
              
              return (
                <div key={key} style={{ fontSize: 16, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: '#6b7280' }}>{getSensorName(key)}:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {isExceeded && <span style={{ color: '#ef4444', fontSize: 18 }}>🚨</span>}
                    <span style={{ fontWeight: 500, color: '#1f2937' }}>
                      {key === 'temperature' && `${d[key]}℃`}
                      {key === 'humidity' && `${d[key]}%`}
                      {key === 'co2' && `${d[key]}ppm`}
                      {key === 'pm10' && `${d[key]}㎍/㎥`}
                      {key === 'pm25' && `${d[key]}㎍/㎥`}
                      {key === 'tvoc' && `${d[key]}㎍/㎥`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{ 
            marginTop: 16, 
            padding: 16, 
            borderRadius: 12,
            backgroundColor: airQualityStatus.bg,
            border: `1px solid ${airQualityStatus.border}`
          }}>
            {airQualityStatus.text === "나쁨(환기 필요)" && (
              <div style={{ fontSize: 16, fontWeight: 600, color: airQualityStatus.color, marginBottom: 8 }}>
                환기 필요
              </div>
            )}
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>종합 공기질 점수: <span style={{ color: '#1f2937' }}>{d.airIndex}</span></span>
              <span style={{ fontSize: 16, fontWeight: 600, color: airQualityStatus.color }}>
                {airQualityStatus.text === "정상(좋음)" && "정상"}
                {airQualityStatus.text === "보통(주의)" && "보통"}
                {airQualityStatus.text === "나쁨(환기 필요)" && "나쁨"}
              </span>
            </div>
            {d.predictedVent && (
              <div style={{ marginTop: 12, padding: 10, backgroundColor: '#faf5ff', borderRadius: 8, fontSize: 14, color: "#9333ea", fontWeight: 600 }}>
                🤖 예측 모델: "환기 필요"로 판단
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

   const CustomDot = (props) => {
     const { cx, cy, payload } = props;
     if (payload.predictedVent) {
       return (
         <g>
           <circle cx={cx} cy={cy} r={8} fill="#ef4444" opacity={0.2} />
           <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="white" strokeWidth={2.5} />
         </g>
       );
     }
     return (
       <g>
         <circle cx={cx} cy={cy} r={5} fill="#FDCF1D" opacity={0.2} />
         <circle cx={cx} cy={cy} r={4} fill="#FDCF1D" stroke="white" strokeWidth={2} />
       </g>
     );
   };

   const CustomYAxisTick = (props) => {
     const { x, y, payload } = props;
     const { value } = payload;
     
     if (value === 60) {
       return (
         <g transform={`translate(${x},${y})`}>
           <text x={0} y={0} dy={0} textAnchor="middle" fill={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} fontWeight={500}>
             <tspan x={0} dy={-8}>60</tspan>
             <tspan x={0} dy={16}>위험</tspan>
           </text>
         </g>
       );
     }
     
     if (value === 80) {
       return (
         <g transform={`translate(${x},${y})`}>
           <text x={0} y={0} dy={0} textAnchor="middle" fill={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} fontWeight={500}>
             <tspan x={0} dy={-8}>80</tspan>
             <tspan x={0} dy={16}>주의</tspan>
           </text>
         </g>
       );
     }
     
     return (
       <g transform={`translate(${x},${y})`}>
         <text x={0} y={0} dy={0} textAnchor="middle" fill={isDarkMode ? '#9ca3af' : '#6b7280'} fontSize={12} fontWeight={500}>
           {value}
         </text>
       </g>
     );
   };

  return (
    <>
    <div className="grid grid-cols-12 gap-6 w-full min-w-0">
      {/* Statistics */}
        <div className={`rounded-2xl p-6 shadow-lg col-span-10 transition-colors duration-300 min-w-0 ${
        isDarkMode ? 'bg-gray-950' : 'bg-white'
      }`} style={isDarkMode ? { 
        boxShadow: '0 0 6px 2px rgba(55, 65, 81, 0.4), 0 0 12px 4px rgba(55, 65, 81, 0.2), 0 0 18px 6px rgba(55, 65, 81, 0.1)',
        filter: 'blur(0.5px)'
      } : {}}>
        <div className="flex items-center justify-between mb-8">
          <h2 className={`text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>공기질 점수 변화 및 환기 예측 시점</h2>
          <div className="relative flex-[1] flex justify-end calendar-container">
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(new Date(selectedYear, selectedMonth - 1, selectedDay))}
            </button>
            {showCalendar && (
              <div className={`absolute right-0 mt-11 rounded-lg z-50 border p-6 ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200 shadow-xl'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => changeMonth(-1)}
                    className={`p-2 rounded transition-colors duration-300 ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <svg className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                  </h3>
                  <button
                    onClick={() => changeMonth(1)}
                    className={`p-2 rounded transition-colors duration-300 ${
                      isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <svg className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <div key={day} className={`text-center text-sm font-medium py-3 ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth() + 1) }, (_, i) => (
                    <div key={`empty-${i}`} className="h-10"></div>
                  ))}
                  {Array.from({ length: getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth() + 1) }, (_, i) => {
                    const day = i + 1;
                    const isSelected = day === selectedDay && 
                                     currentDate.getMonth() === selectedMonth - 1 && 
                                     currentDate.getFullYear() === selectedYear;
                    const isToday = day === new Date().getDate() && 
                                  currentDate.getMonth() === new Date().getMonth() && 
                                  currentDate.getFullYear() === new Date().getFullYear();
                    
                    return (
                      <button
                        key={day}
                        onClick={() => handleDateSelect(day)}
                        className={`h-10 w-10 rounded text-base transition-colors duration-300 ${
                          isSelected
                            ? 'bg-yellow-400 text-black font-semibold'
                            : isToday
                              ? isDarkMode
                                ? 'bg-gray-600 text-white font-semibold'
                                : 'bg-gray-200 text-gray-800 font-semibold'
                              : isDarkMode
                                ? 'text-gray-300 hover:bg-gray-700'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4 mt-4">
          {/* 왼쪽 화살표 버튼 */}
          {timeRange === "일" && (
            <button
              onMouseDown={() => startScrolling('left')}
              onMouseUp={stopScrolling}
              onMouseLeave={stopScrolling}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {/* 일 버튼 스크롤 영역 */}
          <div 
            ref={scrollContainerRef}
            className={`flex gap-2 overflow-x-auto scrollbar-hide flex-[9] min-w-0 cursor-grab active:cursor-grabbing`}
            onMouseDown={(e) => {
              setIsDragging(true);
              setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
              setScrollLeft(scrollContainerRef.current.scrollLeft);
            }}
            onMouseLeave={() => setIsDragging(false)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={(e) => {
              if (!isDragging) return;
              e.preventDefault();
              const x = e.pageX - scrollContainerRef.current.offsetLeft;
              const walk = (x - startX) * 2;
              scrollContainerRef.current.scrollLeft = scrollLeft - walk;
            }}
          >
            {/* 일 버튼들 */}
            {timeRange === "일" && Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const isSelected = selectedDay === day;
              
              return (
                <button
                  key={day}
                  onClick={(e) => {
                    if (!isDragging) {
                      setSelectedDay(day);
                    }
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`px-4 py-4 sm:px-4 sm:py-5 md:px-4 md:py-6 rounded-lg text-sm sm:text-base md:text-lg font-medium whitespace-nowrap transition-all select-none ${
                    isSelected
                      ? "text-black"
                      : isDarkMode 
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={isSelected ? { backgroundColor: '#FDCF1D' } : {}}
                >
                  {day}일
                </button>
              );
            })}
            
            {/* 월 버튼들 */}
            {timeRange === "월" && Array.from({ length: 12 }, (_, i) => {
              const month = i + 1;
              const isSelected = selectedMonth === month;
              
              return (
                <button
                  key={month}
                  onClick={(e) => {
                    if (!isDragging) {
                      setSelectedMonth(month);
                    }
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`px-4 py-4 sm:px-4 sm:py-5 md:px-4 md:py-6 rounded-lg text-sm sm:text-base md:text-lg font-medium whitespace-nowrap transition-all select-none ${
                    isSelected
                      ? "text-black"
                      : isDarkMode 
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={isSelected ? { backgroundColor: '#FDCF1D' } : {}}
                >
                  {month}월
                </button>
              );
            })}
            
            {/* 년 버튼들 */}
            {timeRange === "년" && Array.from({ length: 5 }, (_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              const isSelected = selectedYear === year;
              
              return (
                <button
                  key={year}
                  onClick={(e) => {
                    if (!isDragging) {
                      setSelectedYear(year);
                    }
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  className={`px-4 py-4 sm:px-4 sm:py-5 md:px-4 md:py-6 rounded-lg text-sm sm:text-base md:text-lg font-medium whitespace-nowrap transition-all select-none ${
                    isSelected
                      ? "text-black"
                      : isDarkMode 
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={isSelected ? { backgroundColor: '#FDCF1D' } : {}}
                >
                  {year}년
                </button>
              );
            })}
          </div>
          
          {/* 오른쪽 화살표 버튼 */}
          {timeRange === "일" && (
            <button
              onMouseDown={() => startScrolling('right')}
              onMouseUp={stopScrolling}
              onMouseLeave={stopScrolling}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
        
         <div className="h-[550px] min-h-[550px] w-full focus:outline-none" style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={550}>
            <ComposedChart data={processedData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }} barCategoryGap={0}>
              <defs>
                <linearGradient id="colorLineArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#61BC90" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#61BC90" stopOpacity={0.15}/>
                </linearGradient>
                <linearGradient id="colorDangerBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.15}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="transparent" opacity={0} vertical={false} />
              {/* 기준치 경계선 (60점) */}
              <Line
                type="monotone"
                dataKey={() => 60}
                stroke="#fca5a5"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                activeDot={false}
                connectNulls={false}
              />
              {/* 보통(주의) 경계선 (80점) */}
              <Line
                type="monotone"
                dataKey={() => 80}
                stroke="#fde68a"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                activeDot={false}
                connectNulls={false}
              />
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 15, fontWeight: 500 }}
                style={{ fontFamily: 'system-ui' }}
                interval={0}
                angle={0}
                textAnchor="middle"
                height={60}
              />
               <YAxis
                 domain={[0, 100]}
                 axisLine={false}
                 tickLine={false}
                 ticks={[0, 20, 40, 60, 80, 100]}
                 tick={<CustomYAxisTick />}
                label={{ 
                  value: "공기질 점수 (0~100)", 
                  angle: -90, 
                  position: "insideLeft",
                  style: { textAnchor: 'middle', fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 16, fontWeight: 600 }
                }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' }}
                allowEscapeViewBox={{ x: true, y: true }}
                wrapperStyle={{ zIndex: 1000 }}
              />
              {/* 꺾은선 그래프 영역 채우기 (가장 아래 레이어) */}
              <Area
                type="monotone"
                dataKey="airIndex"
                fill="url(#colorLineArea)"
                stroke="none"
                connectNulls={true}
              />
              {/* 꺾은선 그래프 */}
              <Line
                type="monotone"
                dataKey="airIndex"
                stroke="#61BC90"
                strokeWidth={3}
                dot={(props) => {
                  const { cx, cy, payload, index } = props;
                  if (payload.predictedVent) {
                    return (
                      <circle 
                        key={`dot-${index}`}
                        cx={cx} 
                        cy={cy} 
                        r={10} 
                        fill="#FDCF1D" 
                        stroke="#fff" 
                        strokeWidth={2}
                      />
                    );
                  }
                  return null;
                }}
                activeDot={(props) => {
                  const { cx, cy, payload, yAxis } = props;
                  const isBad = payload.airIndex <= 59;
                  // y축의 최대값(100)에 해당하는 y 좌표 찾기
                  const yAxisTop = yAxis?.y || 0;
                  const yAxisHeight = yAxis?.height || 550;
                  const chartBottom = yAxisTop + yAxisHeight;
                  
                  return (
                    <g>
                      {/* 세로 점선 (위에서 데이터 포인트까지) */}
                      <line
                        x1={cx}
                        y1={yAxisTop}
                        x2={cx}
                        y2={cy}
                        stroke={isBad ? '#ef4444' : '#61BC90'}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        opacity={0.5}
                      />
                      {/* 점 */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill={isBad ? '#ef4444' : '#61BC90'}
                        stroke="#fff"
                        strokeWidth={1}
                      />
                    </g>
                  );
                }}
                connectNulls={true}
              />
              {/* 59 이하 빨간색 막대 (위 레이어) */}
              <Bar dataKey="airIndex_bar" radius={[12, 12, 0, 0]} barCategoryGap={0}>
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.airIndex_bar !== null ? "url(#colorDangerBar)" : 'transparent'} />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 환기 예측 정확도 */}
      <div className={`rounded-2xl p-6 shadow-lg col-span-2 transition-colors duration-300 min-w-0 ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`} style={isDarkMode ? { 
        boxShadow: '0 0 6px 2px rgba(55, 65, 81, 0.4), 0 0 12px 4px rgba(55, 65, 81, 0.2), 0 0 18px 6px rgba(55, 65, 81, 0.1)',
        filter: 'blur(0.5px)'
      } : {}}>
        <h2 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>환기 예측 정확도</h2>
        <div className="flex flex-col items-center justify-center h-full">
          <CircularProgress percentage={data.accuracy} size={200} showIcon={false} customText="최근 7일" isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
    </>
  );
};

export default AirStatusChart;
