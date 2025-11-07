import { ValidatorData, mockValidators } from './mocks/validators';
import { useMemo } from 'react';

interface SortConfig {
  key: keyof ValidatorData | null;
  direction: 'asc' | 'desc';
}

export const useValidatorData = (
  search: string,
  sortConfig: SortConfig,
  currentPage: number,
  rowsPerPage: number
) => {
  const processedData = useMemo(() => {
    let result = search
      ? mockValidators.filter((validator) =>
          Object.values(validator)
            .map((value) => String(value).toLowerCase())
            .some((value) => value.includes(search.toLowerCase().trim()))
        )
      : mockValidators;

    result.sort((a, b) => {
      if (!sortConfig.key) return 0;

      if (sortConfig.key === 'name') {
        return sortConfig.direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }

      const aNum = parseInt(
        String(a[sortConfig.key]).replace(/[^\d]/g, ''),
        10
      );
      const bNum = parseInt(
        String(b[sortConfig.key]).replace(/[^\d]/g, ''),
        10
      );
      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
    });

    return result;
  }, [search, sortConfig]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = processedData.slice(
    startIndex,
    startIndex + rowsPerPage
  );
  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  return {
    paginatedData,
    totalPages,
    totalItems: processedData.length,
  };
};
