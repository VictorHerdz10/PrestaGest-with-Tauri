// src/components/CurrencyCard.tsx
import { CurrencyResponse } from '../../schemas/currency.schema';

const colors = [
  'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
  'bg-red-500', 'bg-purple-500', 'bg-pink-500',
  'bg-indigo-500', 'bg-teal-500', 'bg-orange-500'
];

interface CurrencyCardProps {
  currency: CurrencyResponse;
  onClick: () => void;
}

export function CurrencyCard({ currency, onClick }: CurrencyCardProps) {
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
  return (
    <div 
      className={`${randomColor} rounded-lg shadow-md p-6 cursor-pointer transition-transform hover:scale-105`}
      onClick={onClick}
    >
      <div className="text-white text-center">
        <div className="text-4xl font-bold mb-2">{currency.code}</div>
        <div className="text-lg">{currency.name}</div>
        <div className="text-sm mt-2">1 {currency.code} = {currency.exchangeRate} CUP</div>
      </div>
    </div>
  );
}