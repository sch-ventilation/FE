import React, { useRef, useEffect, useState } from "react";

const Sidebar = ({ menuPage, setMenuPage, isDarkMode, isHeaderVisible }) => {
  const containerRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({ width: 0, left: 0, top: 0 });
  const buttonRefs = useRef({});

  const menuItems = [
    { key: "home", label: "홈", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { key: "prediction", label: "환기 예측", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
    { key: "sensor", label: "세부 공기질", icon: "M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" }
  ];

  useEffect(() => {
    const updateSlider = () => {
      const activeButton = buttonRefs.current[menuPage];
      if (activeButton && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        
        setSliderStyle({
          width: buttonRect.width,
          left: buttonRect.left - containerRect.left,
          top: buttonRect.top - containerRect.top
        });
      }
    };

    // DOM이 완전히 렌더링된 후 실행
    const timeoutId = setTimeout(updateSlider, 50);
    window.addEventListener('resize', updateSlider);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateSlider);
    };
  }, [menuPage]);

  return (
    <div className={`rounded-2xl p-4 sticky top-6 shadow-sm transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-800'} w-45 h-48`}>
      <div ref={containerRef} className="relative flex flex-col gap-2">
        {/* 슬라이더 배경 */}
        <div 
          className={`absolute rounded-lg transition-all duration-300 ${
            isDarkMode ? 'bg-gray-600' : 'bg-gray-600'
          }`}
          style={{
            width: `${sliderStyle.width}px`,
            height: '48px',
            left: `${sliderStyle.left}px`,
            top: `${sliderStyle.top}px`
          }}
        />
        
        {menuItems.map((item) => (
          <button
            key={item.key}
            ref={(el) => { buttonRefs.current[item.key] = el; }}
            onClick={() => setMenuPage(item.key)}
            className={`relative z-10 flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 w-full h-12 ${
              menuPage === item.key
                ? "text-white"
                : isDarkMode
                  ? "text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
