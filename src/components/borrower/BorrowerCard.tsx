// src/components/borrower/BorrowerCard.tsx
import { type BorrowerResponse } from "../../schemas/borrower.schema";

interface BorrowerCardProps {
  borrower: BorrowerResponse;
  onClick: () => void;
}

export function BorrowerCard({ borrower, onClick }: BorrowerCardProps) {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer border border-gray-100 overflow-hidden relative group"
    >
      {/* Efecto de acento decorativo */}
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600"></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 text-indigo-800 rounded-full w-10 h-10 flex items-center justify-center font-semibold">
              {borrower.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
                {borrower.name}
              </h3>
              <div className="flex items-center mt-1">
                <svg className="w-4 h-4 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className="text-gray-600 text-sm">{borrower.phone}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 flex items-start">
            <svg className="w-4 h-4 text-gray-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-gray-500 text-sm">
              {borrower.location.split(',')[0].trim()}
              <span className="ml-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-full">
                {borrower.location.split(',')[1]?.trim() || 'Cuba'}
              </span>
            </p>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
          Actualizado: {new Date(borrower.updated_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}