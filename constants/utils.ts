/**
 * 객체의 키(key)를 값(value)으로 변환하는 유틸 함수
 * @param map - 변환할 매핑 객체
 * @param value - 찾을 값
 * @returns 매핑된 키 또는 원본 값
 * @example
 * const map = { A: 'a', B: 'b' };
 * getKeyByValue(map, 'a') // 'A'
 */
export const getKeyByValue = <T extends Record<string, string>>(
  map: T,
  value: string
): string => {
  const entry = Object.entries(map).find(([_, val]) => val === value);
  return entry ? entry[0] : value;
};

/**
 * 객체의 값(value)을 키(key)로 조회하는 유틸 함수
 * @param map - 조회할 매핑 객체
 * @param key - 찾을 키
 * @returns 매핑된 값 또는 원본 키
 * @example
 * const map = { A: 'a', B: 'b' };
 * getValueByKey(map, 'A') // 'a'
 */
export const getValueByKey = <T extends Record<string, string>>(
  map: T,
  key: string
): string => {
  return map[key as keyof T] || key;
};
