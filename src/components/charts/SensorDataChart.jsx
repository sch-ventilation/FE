import React, { useState, useRef, useEffect } from "react";
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Cell,
  Line,
  Area,
  ReferenceLine,
} from "recharts";
import { apiCall, API_CONFIG } from "../../config/api";

const SensorDataChart = ({ data, thresholds, isDarkMode }) => {
  const [graphData, setGraphData] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState("미세먼지");
  const [sliderStyle, setSliderStyle] = useState({ width: 0, left: 0 });
  const containerRef = useRef(null);
  const buttonRefs = useRef({});
  const [timeRange, setTimeRange] = useState("일");
  const [showCalendar, setShowCalendar] = useState(false);
  // 하드코딩된 날짜: 2025-09-29T23:29:00
  const hardcodedDate = new Date('2025-09-29T23:29:00');
  const [currentDate, setCurrentDate] = useState(hardcodedDate);
  const [selectedDay, setSelectedDay] = useState(hardcodedDate.getDate());
  const [selectedMonth, setSelectedMonth] = useState(hardcodedDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(hardcodedDate.getFullYear());
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 달력 관련 함수들
  const formatDate = (date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const handleDateSelect = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setCurrentDate(newDate);
    setSelectedDay(day);
    setSelectedMonth(newDate.getMonth() + 1);
    setSelectedYear(newDate.getFullYear());
    setShowCalendar(false);
    
    // 해당 날짜로 스크롤
    if (scrollContainerRef.current) {
      const buttonIndex = day - 1;
      const buttonWidth = 80; // 대략적인 버튼 너비
      const scrollPosition = buttonIndex * buttonWidth;
      scrollContainerRef.current.scrollLeft = scrollPosition;
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // 달력 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (event.target.closest('.calendar-container')) return;
      setShowCalendar(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 센서별 기준치 정의
  const sensorCriteria = {
    온도: { min: 18, max: 28, unit: "℃" },
    습도: { min: 30, max: 80, unit: "%" },
    이산화탄소: { max: 1000, unit: "ppm" },
    미세먼지: { max: 75, unit: "㎍/㎥" },
    초미세먼지: { max: 35, unit: "㎍/㎥" },
    휘발성유기화합물: { max: 400, unit: "㎍/㎥" },
  };

  // 센서 값이 안전한지 확인하는 함수
  const isSafeValue = (sensorName, value) => {
    const criteria = sensorCriteria[sensorName];
    if (!criteria) return true;

    if (criteria.min !== undefined && criteria.max !== undefined) {
      // 범위 체크 (온도, 습도)
      return value >= criteria.min && value <= criteria.max;
    } else if (criteria.max !== undefined) {
      // 최대값 체크 (CO₂, PM10, PM2.5, TVOC)
      return value <= criteria.max;
    }
    return true;
  };

  const sensors = [
    { name: "미세먼지", unit: "µg/㎡", color: "#FDCF1D" },
    { name: "초미세먼지", unit: "µg/㎡", color: "#8b5cf6" },
    { name: "이산화탄소", unit: "ppm", color: "#10b981" },
    { name: "온도", unit: "°C", color: "#f59e0b" },
    { name: "습도", unit: "%", color: "#06b6d4" },
    { name: "휘발성유기화합물", unit: "µg/㎡", color: "#ef4444" },
  ];

  // API에서 데이터 가져오기
  const fetchGraphData = async () => {
    try {
      const formattedDate = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
      const response = await apiCall(`${API_CONFIG.ENDPOINTS.TIMESERIES}?date=${formattedDate}`, {
        method: 'GET',
      });

      if (response.points && Array.isArray(response.points) && response.points.length > 0) {
        const sensorData = Array.from({ length: 24 }, (_, i) => {
          const hour = i;
          const timeStr = `${hour}시`;
          
          const apiData = response.points.find(point => {
            const date = new Date(point.timestamp);
            return date.getHours() === hour;
          });
          
          const processedData = {
            time: timeStr,
            미세먼지: apiData?.pm10 || null,
            초미세먼지: apiData?.pm25 || null,
            이산화탄소: apiData?.co2 || null,
            온도: apiData?.temperature || null,
            습도: apiData?.humidity || null,
            휘발성유기화합물: apiData?.tvoc || null,
            air_quality_index: apiData?.air_quality_index || null,
            status: apiData?.status || null,
          };

          // 각 센서별로 안정/위험 여부 표시
          sensors.forEach(sensor => {
            const value = processedData[sensor.name];
            const isSafe = value !== null ? isSafeValue(sensor.name, value) : true;
            processedData[`${sensor.name}_isSafe`] = isSafe;
          });

          return processedData;
        });
        
        setGraphData(sensorData);
      }
    } catch (error) {
      console.error('그래프 데이터 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, [selectedYear, selectedMonth, selectedDay]);

  // 현재 날짜 버튼으로 자동 스크롤
  useEffect(() => {
    setTimeout(() => {
      if (scrollContainerRef.current && timeRange === "일") {
        const buttonElement = scrollContainerRef.current.querySelector(`button:nth-child(${selectedDay})`);
        if (buttonElement) {
          buttonElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      }
    }, 300);
  }, [timeRange, selectedDay]);

  const sensorData = graphData;

  const currentSensor = sensors.find(s => s.name === selectedSensor);
  const dataKey = selectedSensor;

  // 위험 구간만 표시하기 위한 데이터 처리
  const chartData = sensorData.map(entry => ({
    ...entry,
    [`${dataKey}_bar`]: entry[`${dataKey}_isSafe`] ? null : entry[dataKey], // 안정 구간은 null로 설정
  }));

  // 막대 색상 결정 함수
  const getBarColor = (entry) => {
    return "url(#colorDanger)"; // 위험 구간만 표시하므로 항상 빨간색
  };

  // 슬라이더 위치 업데이트 함수
  const updateSliderPosition = () => {
    const selectedButton = buttonRefs.current[selectedSensor];
    const container = containerRef.current;
    
    if (selectedButton && container) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();
      
      setSliderStyle({
        width: buttonRect.width,
        left: buttonRect.left - containerRect.left
      });
    }
  };

  // selectedSensor가 변경될 때마다 슬라이더 위치 업데이트
  useEffect(() => {
    updateSliderPosition();
  }, [selectedSensor]);

  // 윈도우 리사이즈 시 슬라이더 위치 업데이트
  useEffect(() => {
    const handleResize = () => updateSliderPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedSensor]);

  // 스크롤 함수들
  const startScrolling = (direction) => {
    if (!scrollContainerRef.current) return;
    
    const scrollAmount = 200;
    const scrollInterval = setInterval(() => {
      if (scrollContainerRef.current) {
        if (direction === 'left') {
          scrollContainerRef.current.scrollLeft -= scrollAmount;
        } else {
          scrollContainerRef.current.scrollLeft += scrollAmount;
        }
      }
    }, 50);
    
    // 전역에 저장하여 stopScrolling에서 사용
    window.scrollInterval = scrollInterval;
  };

  const stopScrolling = () => {
    if (window.scrollInterval) {
      clearInterval(window.scrollInterval);
      window.scrollInterval = null;
    }
  };

  return (
    <div className={`rounded-2xl p-6 shadow-lg transition-colors duration-300 w-full min-w-0 ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`} style={isDarkMode ? { 
      boxShadow: '0 0 6px 2px rgba(55, 65, 81, 0.4), 0 0 12px 4px rgba(55, 65, 81, 0.2), 0 0 18px 6px rgba(55, 65, 81, 0.1)',
      filter: 'blur(0.5px)'
    } : {}}>
      <div className="flex items-center justify-between mb-8">
        <h2 className={`text-lg font-semibold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>세부 공기질 변화</h2>
        <div className="relative calendar-container flex-[1] flex justify-end">
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
            {formatDate(currentDate)}
          </button>
          {showCalendar && (
            <div className={`absolute right-0 mt-11 rounded-lg shadow-xl z-50 border ${
              isDarkMode ? 'bg-gray-800 border-gray-700 p-6' : 'bg-white border-gray-200 p-6'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={handlePrevMonth}
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-white hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h3>
                <button
                  onClick={handleNextMonth}
                  className={`p-2 rounded-lg transition-colors duration-300 ${
                    isDarkMode 
                      ? 'text-white hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                  <div key={day} className={`text-center text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, i) => (
                  <div key={`empty-${i}`} className="h-10"></div>
                ))}
                {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
                  const day = i + 1;
                  const isSelected = selectedDay === day && selectedMonth === currentDate.getMonth() + 1 && selectedYear === currentDate.getFullYear();
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors duration-300 ${
                        isSelected
                          ? 'bg-yellow-400 text-black'
                          : isDarkMode
                            ? 'text-white hover:bg-gray-700'
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
      
      {/* 센서 선택 버튼들 */}
      <div className="flex items-center gap-2 mb-8">
        <div className="relative" ref={containerRef}>
          <div className="flex gap-3">
            {sensors.map((sensor) => (
              <button
                key={sensor.name}
                ref={(el) => { buttonRefs.current[sensor.name] = el; }}
                onClick={() => setSelectedSensor(sensor.name)}
                className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-300 relative z-10 ${
                  selectedSensor === sensor.name
                    ? "text-black"
                    : isDarkMode
                      ? "text-gray-300 hover:text-white hover:bg-gray-700"
                      : "text-gray-700 hover:text-gray-800 hover:bg-gray-200"
                }`}
              >
                {sensor.name}
              </button>
            ))}
          </div>
          {/* 슬라이더 배경 */}
          <div
            className="absolute top-0 h-full bg-yellow-400 rounded-lg transition-all duration-300 ease-in-out"
            style={{
              width: `${sliderStyle.width}px`,
              left: `${sliderStyle.left}px`,
              zIndex: 0
            }}
          />
        </div>
      </div>
      
      {/* 시간 선택 버튼들 */}
      <div className="flex items-center gap-2 mb-8 mt-8">
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
        
        {/* 선택 버튼 스크롤 영역 */}
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
            const year = hardcodedDate.getFullYear() - 2 + i;
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
          <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }} barCategoryGap={0}>
            <defs>
              <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
              </linearGradient>
              <linearGradient id="colorDanger" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.15}/>
              </linearGradient>
              <linearGradient id="colorLineArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#61BC90" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#61BC90" stopOpacity={0.15}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="transparent" opacity={0} vertical={false} />
            {/* 기준치 경계선 */}
            {(() => {
              const criteria = sensorCriteria[selectedSensor];
              if (!criteria) return null;
              
              const lines = [];
              
              // 최대값 기준선 (CO₂, PM10, PM2.5, TVOC)
              if (criteria.max !== undefined) {
                lines.push(
                  <Line
                    key="max-threshold"
                    type="monotone"
                    dataKey={() => criteria.max}
                    stroke="#fca5a5"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={false}
                    activeDot={false}
                    connectNulls={false}
                  />
                );
                // 기준치 값 라벨 (빨간색, Y축 왼쪽)
                lines.push(
                  <ReferenceLine
                    key="max-threshold-label"
                    y={criteria.max}
                    stroke="transparent"
                    ifOverflow="extendDomain"
                    label={{ value: `${criteria.max}`, position: 'left', fill: '#ef4444', fontSize: 16, fontWeight: 700 }}
                  />
                );
              }
              
              // 범위 기준선 (온도, 습도)
              if (criteria.min !== undefined && criteria.max !== undefined) {
                lines.push(
                  <Line
                    key="min-threshold"
                    type="monotone"
                    dataKey={() => criteria.min}
                    stroke="#fde68a"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={false}
                    activeDot={false}
                    connectNulls={false}
                  />
                );
                lines.push(
                  <Line
                    key="max-threshold-range"
                    type="monotone"
                    dataKey={() => criteria.max}
                    stroke="#fde68a"
                    strokeWidth={2}
                    strokeDasharray="8 4"
                    dot={false}
                    activeDot={false}
                    connectNulls={false}
                  />
                );
              }
              
              return lines;
            })()}
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
              domain={['dataMin', 'dataMax']}
              axisLine={false}
              tickLine={false}
              tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 16, fontWeight: 500 }}
              tickFormatter={(value) => {
                const c = sensorCriteria[selectedSensor];
                // 단일 상한 기준(max)만 있는 센서에서, 기준치 값과 동일한 기본 y축 눈금은 숨김
                if (c && c.max !== undefined && c.min === undefined && Number(value) === Number(c.max)) {
                  return '';
                }
                return Math.round(value);
              }}
              label={{ 
                value: `${selectedSensor} (${currentSensor?.unit})`, 
                angle: -90, 
                position: "insideLeft",
                style: { textAnchor: 'middle', fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 16, fontWeight: 600 }
              }}
            />
            <Tooltip 
              wrapperStyle={{ zIndex: 9999 }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const value = data[selectedSensor];
                  const isExceeded = !data[`${selectedSensor}_isSafe`];
                  
                  // 초과 수치 계산
                  let deviation = 0;
                  let deviationText = '';
                  let arrowIcon = '';
                  
                  if (isExceeded) {
                    const criteria = sensorCriteria[selectedSensor];
                    if (criteria) {
                      if (criteria.min !== undefined && criteria.max !== undefined) {
                        // 온도, 습도: 범위 체크
                        if (selectedSensor === '온도') {
                          if (value < criteria.min) {
                            deviation = criteria.min - value;
                            deviationText = `${deviation.toFixed(1)}℃`;
                            arrowIcon = '↓';
                          } else if (value > criteria.max) {
                            deviation = value - criteria.max;
                            deviationText = `${deviation.toFixed(1)}℃`;
                            arrowIcon = '↑';
                          }
                        } else if (selectedSensor === '습도') {
                          if (value < criteria.min) {
                            deviation = criteria.min - value;
                            deviationText = `${deviation.toFixed(1)}%`;
                            arrowIcon = '↓';
                          } else if (value > criteria.max) {
                            deviation = value - criteria.max;
                            deviationText = `${deviation.toFixed(1)}%`;
                            arrowIcon = '↑';
                          }
                        }
                      } else if (criteria.max !== undefined) {
                        // CO2, PM10, PM25, TVOC: 최대값 체크
                        deviation = value - criteria.max;
                        deviationText = `${deviation.toFixed(1)} 초과`;
                        arrowIcon = '↑';
                      }
                    }
                  }
                  
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
                        zIndex: 10000
                      }}
                    >
                      <strong style={{ fontSize: 18, color: '#1f2937', marginBottom: 16, display: 'block' }}>{label}</strong>
                      
                      <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
                        <div style={{ fontSize: 16, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, color: '#6b7280' }}>{selectedSensor}:</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            {isExceeded && <span style={{ color: '#ef4444', fontSize: 18 }}>🚨</span>}
                            
                            {isExceeded && (
                              <span style={{ 
                                fontSize: 12, 
                                color: '#ef4444', 
                                fontWeight: 600,
                                backgroundColor: '#fef2f2',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                border: '1px solid #fecaca'
                              }}>
                                {arrowIcon} {deviationText}
                              </span>
                            )}

                            <span style={{ fontWeight: 500, color: '#1f2937' }}>
                              {value}{currentSensor?.unit}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ 
                        marginTop: 16, 
                        padding: 16, 
                        borderRadius: 12,
                        backgroundColor: isExceeded ? '#fef2f2' : '#f0fdf4',
                        border: `1px solid ${isExceeded ? '#fecaca' : '#bbf7d0'}`
                      }}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: '#1f2937', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>공기질 점수: <span style={{ color: '#1f2937' }}>{data.air_quality_index !== null && data.air_quality_index !== undefined ? data.air_quality_index : Math.round(value * 100 / (sensorCriteria[selectedSensor]?.max || 100))}</span></span>
                          {(() => {
                            if (data.status === null || data.status === undefined) {
                              return null;
                            }
                            const statusText = (data.status === 'good' ? '좋음' : data.status === 'moderate' ? '보통' : data.status === 'bad' ? '위험' : data.status);
                            const statusColor = (data.status === 'good' ? '#059669' : data.status === 'moderate' ? '#d97706' : data.status === 'bad' ? '#dc2626' : '#1f2937');
                            return (
                              <span style={{ fontSize: 16, fontWeight: 600, color: statusColor }}>
                                {statusText}
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              cursor={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const isExceeded = !data[`${selectedSensor}_isSafe`];
                  return {
                    stroke: isExceeded ? '#ef4444' : '#10b981',
                    strokeWidth: 2,
                    strokeDasharray: '5 5'
                  };
                }
                return { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5 5' };
              }}
            />
            {/* 꺾은선 그래프 영역 채우기 */}
            <Area
              type="monotone"
              dataKey={dataKey}
              fill="url(#colorLineArea)"
              stroke="none"
              connectNulls={true}
            />
            {/* 꺾은선 그래프 */}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#61BC90"
              strokeWidth={3}
              dot={false}
              activeDot={(props) => {
                const { cx, cy, payload, yAxis } = props;
                const isBad = !payload[`${dataKey}_isSafe`];
                // y축의 최대값에 해당하는 y 좌표 찾기
                const yAxisTop = yAxis?.y || 0;
                
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
            {/* 위험 구간만 빨간색 막대 (가장 위 레이어) */}
            <Bar dataKey={`${dataKey}_bar`} radius={[12, 12, 0, 0]} barCategoryGap={0}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry[`${dataKey}_bar`] !== null ? getBarColor(entry) : 'transparent'} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SensorDataChart;

