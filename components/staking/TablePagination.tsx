import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  rowsPerPage: number;
  pageNumbers: number[];
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (value: string) => void;
  pageSizeOptions?: readonly number[];
}

export const TablePagination = ({
  currentPage,
  totalPages,
  totalItems,
  rowsPerPage,
  pageNumbers,
  onPageChange,
  onRowsPerPageChange,
  pageSizeOptions = [5, 10, 20, 50, 100],
}: TablePaginationProps) => (
  <div className='flex lg:flex-row flex-col md:h-10 items-center justify-between mt-4 lg:gap-0 gap-4'>
    <div className='lg:w-[200px] gap-1 w-full flex items-center justify-between'>
      <div className='w-[200px] text-somnia-color-text-primary-02 text-base'>
        Showing {(currentPage - 1) * rowsPerPage + 1}-
        {Math.min(currentPage * rowsPerPage, totalItems)} out of {totalItems}
      </div>
      <div className='lg:hidden flex items-center gap-2 w-[200px] justify-end'>
        <span className='text-somnia-color-text-primary-02 text-base'>
          Show rows
        </span>
        <Select
          value={rowsPerPage.toString()}
          onValueChange={onRowsPerPageChange}
        >
          <SelectTrigger className='w-[60px] font-semibold bg-somnia-color-background-primary-02 px-3 border-3'>
            <SelectValue />
            <SelectIcon
              color='invert(0%)'
              width={10}
              height={5}
              imageClassName='w-[10px] h-[5px]'
            />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((value) => (
              <SelectItem key={value} value={value.toString()}>
                <SelectPrimitive.ItemText>{value}</SelectPrimitive.ItemText>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            className='h-10 w-10 p-0'
            icon={<ChevronLeft className='h-5 w-5' />}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
          />
        </PaginationItem>

        {pageNumbers.map((number) => (
          <PaginationItem key={number}>
            {number === -1 ? (
              <PaginationEllipsis className='h-10 w-10 p-0' />
            ) : (
              <PaginationLink
                className={`h-10 w-10 p-0 ${
                  currentPage === number
                    ? 'bg-somnia-color-background-accent-03 text-somnia-color-text-fixed-primary-01'
                    : 'text-somnia-color-text-primary-02'
                }`}
                isActive={currentPage === number}
                onClick={() => onPageChange(number)}
              >
                {number}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            className='h-10 w-10 p-0'
            icon={<ChevronRight className='h-5 w-5' />}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>

    <div className='hidden lg:flex items-center gap-2 w-[300px] justify-end'>
      <span className='text-somnia-color-text-primary-02 text-base'>
        Show rows
      </span>
      <Select
        value={rowsPerPage.toString()}
        onValueChange={onRowsPerPageChange}
      >
        <SelectTrigger className='w-[60px] font-semibold bg-somnia-color-background-primary-02 px-3 border-3'>
          <SelectValue />
          <SelectIcon
            color='invert(0%)'
            width={10}
            height={5}
            imageClassName='w-[10px] h-[5px]'
          />
        </SelectTrigger>
        <SelectContent>
          {pageSizeOptions.map((value) => (
            <SelectItem key={value} value={value.toString()}>
              <SelectPrimitive.ItemText>{value}</SelectPrimitive.ItemText>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);
