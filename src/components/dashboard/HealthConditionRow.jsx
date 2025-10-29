import React from "react";

const HealthConditionRow = ({ data, isDarkMode, emotionData }) => {
  // grade_kr 기반 이모지/색상 매핑
  const getEmojiAndColor = (gradeKr) => {
    const normalized = (gradeKr || '').replace(/\s+/g, ' ').trim();
    switch (normalized) {
      case '매우 좋음':
        return { emoji: '😄', color: '#008F4A' }; // 진한 초록
      case '좋음':
        return { emoji: '🙂', color: '#008F4A' }; // 밝은 초록
      case '보통':
        return { emoji: '😐', color: '#FACC15' }; // 노랑
      case '나쁨':
        return { emoji: '😕', color: '#EF4444' }; // 주황
      case '매우 나쁨':
        return { emoji: '😞', color: '#EF4444' }; // 빨강
      default:
        return { emoji: '', color: '#9CA3AF' }; // 회색 (알 수 없음)
    }
  };

  // cognition은 표시하지 않음. grade_kr만 사용
  const healthConditions = emotionData ? [
    { desc: '쾌적도', value: emotionData?.discomfort?.grade_kr, label: emotionData?.discomfort?.grade_kr },
    { desc: '작업 정확도', value: emotionData?.task_accuracy?.grade_kr, label: emotionData?.task_accuracy?.grade_kr },
    { desc: '작업 속도', value: emotionData?.task_speed_penalty?.grade_kr, label: emotionData?.task_speed_penalty?.grade_kr },
    { desc: '집중도', value: emotionData?.attention?.grade_kr, label: emotionData?.attention?.grade_kr },
    { desc: '피로', value: emotionData?.fatigue?.grade_kr, label: emotionData?.fatigue?.grade_kr },
  ] : [];

  return (
    <div className="mb-6">
      <div className={`rounded-2xl p-4 shadow-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`} style={isDarkMode ? { 
        boxShadow: '0 0 6px 2px rgba(55, 65, 81, 0.4), 0 0 12px 4px rgba(55, 65, 81, 0.2), 0 0 18px 6px rgba(55, 65, 81, 0.1)',
        filter: 'blur(0.5px)'
      } : {}}>
        <h2 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>건강 컨디션</h2>
        <div className="grid grid-cols-5 gap-5">
          {healthConditions.map((item, i) => {
            const { emoji, color } = getEmojiAndColor(item.value);
            return (
              <div key={i} className={`rounded-xl p-5 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-base md:text-lg font-bold mb-3 transition-colors duration-300 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{item.desc}</p>
                <div className="text-5xl mb-4">{emoji}</div>
                <p className="text-lg font-bold mt-1" style={{ color }}>
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HealthConditionRow;

