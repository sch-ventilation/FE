import React from 'react';

// 3D 지도 페이지 (현재 비활성화)
export default function ThreeDMapPage({ onBack }) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">3D 학교 지도</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
        >
          뒤로 가기
        </button>
      </div>
      <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-gray-100 rounded-lg">
        <p className="text-gray-500">3D 지도 기능은 추후 구현 예정입니다.</p>
      </div>
    </div>
  );
}
