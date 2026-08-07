const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: '로그인이 필요합니다.',
  403: '권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  408: '요청 시간이 초과되었습니다.',
  413: '파일 용량이 너무 큽니다.',
  502: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
  503: '서버 점검 중이거나 일시적으로 사용할 수 없습니다.',
  504: '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.',
};

export const getErrorMessage = (error: any, defaultMessage: string = '오류가 발생했습니다.'): string => {
  const serverMessage = error?.response?.data?.message;
  if (serverMessage) return serverMessage;

  const status = error?.response?.status;
  if (status && STATUS_FALLBACK_MESSAGES[status]) {
    return STATUS_FALLBACK_MESSAGES[status];
  }

  if (error?.code === 'ECONNABORTED') {
    return '요청 시간이 초과되었습니다.';
  }
  if (!error?.response && error?.request) {
    return '네트워크 연결을 확인해주세요.';
  }

  return defaultMessage;
};
