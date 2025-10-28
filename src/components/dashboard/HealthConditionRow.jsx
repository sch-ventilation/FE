import React from "react";

const HealthConditionRow = ({ data, isDarkMode, emotionData }) => {
  // API 데이터로 건강 컨디션 매핑
  const getEmojiAndColor = (value) => {
    if (value === '정상' || value === '좋음') {
      return { emoji: '😊', color: '#61BC90' };
    } else if (value === '보통') {
      return { emoji: '😐', color: '#f59e0b' };
    } else if (value === '나쁨' || value === '부적합') {
      return { emoji: '😟', color: '#ef4444' };
    }
    return { emoji: '😐', color: '#6b7280' };
  };

  const healthConditions = emotionData ? [
    { desc: '쾌적도', value: emotionData.discomfort, label: emotionData.discomfort },
    { desc: '두통', value: emotionData.headache, label: emotionData.headache },
    { desc: '집중도', value: emotionData.focus, label: emotionData.focus },
    { desc: '수면', value: emotionData.sleep, label: emotionData.sleep }
  ] : [];

  return (
    <div className="mb-6">
      <div className={`rounded-2xl p-4 shadow-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`} style={isDarkMode ? { 
        boxShadow: '0 0 6px 2px rgba(55, 65, 81, 0.4), 0 0 12px 4px rgba(55, 65, 81, 0.2), 0 0 18px 6px rgba(55, 65, 81, 0.1)',
        filter: 'blur(0.5px)'
      } : {}}>
        <h2 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>건강 컨디션</h2>
        <div className="grid grid-cols-4 gap-4">
          {healthConditions.map((item, i) => {
            const { emoji, color } = getEmojiAndColor(item.value);
            return (
              <div key={i} className={`rounded-xl p-4 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
                <div className="text-4xl mb-2">{emoji}</div>
                <p className="text-base font-medium" style={{ color }}>
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

