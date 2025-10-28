// API 설정 파일
export const API_CONFIG = {
  BASE_URL: 'https://airhos.onrender.com',
  ENDPOINTS: {
    CURRENT_STATUS: '/status/current',
    TIMESERIES: '/status/timeseries',
    MULTI: '/predict/multi',
  },
  TIMEOUT: 10000, // 10초
  RETRY_ATTEMPTS: 3,
};

// API 호출 헬퍼 함수
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: API_CONFIG.TIMEOUT,
  };

  const config = { ...defaultOptions, ...options };

  try {
    console.log(`API 호출 URL: ${url}`);
    const response = await fetch(url, config);
    
    console.log(`API 응답 상태: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API 응답 데이터:', data);
    return data;
  } catch (error) {
    console.error('API 호출 오류:', error);
    throw error;
  }
};
