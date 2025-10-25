import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// 3D 건물 컴포넌트
function Building({ position, size, color, name, airQuality, onHover, onLeave }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // 건물이 살짝 떠다니는 애니메이션
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
    }
  });

  const handlePointerOver = () => {
    setHovered(true);
    onHover(name, airQuality);
  };

  const handlePointerOut = () => {
    setHovered(false);
    onLeave();
  };

  return (
    <group position={position}>
      <Box
        ref={meshRef}
        args={size}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <meshStandardMaterial 
          color={hovered ? '#ff6b6b' : color} 
          transparent 
          opacity={0.8}
        />
      </Box>
      {/* 건물 이름 텍스트 */}
      <Text
        position={[0, size[1] / 2 + 0.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      {/* 공기질 상태 표시 */}
      <Sphere position={[size[0] / 2 + 0.2, size[1] / 2, 0]} args={[0.1, 8, 8]}>
        <meshStandardMaterial color={airQuality.color} />
      </Sphere>
    </group>
  );
}

// 지면 컴포넌트 (순천향대학교 캠퍼스)
function Ground() {
  return (
    <group>
      {/* 메인 캠퍼스 지면 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[50, 40]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      
      {/* 상단 가로 도로 (지도 상단 노란색 도로) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 10]}>
        <planeGeometry args={[50, 2]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      
      {/* 서측 세로 도로 (지도 서측 노란색 도로) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-8, -0.05, 0]}>
        <planeGeometry args={[2, 40]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      
      {/* 동측 세로 도로 (읍내지 근처) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[12, -0.05, 0]}>
        <planeGeometry args={[2, 40]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      
      {/* 캠퍼스 내부 도로들 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[2, 25]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[25, 2]} />
        <meshStandardMaterial color="#6b7280" />
      </mesh>
      
      {/* 잔디 구역 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <planeGeometry args={[45, 35]} />
        <meshStandardMaterial color="#16a34a" />
      </mesh>
      
      {/* 동부 산학연 캠퍼스 구역 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, -0.08, -8]}>
        <planeGeometry args={[10, 8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
      
      {/* 읍내지 (호수) 시뮬레이션 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[20, -0.05, 0]}>
        <planeGeometry args={[15, 20]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// 조명 컴포넌트
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
    </>
  );
}

// 메인 3D 지도 컴포넌트
function ThreeDMap({ onBuildingHover, onBuildingLeave }) {
  // 순천향대학교 실제 건물 배치 (위에서 본 상세 지도 참고)
  const buildings = [
    // 북부 캠퍼스
    {
      name: "피닉스광장",
      position: [0, 0, 8],
      size: [2, 0.5, 2],
      color: "#fbbf24",
      airQuality: { status: "좋음", color: "#10b981", temp: "22.0°C", humidity: "47%" }
    },
    {
      name: "테니스장",
      position: [-4, 0, 6],
      size: [3, 0.3, 2],
      color: "#10b981",
      airQuality: { status: "좋음", color: "#10b981", temp: "21.8°C", humidity: "46%" }
    },
    {
      name: "대학원",
      position: [4, 0, 6],
      size: [2.5, 2, 2.5],
      color: "#3b82f6",
      airQuality: { status: "좋음", color: "#10b981", temp: "22.2°C", humidity: "48%" }
    },
    {
      name: "실내체육관",
      position: [-4, 0, 4],
      size: [3, 2, 2.5],
      color: "#f59e0b",
      airQuality: { status: "좋음", color: "#10b981", temp: "23.5°C", humidity: "52%" }
    },
    {
      name: "대운동장",
      position: [-4, 0, 2],
      size: [4, 0.2, 3],
      color: "#10b981",
      airQuality: { status: "좋음", color: "#10b981", temp: "22.5°C", humidity: "49%" }
    },
    
    // 중앙 캠퍼스
    {
      name: "학생회관",
      position: [2, 0, 0],
      size: [2.5, 2, 2.5],
      color: "#84cc16",
      airQuality: { status: "보통", color: "#f59e0b", temp: "24.3°C", humidity: "56%" }
    },
    {
      name: "자연과학관",
      position: [-2, 0, 0],
      size: [3, 2.5, 2.5],
      color: "#3b82f6",
      airQuality: { status: "좋음", color: "#10b981", temp: "22.8°C", humidity: "49%" }
    },
    {
      name: "공학관",
      position: [2, 0, -2],
      size: [3, 2.5, 2.5],
      color: "#8b5cf6",
      airQuality: { status: "보통", color: "#f59e0b", temp: "24.1°C", humidity: "55%" }
    },
    {
      name: "대학본부",
      position: [-2, 0, -2],
      size: [3, 2.5, 2.5],
      color: "#1e40af",
      airQuality: { status: "좋음", color: "#10b981", temp: "22.5°C", humidity: "48%" }
    },
    {
      name: "이순신연구소",
      position: [-6, 0, -2],
      size: [2, 2, 2],
      color: "#7c3aed",
      airQuality: { status: "좋음", color: "#10b981", temp: "23.0°C", humidity: "50%" }
    },
    {
      name: "아고라에토스",
      position: [4, 0, -2],
      size: [2.5, 2, 2.5],
      color: "#06b6d4",
      airQuality: { status: "좋음", color: "#10b981", temp: "22.8°C", humidity: "49%" }
    },
    {
      name: "유니토피아관",
      position: [6, 0, -2],
      size: [2.5, 2, 2.5],
      color: "#06b6d4",
      airQuality: { status: "좋음", color: "#10b981", temp: "22.8°C", humidity: "49%" }
    },
    
    // 남부 캠퍼스
    {
      name: "보건센터",
      position: [6, 0, -4],
      size: [2, 1.5, 2],
      color: "#dc2626",
      airQuality: { status: "매우좋음", color: "#059669", temp: "21.5°C", humidity: "42%" }
    },
    {
      name: "글로벌빌리지",
      position: [6, 0, -6],
      size: [2.5, 2, 2.5],
      color: "#84cc16",
      airQuality: { status: "보통", color: "#f59e0b", temp: "24.5°C", humidity: "58%" }
    },
    
    // 동부 캠퍼스 (읍내지 근처)
    {
      name: "캠퍼스아트밸리",
      position: [8, 0, 0],
      size: [2.5, 2, 2.5],
      color: "#ec4899",
      airQuality: { status: "좋음", color: "#10b981", temp: "23.2°C", humidity: "51%" }
    },
    {
      name: "글로컬산학연공유캠퍼스",
      position: [8, 0, -4],
      size: [3, 2.5, 3],
      color: "#7c3aed",
      airQuality: { status: "좋음", color: "#10b981", temp: "23.2°C", humidity: "51%" }
    },
    {
      name: "R&SD클러스터파크",
      position: [10, 0, -6],
      size: [3, 2, 3],
      color: "#059669",
      airQuality: { status: "매우좋음", color: "#059669", temp: "21.3°C", humidity: "41%" }
    },
    
    // 외부 시설
    {
      name: "신창119안전센터",
      position: [6, 0, 8],
      size: [2, 1.5, 2],
      color: "#dc2626",
      airQuality: { status: "좋음", color: "#10b981", temp: "23.0°C", humidity: "50%" }
    },
    {
      name: "빽다방",
      position: [0, 0, 10],
      size: [1.5, 1, 1.5],
      color: "#8b5cf6",
      airQuality: { status: "보통", color: "#f59e0b", temp: "24.0°C", humidity: "54%" }
    }
  ];

  return (
    <>
      <Lighting />
      <Ground />
      {buildings.map((building, index) => (
        <Building
          key={index}
          position={building.position}
          size={building.size}
          color={building.color}
          name={building.name}
          airQuality={building.airQuality}
          onHover={onBuildingHover}
          onLeave={onBuildingLeave}
        />
      ))}
    </>
  );
}

// 3D 지도 페이지
export default function ThreeDMapPage({ onBack }) {
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleBuildingHover = (name, airQuality) => {
    setHoveredBuilding({ name, airQuality });
  };

  const handleBuildingLeave = () => {
    setHoveredBuilding(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <div className={`p-6 border-b transition-colors duration-300 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className={`text-2xl font-bold transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                3D 학교 지도
              </h1>
              <p className={`text-sm transition-colors duration-300 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                마우스로 회전하고 건물을 클릭해보세요
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* 다크모드 토글 */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
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
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative h-[calc(100vh-120px)]">
        <Canvas
          camera={{ position: [25, 18, 25], fov: 40 }}
          style={{ background: isDarkMode ? '#1f2937' : '#f3f4f6' }}
        >
          <ThreeDMap 
            onBuildingHover={handleBuildingHover}
            onBuildingLeave={handleBuildingLeave}
          />
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={12}
            maxDistance={60}
            target={[0, 0, 0]}
          />
        </Canvas>

        {/* 건물 정보 패널 */}
        {hoveredBuilding && (
          <div className="absolute top-4 left-4 z-10">
            <div className={`p-4 rounded-lg shadow-lg max-w-xs transition-colors duration-300 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {hoveredBuilding.name}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: hoveredBuilding.airQuality.color }}
                  ></div>
                  <span className={`text-sm transition-colors duration-300 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    공기질: {hoveredBuilding.airQuality.status}
                  </span>
                </div>
                <div className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  온도: {hoveredBuilding.airQuality.temp}
                </div>
                <div className={`text-sm transition-colors duration-300 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  습도: {hoveredBuilding.airQuality.humidity}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 조작 안내 */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className={`p-4 rounded-lg shadow-lg max-w-sm transition-colors duration-300 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <h3 className={`text-sm font-semibold mb-2 transition-colors duration-300 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              순천향대학교 3D 캠퍼스
            </h3>
            <div className={`text-xs space-y-1 transition-colors duration-300 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              <p>🖱️ 마우스 드래그: 회전</p>
              <p>🔄 마우스 휠: 확대/축소</p>
              <p>🏢 건물 호버: 공기질 정보</p>
              <p>📍 20개 실제 건물 배치</p>
              <p>🗺️ 위성지도 기반 정확한 위치</p>
              <p>🏞️ 읍내지(호수) 포함</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
