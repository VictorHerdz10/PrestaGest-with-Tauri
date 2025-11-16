// src/views/dashboard/ExchangeView.tsx
import { useState, useEffect } from 'react';
import { useCurrencies } from '../../hooks/useCurrencies';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { FiRepeat, FiArrowRight } from 'react-icons/fi';

export default function ExchangeView() {
  const { data: currencies, isLoading } = useCurrencies();
  const [fromCurrency, setFromCurrency] = useState<string>('');
  const [toCurrency, setToCurrency] = useState<string>('CUP');
  const [amount, setAmount] = useState<string>('');
  const [convertedAmount, setConvertedAmount] = useState<string>('');
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [isConverting, setIsConverting] = useState<boolean>(false);

  const updateExchangeRate = (from: string, to: string) => {
    if (from === to) {
      setExchangeRate(1);
      return;
    }

    // Si alguna es CUP
    if (from === 'CUP' && to !== 'CUP') {
      const toCurrencyData = currencies?.find(c => c.code === to);
      if (toCurrencyData) setExchangeRate(1 / toCurrencyData.exchange_rate);
    } 
    else if (from !== 'CUP' && to === 'CUP') {
      const fromCurrencyData = currencies?.find(c => c.code === from);
      if (fromCurrencyData) setExchangeRate(fromCurrencyData.exchange_rate);
    }
    // Entre dos monedas extranjeras
    else {
      const fromCurrencyData = currencies?.find(c => c.code === from);
      const toCurrencyData = currencies?.find(c => c.code === to);
      
      if (fromCurrencyData && toCurrencyData) {
        // Tasa relativa: (1 FROM = X CUP) / (1 TO = Y CUP) => X/Y
        setExchangeRate(fromCurrencyData.exchange_rate / toCurrencyData.exchange_rate);
      } else {
        setExchangeRate(1);
      }
    }
  };

  useEffect(() => {
    if (currencies && currencies.length > 0 && !fromCurrency) {
      setFromCurrency(currencies[0].code);
      updateExchangeRate(currencies[0].code, toCurrency);
    }
  }, [currencies, fromCurrency, toCurrency]);

  const handleConvert = () => {
    if (!amount || isNaN(Number(amount))) return;

    setIsConverting(true);
    
    setTimeout(() => {
      const numericAmount = parseFloat(amount);
      let result;

      if (fromCurrency === toCurrency) {
        result = numericAmount.toFixed(2);
      } else {
        result = (numericAmount * exchangeRate).toFixed(6);
      }

      setConvertedAmount(result);
      setIsConverting(false);
    }, 500);
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>, type: 'from' | 'to') => {
    const selectedCode = e.target.value;
    
    if (type === 'from') {
      setFromCurrency(selectedCode);
      if (selectedCode === toCurrency) {
        setToCurrency(toCurrency === 'CUP' ? (currencies?.[0]?.code || 'USD') : 'CUP');
      }
    } else {
      setToCurrency(selectedCode);
      if (selectedCode === fromCurrency) {
        setFromCurrency(fromCurrency === 'CUP' ? (currencies?.[0]?.code || 'USD') : 'CUP');
      }
    }

    // Actualizar la tasa después de cambiar las monedas
    setTimeout(() => {
      updateExchangeRate(
        type === 'from' ? selectedCode : fromCurrency,
        type === 'to' ? selectedCode : toCurrency
      );
    }, 0);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleSwap = () => {
    if (fromCurrency && toCurrency) {
      const temp = fromCurrency;
      setFromCurrency(toCurrency);
      setToCurrency(temp);
      
      if (convertedAmount) {
        setAmount(convertedAmount);
        setConvertedAmount(amount);
      }

      // Actualizar la tasa después del intercambio
      setTimeout(() => {
        updateExchangeRate(toCurrency, fromCurrency);
      }, 0);
    }
  };

  const getExchangeRateText = () => {
    if (fromCurrency === toCurrency) {
      return `1 ${fromCurrency} = 1 ${toCurrency}`;
    }
    
    if (fromCurrency === 'CUP' && toCurrency !== 'CUP') {
      return `1 ${fromCurrency} = ${exchangeRate.toFixed(6)} ${toCurrency}`;
    } 
    else if (fromCurrency !== 'CUP' && toCurrency === 'CUP') {
      return `1 ${fromCurrency} = ${exchangeRate.toFixed(2)} ${toCurrency}`;
    }
    else {
      return `1 ${fromCurrency} = ${exchangeRate.toFixed(6)} ${toCurrency}`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Conversión de Divisas
          </span>
        </h1>
      </motion.div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda Original
              </label>
              <select
                value={fromCurrency}
                onChange={(e) => handleCurrencyChange(e, 'from')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <option>Cargando monedas...</option>
                ) : (
                  <>
                    <option value="CUP">Peso Cubano (CUP)</option>
                    {currencies?.map((currency) => (
                      <option 
                        key={currency.code} 
                        value={currency.code}
                        disabled={currency.code === toCurrency}
                      >
                        {currency.name} ({currency.code})
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>

            <div className="flex justify-center">
              <motion.button
                type="button"
                onClick={handleSwap}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-white rounded-full shadow-md text-indigo-600 hover:bg-indigo-50 transition-colors"
                title="Invertir conversión"
              >
                <FiRepeat className="w-5 h-5" />
              </motion.button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Moneda Destino
              </label>
              <select
                value={toCurrency}
                onChange={(e) => handleCurrencyChange(e, 'to')}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <option>Cargando monedas...</option>
                ) : (
                  <>
                    {currencies?.map((currency) => (
                      <option 
                        key={currency.code} 
                        value={currency.code}
                        disabled={currency.code === fromCurrency}
                      >
                        {currency.name} ({currency.code})
                      </option>
                    ))}
                    <option 
                      value="CUP"
                      disabled={fromCurrency === 'CUP'}
                    >
                      Peso Cubano (CUP)
                    </option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad en {fromCurrency || '...'}
              </label>
              <motion.div whileHover={{ scale: 1.01 }}>
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
                />
              </motion.div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resultado en {toCurrency || '...'}
              </label>
              <motion.div
                animate={{
                  backgroundColor: isConverting ? '#f5f3ff' : '#ffffff',
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white"
              >
                {isConverting ? (
                  <div className="text-gray-500">Calculando...</div>
                ) : convertedAmount ? (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">
                      {convertedAmount} {toCurrency}
                    </span>
                    <span className="text-sm text-gray-500">
                      {getExchangeRateText()}
                    </span>
                  </div>
                ) : (
                  <div className="text-gray-400">--</div>
                )}
              </motion.div>
            </div>
          </div>

          <div className="pt-2">
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                onClick={handleConvert}
                disabled={!amount || isConverting || !fromCurrency || !toCurrency}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center space-x-2">
                  {isConverting ? (
                    <span>Convirtiendo...</span>
                  ) : (
                    <>
                      <span>Convertir</span>
                      <FiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </div>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {fromCurrency && toCurrency && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200"
        >
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Información de Tasa
          </h3>
          <p className="text-gray-600">
            {getExchangeRateText()}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Tasas actualizadas según el sistema. Para cambios en las tasas, actualice
            los valores en la sección de Monedas.
          </p>
        </motion.div>
      )}
    </div>
  );
}