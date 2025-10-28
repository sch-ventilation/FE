import React, { useEffect, useState } from "react";
import ThreeDMapPage from "./ThreeDMap";
import Header from "./components/common/Header";
import Sidebar from "./components/common/Sidebar";
import TopRowCards from "./components/dashboard/TopRowCards";
import HealthConditionRow from "./components/dashboard/HealthConditionRow";
import AirStatusChart from "./components/charts/AirStatusChart";
import SensorDataChart from "./components/charts/SensorDataChart";
import { apiCall, API_CONFIG } from "./config/api";

export default function AirHOSDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [menuPage, setMenuPage] = useState("home");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [sensorStatus, setSensorStatus] = useState(null);
  const [thresholds, setThresholds] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [predictionData, setPredictionData] = useState(null);
  const [emotionData, setEmotionData] = useState(null);
  const [accuracyData, setAccuracyData] = useState(null);

  // 하드코딩된 대시보드 데이터 (API 제거됨)
  const getHardcodedData = () => {
    return {
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
      series: [],
    };
  };

  // 센서 상태 데이터 가져오기
  const fetchSensorStatus = async () => {
    try {
      console.log('센서 상태 API 호출 중...');
      const statusData = await apiCall(API_CONFIG.ENDPOINTS.CURRENT_STATUS, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      setSensorStatus(statusData);
    } catch (error) {
      console.error('센서 상태 데이터 가져오기 실패:', error);
      // 에러 시 null로 설정
      setSensorStatus(null);
    }
  };

  // 기준치와 현재시간 데이터 가져오기
  const fetchMultiData = async () => {
    try {
      console.log('기준치 및 현재시간 API 호출 중...');
      const multiData = await apiCall(API_CONFIG.ENDPOINTS.MULTI, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      // 기준치 설정 (API에서 받은 값 사용)
      const thresholdsData = {
        co2: multiData.thresholds?.co2 || 1000,
        pm10: multiData.thresholds?.pm10 || 50,
        pm25: multiData.thresholds?.pm25 || 35,
        tvoc: multiData.thresholds?.tvoc || 300,
        temperature: { min: 18, max: 28 }, // 온도/습도는 기본값 유지
        humidity: { min: 30, max: 80 }     // 온도/습도는 기본값 유지
      };
      
      setThresholds(thresholdsData);
      setCurrentTime('2025-09-29T23:29:00');
      
      // 예측 데이터 저장
      setPredictionData({
        pred_30min: multiData.pred_30min || null,
        status_by_metric: multiData.status_by_metric || null,
        vent_time_estimate: multiData.vent_time_estimate || null,
        advice: multiData.advice || null,
        aqi_score: multiData.aqi_score || null
      });
      
      console.log('API에서 받은 thresholds:', multiData.thresholds);
      console.log('최종 기준치 설정:', thresholdsData);
      console.log('현재시간 (하드코딩):', '2025-09-29T23:29:00');
      console.log('예측 데이터:', multiData.pred_30min);
    } catch (error) {
      console.error('기준치 및 현재시간 데이터 가져오기 실패:', error);
      // 에러 시 기본값 설정 (API 기본값과 일치)
      setThresholds({
        co2: 1000,
        pm10: 50,
        pm25: 35,
        tvoc: 300,
        temperature: { min: 18, max: 28 },
        humidity: { min: 30, max: 80 }
      });
      setCurrentTime('2025-09-29T23:29:00');
      setPredictionData({
        pred_30min: null,
        status_by_metric: null,
        vent_time_estimate: null,
        advice: null,
        aqi_score: null
      });
    }
  };

  // emotion 데이터 가져오기
  const fetchEmotionData = async () => {
    try {
      console.log('건강 컨디션 API 호출 중...');
      const emotionStatusData = await apiCall('/status/emotion', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      setEmotionData(emotionStatusData);
    } catch (error) {
      console.error('건강 컨디션 데이터 가져오기 실패:', error);
      setEmotionData(null);
    }
  };

  // accuracy 데이터 가져오기
  const fetchAccuracyData = async () => {
    try {
      console.log('예측 정확도 API 호출 중...');
      const accuracyStatusData = await apiCall('/predict/accuracy', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      setAccuracyData(accuracyStatusData);
    } catch (error) {
      console.error('예측 정확도 데이터 가져오기 실패:', error);
      setAccuracyData(null);
    }
  };

  useEffect(() => {
    // 하드코딩된 데이터 설정
    setData(getHardcodedData());
    
    // API 호출들
    const loadData = async () => {
      await Promise.all([
        fetchSensorStatus(),
        fetchMultiData(),
        fetchEmotionData(),
        fetchAccuracyData()
      ]);
      setLoading(false);
    };
    
    loadData();
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
      <Header 
        data={data} 
        isDarkMode={isDarkMode} 
        setIsDarkMode={setIsDarkMode} 
        onRefresh={() => {
          // 하드코딩된 데이터 새로고침
          setData(getHardcodedData());
          // API 호출들
          fetchSensorStatus();
          fetchMultiData();
        }} 
      />
      
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
              <TopRowCards data={data} sensorStatus={sensorStatus} thresholds={thresholds} isDarkMode={isDarkMode} predictionData={predictionData} />
              <HealthConditionRow data={data} isDarkMode={isDarkMode} emotionData={emotionData} />
            </>
          )}

          {menuPage === "prediction" && (
            <div>
              <AirStatusChart data={data} thresholds={thresholds} currentTime={currentTime} isDarkMode={isDarkMode} predictionData={predictionData} accuracyData={accuracyData} />
              {/* 환기 예측 정확도 원그래프는 추후 추가 예정 */}
            </div>
          )}

          {menuPage === "sensor" && (
            <div>
              <SensorDataChart data={data} thresholds={thresholds} isDarkMode={isDarkMode} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
