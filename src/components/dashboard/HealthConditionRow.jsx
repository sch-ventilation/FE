import React from "react";

const HealthConditionRow = ({ data, isDarkMode }) => {
  return (
    <div className="mb-6">
      <div className={`rounded-2xl p-4 shadow-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`} style={isDarkMode ? { 
        boxShadow: '0 0 6px 2px rgba(55, 65, 81, 0.4), 0 0 12px 4px rgba(55, 65, 81, 0.2), 0 0 18px 6px rgba(55, 65, 81, 0.1)',
        filter: 'blur(0.5px)'
      } : {}}>
        <h2 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>건강 컨디션</h2>
        <div className="grid grid-cols-5 gap-4">
          {data.conditionIndex.map((item, i) => (
            <div key={i} className={`rounded-xl p-4 text-center transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.desc}</p>
              <div className="text-4xl mb-2">{item.emoji}</div>
              <p className={`text-base font-medium ${
                item.color === "red" ? "text-red-600" :
                item.color === "yellow" ? "text-yellow-600" : ""
              }`} style={item.color === "green" ? { color: '#61BC90' } : {}}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthConditionRow;

