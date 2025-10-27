import React, { useEffect, useState } from "react";
import ThreeDMapPage from "./ThreeDMap";
import Header from "./components/common/Header";
import Sidebar from "./components/common/Sidebar";
import TopRowCards from "./components/dashboard/TopRowCards";
import HealthConditionRow from "./components/dashboard/HealthConditionRow";
import AirStatusChart from "./components/charts/AirStatusChart";
import SensorDataChart from "./components/charts/SensorDataChart";

export default function AirHOSDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [menuPage, setMenuPage] = useState("home");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);

  useEffect(() => {
    const mockData = {
      roomName: "SCH 공학관 9209",
      recommendedTime: "9:00 오전",
      etaMinutes: 12,
      accuracy: 86,
      temperature: 23.7,
      humidity: 50,
      co2: { value: 34, status: "보통", unit: "ppm" },
      fineDust: { value: 34, status: "좋음", unit: "µg/㎡" },
      ultrafineDust: { value: 34, status: "매우나쁨", unit: "µg/㎡" },
      voc: { value: 34, status: "좋음", unit: "µg/㎡" },
      conditionIndex: [
        { emoji: "😊", label: "좋음", desc: "불쾌감", color: "green" },
        { emoji: "😐", label: "보통", desc: "집중도", color: "yellow" },
        { emoji: "😞", label: "나쁨", desc: "작업수행", color: "red" },
        { emoji: "😊", label: "좋음", desc: "인지기능", color: "green" },
        { emoji: "😞", label: "나쁨", desc: "피로", color: "red" }
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
    };
    setData(mockData);
    setLoading(false);
  }, []);


  // 스크롤 감지로 헤더 표시 여부 확인
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // 헤더는 스크롤할 때 숨김
      setIsHeaderVisible(scrollTop === 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 페이지 전환
  if (currentPage === "map") {
    return <ThreeDMapPage onBack={() => setCurrentPage("dashboard")} />;
  }

  if (loading || !data) {
    return <div className="min-h-screen bg-gray-100 p-6">로딩 중...</div>;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-black' : 'bg-gray-100'} p-6`}>
      <Header data={data} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      
      {/* Main Content with Sidebar */}
      <div className="flex gap-6 w-full min-w-0">
        <Sidebar 
          menuPage={menuPage} 
          setMenuPage={setMenuPage} 
          isDarkMode={isDarkMode} 
          isHeaderVisible={isHeaderVisible} 
        />
        
        {/* Right Content */}
        <div className="flex-1 min-w-0 w-full">
          {menuPage === "home" && (
            <>
              <TopRowCards data={data} isDarkMode={isDarkMode} />
              <HealthConditionRow data={data} isDarkMode={isDarkMode} />
            </>
          )}

          {menuPage === "prediction" && (
            <div>
              <AirStatusChart data={data} isDarkMode={isDarkMode} />
              {/* 환기 예측 정확도 원그래프는 추후 추가 예정 */}
            </div>
          )}

          {menuPage === "sensor" && (
            <div>
              <SensorDataChart data={data} isDarkMode={isDarkMode} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
