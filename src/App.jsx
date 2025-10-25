import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ThreeDMapPage from "./ThreeDMap";
// API 연결 제거 - 하드코딩된 데이터만 사용

// 하드코딩된 데이터만 사용 (함수 제거)

export default function AirTimDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("환기 예측");
  const [viewMode, setViewMode] = useState("일");

  // 오늘 날짜 정보 가져오기
  const getTodayInfo = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    
    // 현재 월의 첫날과 오늘의 요일
    const firstDay = new Date(year, month - 1, 1);
    const firstDayOfWeek = firstDay.getDay();
    
    // 주차 계산 (1일이 속한 주를 1주차로)
    const week = Math.ceil((day + firstDayOfWeek) / 7);
    
    return { year, month, day, week };
  };

  // 현재 월 정보
  const getCurrentMonthInfo = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const lastDay = new Date(year, month, 0).getDate();
    return { year, month, lastDay };
  };

  const currentMonthInfo = getCurrentMonthInfo();

  const todayInfo = getTodayInfo();
  const [selectedDay, setSelectedDay] = useState(todayInfo.day);
  const [selectedMonth, setSelectedMonth] = useState(todayInfo.month);
  const [selectedWeek, setSelectedWeek] = useState(todayInfo.week);
  const [apiConnected, setApiConnected] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  useEffect(() => {
    console.log('useEffect 실행됨');
    console.log('현재 data 상태:', data);
    // 즉시 하드코딩된 데이터 설정
    const mockData = {
      roomName: "SCH 공학관 9209",
      recommendedTime: "9:00 오전",
      etaMinutes: 12,
      accuracy: 86,
      airQuality: "좋음",
      temperature: 23.7,
      humidity: 50,
      co2: { value: 34, status: "보통" },
      fineDust: { value: 34, status: "좋음" },
      ultrafineDust: { value: 34, status: "매우나쁨" },
      voc: { value: 34, status: "좋음" },
      conditionIndex: [
        { emoji: "😞", label: "나쁨", desc: "편두통", color: "red" },
        { emoji: "😊", label: "좋음", desc: "불쾌감", color: "green" },
        { emoji: "😐", label: "보통", desc: "집중력", color: "orange" },
        { emoji: "😊", label: "좋음", desc: "수면", color: "green" }
      ],
      series: [
        { time: "7 am", temperature: 2.0, humidity: 2.5 },
        { time: "8 am", temperature: 1.8, humidity: 2.3 },
        { time: "9 am", temperature: 1.5, humidity: 2.0 },
        { time: "10 am", temperature: 1.2, humidity: 1.8 },
        { time: "11 am", temperature: 1.0, humidity: 1.5 },
        { time: "12 pm", temperature: 0.8, humidity: 1.2 },
        { time: "1 pm", temperature: 0.9, humidity: 1.3 },
        { time: "2 pm", temperature: 1.5, humidity: 1.8 },
        { time: "3 pm", temperature: 3.8, humidity: 3.0 },
        { time: "4 pm", temperature: 3.5, humidity: 2.8 },
        { time: "5 pm", temperature: 3.0, humidity: 2.5 },
        { time: "6 pm", temperature: 2.8, humidity: 2.3 },
        { time: "7 pm", temperature: 2.5, humidity: 2.0 },
        { time: "8 pm", temperature: 2.3, humidity: 1.8 },
        { time: "9 pm", temperature: 2.2, humidity: 1.7 },
        { time: "10 pm", temperature: 2.5, humidity: 2.0 }
      ],
      updatedAt: new Date().toISOString(),
    };
    console.log('하드코딩 데이터:', mockData);
    console.log('시계열 데이터 개수:', mockData.series.length);
    console.log('데이터 설정 전 data 상태:', data);
    console.log('mockData.series 길이:', mockData.series.length);
    setData(mockData);
    setApiConnected(false);
    setLoading(false);
    console.log('데이터 설정 완료');
  }, []);

  // data state 변경 감지
  useEffect(() => {
    console.log('data state 변경됨:', data);
    if (data) {
      console.log('data.series 길이:', data.series?.length);
      console.log('data.series 내용:', data.series);
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-8" />
          <div className="grid grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <p>데이터 로딩 실패</p>
      </div>
    );
  }

  // 날짜 옵션 생성
  const getDateOptions = () => {
    if (viewMode === "일") {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const lastDay = new Date(year, month, 0).getDate();
      
      return Array.from({ length: lastDay }, (_, i) => {
        const day = i + 1;
        const date = new Date(year, month - 1, day);
        const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
        return {
          value: day,
          label: `${day}\n${weekdays[date.getDay()]}`
        };
      });
    } else if (viewMode === "주") {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1;
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0).getDate();
      const firstDayOfWeek = firstDay.getDay();
      const totalWeeks = Math.ceil((lastDay + firstDayOfWeek) / 7);
      
      return Array.from({ length: totalWeeks }, (_, i) => ({
        value: i + 1,
        label: `${i + 1}주차`
      }));
    } else {
      return Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: `${i + 1}월`
      }));
    }
  };

  const dateOptions = getDateOptions();

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    const todayInfo = getTodayInfo();
    switch(mode) {
      case "일":
        setSelectedDay(todayInfo.day);
        break;
      case "주":
        setSelectedWeek(todayInfo.week);
        break;
      case "월":
        setSelectedMonth(todayInfo.month);
        break;
    }
  };

  // 다크모드 토글
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 페이지 전환
  if (currentPage === "map") {
    return <ThreeDMapPage onBack={() => setCurrentPage("dashboard")} />;
  }

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between mb-8 transition-colors duration-300`}>
        <div>
          <div className="flex items-center gap-3">
            <h1 className={`text-3xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>AirTim</h1>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full cursor-pointer transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
            }`}>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{data.roomName}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            </div>
          </div>
        <div className="flex items-center gap-4">
          {/* 지도 버튼 */}
          <button
            onClick={() => setCurrentPage("map")}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">3D 지도</span>
          </div>
          </button>
          
          {/* 다크모드 토글 버튼 */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
            title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          {/* API 연결 상태 표시 */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            apiConnected 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-200 text-gray-600'
          }`}>
            {apiConnected ? '🟢 API 연결됨' : '🔴 하드코딩'}
          </div>
        </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className={`flex gap-8 mb-8 border-b transition-colors duration-300 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        {["환기 예측", "현재 상태", "통계"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-lg font-medium transition-all ${
              activeTab === tab
                ? isDarkMode 
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-blue-600 border-b-2 border-blue-600'
                : isDarkMode
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top Info Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className={`p-6 rounded-2xl transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-sm`}>
          <p className={`text-sm mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>추천 환기 시간</p>
          <p className={`text-3xl font-bold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{data.recommendedTime}</p>
          <p className={`text-sm mt-1 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>{data.etaMinutes}분 후</p>
        </div>

        <div className={`p-6 rounded-2xl transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-sm`}>
          <p className={`text-sm mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>예측 정확도</p>
          <p className={`text-3xl font-bold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{data.accuracy}%</p>
          <div className={`w-full h-2 rounded-full mt-3 transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <div 
              className="h-full rounded-full bg-blue-500" 
              style={{ width: `${data.accuracy}%` }}
            />
          </div>
        </div>

        <div className={`p-6 rounded-2xl transition-colors duration-300 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-sm`}>
          <p className={`text-sm mb-2 transition-colors duration-300 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>현재 공기질</p>
          <p className={`text-3xl font-bold transition-colors duration-300 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>{data.airQuality}</p>
          <div className="flex gap-2 mt-2">
            <span className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>온도 {data.temperature}°C</span>
            <span className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>습도 {data.humidity}%</span>
          </div>
        </div>
      </div>

      {/* Condition Index Section */}
      <div className={`p-6 rounded-2xl mb-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-sm`}>
        <h2 className={`text-xl font-bold mb-4 transition-colors duration-300 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>컨디션 지표</h2>
        <div className="grid grid-cols-4 gap-4">
          {data.conditionIndex.map((item, i) => (
            <div key={i} className={`text-center p-4 rounded-xl transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="text-4xl mb-2">{item.emoji}</div>
              <p className={`text-sm font-medium transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>{item.label}</p>
              <p className={`text-xs transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Current Air Quality Details */}
      <div className={`grid grid-cols-4 gap-4 mb-8`}>
        {[
          { label: "CO₂", value: data.co2.value, unit: "ppm", status: data.co2.status },
          { label: "미세먼지", value: data.fineDust.value, unit: "㎍/㎥", status: data.fineDust.status },
          { label: "초미세먼지", value: data.ultrafineDust.value, unit: "㎍/㎥", status: data.ultrafineDust.status },
          { label: "VOC", value: data.voc.value, unit: "ppm", status: data.voc.status }
        ].map((item, i) => (
          <div key={i} className={`p-4 rounded-xl transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-sm`}>
            <p className={`text-sm mb-1 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>{item.label}</p>
            <p className={`text-2xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>{item.value}</p>
            <p className={`text-xs transition-colors duration-300 ${
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            }`}>{item.unit} · {item.status}</p>
          </div>
        ))}
      </div>

      {/* Statistics Section */}
      <div className={`p-6 rounded-2xl transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-sm`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={`text-xl font-bold transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>공기질 상태 변화</h2>
            <p className={`text-sm transition-colors duration-300 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {currentMonthInfo.year}년 {currentMonthInfo.month}월 {todayInfo.day}일  
              {viewMode === "주" ? ` · ${todayInfo.week}주차` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            {["일", "주", "월"].map((mode) => (
              <button
                key={mode}
                onClick={() => handleViewModeChange(mode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === mode
                    ? isDarkMode
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-500 text-white'
                    : isDarkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Date Selector */}
        <div className="mb-6 overflow-x-auto scrollbar-hide" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
          <div className="flex gap-3 pb-2">
            {dateOptions.map((option) => {
              const isSelected = 
                (viewMode === "일" && selectedDay === option.value) ||
                (viewMode === "주" && selectedWeek === option.value) ||
                (viewMode === "월" && selectedMonth === option.value);
              
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    if (viewMode === "일") setSelectedDay(option.value);
                    else if (viewMode === "주") setSelectedWeek(option.value);
                    else setSelectedMonth(option.value);
                  }}
                  className={`w-20 h-20 rounded-xl text-sm font-medium whitespace-pre-line transition-all ${
                    isSelected
                      ? 'bg-blue-500 text-white shadow-lg'
                      : isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px]">
          {data?.series?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.series}
                margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              >
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                dy={10}
                interval={0}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                domain={[0, 4]}
                ticks={[0, 1, 2, 3, 4]}
                tickFormatter={(value) => `${value}h`}
                dx={-10}
                allowDecimals={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                domain={[0, 4]}
                ticks={[0, 1, 2, 3, 4]}
                tickFormatter={(value) => `${value}h`}
                dx={10}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
                labelStyle={{ color: "#374151", fontWeight: 600, fontSize: 14 }}
                formatter={(value, name) => [
                  `${value}h`,
                  name === "온도" ? "온도" : "습도"
                ]}
                labelFormatter={(label) => `시간: ${label}`}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="temperature"
                stroke="#8b5cf6"
                strokeWidth={2}
                fill="url(#colorTemp)"
                name="온도"
                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="humidity"
                stroke="#eab308"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "#eab308", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#eab308", strokeWidth: 2 }}
                name="습도"
              />
            </AreaChart>
          </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
              <div className="text-center">
                <p className="text-gray-600 mb-2">데이터 로딩 중...</p>
                <p className="text-sm text-gray-500">시계열 데이터: {data?.series?.length || 0}개</p>
                <p className="text-xs text-gray-400 mt-2">data 상태: {data ? '존재함' : 'null'}</p>
                <p className="text-xs text-gray-400">series 존재: {data?.series ? '예' : '아니오'}</p>
                <pre className="text-xs text-left bg-white p-2 rounded mt-2 max-h-32 overflow-auto">
                  {JSON.stringify(data?.series?.slice(0, 2), null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}