import React from "react";

const CircularProgress = ({ percentage, size = 180, showIcon = true, customText = null, isDarkMode = false, customColor = null }) => {
  // strokeWidth를 사이즈에 비례하여 계산 (기준: size 220일 때 strokeWidth 35)
  const strokeWidth = Math.round(35 * (size / 220));
  const radius = (size - strokeWidth * 1.2) / 2; // strokeWidth에 맞춰 여유 공간 계산
  const centerX = size / 2;
  const centerY = size / 2;
  
  // 호(arc)를 그리기 위한 각도 계산 (65% 정도의 호, 구멍은 아래쪽에)
  const arcLength = 234; // 약 65% (360의 65% = 234도)
  const startAngle = 154; // 아래쪽 구멍을 위해 126도에서 시작
  const circumference = (arcLength / 360) * 2 * Math.PI * radius;
  
  // 진행 표시를 위한 offset 계산
  const offset = circumference - (percentage / 100) * circumference;
  
  // SVG path를 사용하여 호 그리기
  const createArcPath = (startAngle, endAngle) => {
    const start = startAngle * Math.PI / 180;
    const end = endAngle * Math.PI / 180;
    const x1 = centerX + radius * Math.cos(start);
    const y1 = centerY + radius * Math.sin(start);
    const x2 = centerX + radius * Math.cos(end);
    const y2 = centerY + radius * Math.sin(end);
    const largeArcFlag = arcLength > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} style={{ overflow: 'visible' }}>
        {/* 배경 호 (회색) */}
        <path
          d={createArcPath(startAngle, startAngle + arcLength)}
          stroke={isDarkMode ? "#374151" : "#e5e7eb"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        {/* 진행 호 */}
        <path
          d={createArcPath(startAngle, startAngle + arcLength)}
          stroke={customColor || "#61BC90"}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ marginTop: '-10px' }}>
        {showIcon ? (
          <svg className="w-6 h-6 mb-1" fill={customColor || "#61BC90"} viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : customText ? (
          <p className={`text-xs mb-1 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{customText}</p>
        ) : null}
        <span className={`text-4xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{percentage}</span>
      </div>
    </div>
  );
};

export default CircularProgress;

