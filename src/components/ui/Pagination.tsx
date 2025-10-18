// src/components/ui/Pagination.tsx
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 hover:text-indigo-600"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>
      
      {pageNumbers.map(number => (
        <button
          key={number}
          onClick={() => onPageChange(number)}
          className={`w-8 h-8 rounded-md flex items-center justify-center ${
            currentPage === number 
              ? "bg-indigo-600 text-white" 
              : "text-gray-500 hover:bg-gray-100"
          }`}
        >
          {number}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-gray-500 hover:text-indigo-600"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}