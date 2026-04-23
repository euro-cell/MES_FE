export const getErrorMessage = (error: any, defaultMessage: string = '오류가 발생했습니다.'): string => {
  return error?.response?.data?.message || defaultMessage;
};
