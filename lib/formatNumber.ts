export const formatNumber = (value: number | string): string => {
    const num = typeof value === 'string' ? parseInt(value.replace(/\s+/g, '')) : value;
    
    return new Intl.NumberFormat('ru-RU').format(num);
  }; 