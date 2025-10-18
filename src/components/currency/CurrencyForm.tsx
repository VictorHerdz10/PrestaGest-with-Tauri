import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { currencySchema, type CurrencyForm as CurrencyFormType } from '../../schemas/currency.schema';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';

interface CurrencyFormProps {
  initialValues?: Partial<CurrencyFormType>;
  onSubmit: (data: CurrencyFormType) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function CurrencyForm({ 
  initialValues, 
  onSubmit, 
  isSubmitting,
  onCancel 
}: CurrencyFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<CurrencyFormType>({
    resolver: zodResolver(currencySchema),
    defaultValues: initialValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">Código </label>
        <input
          {...register('code')}
          type="text"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
          placeholder="Ej: USD"
          maxLength={5}
        />
        {errors.code && <p className="mt-2 text-sm text-red-600">{errors.code.message}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
        <input
          {...register('name')}
          type="text"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
          placeholder="Ej: Dólar Estadounidense"
        />
        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">Tasa de cambio (CUP)</label>
        <input
          {...register('exchangeRate', { valueAsNumber: true })}
          type="number"
          step="0.01"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
          placeholder="Ej: 370.0"
        />
        {errors.exchangeRate && <p className="mt-2 text-sm text-red-600">{errors.exchangeRate.message}</p>}
      </motion.div>

      <motion.div
        className="flex justify-end space-x-3 pt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-6 py-2"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </motion.div>
    </form>
  );
}