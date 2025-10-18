// src/components/borrower/BorrowerForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { borrowerSchema, type BorrowerForm as BorrowerFormType } from '../../schemas/borrower.schema';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

// Objeto completo de provincias y municipios de Cuba
const cubaLocations = {
  'Pinar del Río': [
    'Consolación del Sur', 'Guane', 'La Palma', 'Los Palacios', 
    'Mantua', 'Minas de Matahambre', 'Pinar del Río', 'San Juan y Martínez', 
    'San Luis', 'Sandino', 'Viñales'
  ],
  'Artemisa': [
    'Alquízar', 'Artemisa', 'Bauta', 'Caimito', 'Guanajay', 
    'Güira de Melena', 'Mariel', 'San Antonio de los Baños', 
    'Bahía Honda', 'Candelaria', 'San Cristóbal'
  ],
  'La Habana': [
    'Arroyo Naranjo', 'Boyeros', 'Centro Habana', 'Cerro', 'Cotorro', 
    'Diez de Octubre', 'Guanabacoa', 'La Habana del Este', 
    'La Habana Vieja', 'La Lisa', 'Marianao', 'Playa', 'Plaza de la Revolución', 
    'Regla', 'San Miguel del Padrón'
  ],
  'Mayabeque': [
    'Batabanó', 'Bejucal', 'Güines', 'Jaruco', 'Madruga', 
    'Melena del Sur', 'Nueva Paz', 'Quivicán', 'San José de las Lajas', 
    'San Nicolás de Bari', 'Santa Cruz del Norte'
  ],
  'Matanzas': [
    'Calimete', 'Cárdenas', 'Ciudad de Matanzas', 'Colón', 'Jagüey Grande', 
    'Jovellanos', 'Limonar', 'Los Arabos', 'Martí', 'Pedro Betancourt', 
    'Perico', 'Unión de Reyes', 'Varadero'
  ],
  'Villa Clara': [
    'Caibarién', 'Camajuaní', 'Cifuentes', 'Corralillo', 'Encrucijada', 
    'Manicaragua', 'Placetas', 'Quemado de Güines', 'Ranchuelo', 
    'Remedios', 'Sagua la Grande', 'Santa Clara', 'Santo Domingo'
  ],
  'Cienfuegos': [
    'Abreus', 'Aguada de Pasajeros', 'Cienfuegos', 'Cruces', 
    'Cumanayagua', 'Lajas', 'Palmira', 'Rodas'
  ],
  'Sancti Spíritus': [
    'Cabaiguán', 'Fomento', 'Jatibonico', 'La Sierpe', 'Sancti Spíritus', 
    'Taguasco', 'Trinidad', 'Yaguajay'
  ],
  'Ciego de Ávila': [
    'Baraguá', 'Bolivia', 'Chambas', 'Ciego de Ávila', 'Ciro Redondo', 
    'Florencia', 'Majagua', 'Morón', 'Primero de Enero', 'Venezuela'
  ],
  'Camagüey': [
    'Camagüey', 'Carlos M. de Céspedes', 'Esmeralda', 'Florida', 
    'Guáimaro', 'Jimaguayú', 'Minas', 'Najasa', 'Nuevitas', 
    'Santa Cruz del Sur', 'Sibanicú', 'Sierra de Cubitas', 'Vertientes'
  ],
  'Las Tunas': [
    'Amancio', 'Colombia', 'Jesús Menéndez', 'Jobabo', 
    'Las Tunas', 'Majibacoa', 'Manatí', 'Puerto Padre'
  ],
  'Holguín': [
    'Antilla', 'Báguanos', 'Banes', 'Cacocum', 'Calixto García', 
    'Cueto', 'Frank País', 'Gibara', 'Holguín', 'Mayarí', 'Moa', 
    'Rafael Freyre', 'Sagua de Tánamo', 'Urbano Noris'
  ],
  'Granma': [
    'Bartolomé Masó', 'Bayamo', 'Buey Arriba', 'Campechuela', 
    'Cauto Cristo', 'Guisa', 'Jiguaní', 'Manzanillo', 'Media Luna', 
    'Niquero', 'Pilón', 'Río Cauto', 'Yara'
  ],
  'Santiago de Cuba': [
    'Contramaestre', 'Guamá', 'Mella', 'Palma Soriano', 
    'San Luis', 'Santiago de Cuba', 'Segundo Frente', 
    'Songo-La Maya', 'Tercer Frente'
  ],
  'Guantánamo': [
    'Baracoa', 'Caimanera', 'El Salvador', 'Guantánamo', 
    'Imías', 'Maisí', 'Manuel Tames', 'Niceto Pérez', 'San Antonio del Sur', 'Yateras'
  ],
  'Isla de la Juventud': [
    'Isla de la Juventud'
  ]
};

interface LocationSuggestion {
  municipality: string;
  province: string;
  fullName: string;
}

interface BorrowerFormProps {
  initialValues?: Partial<BorrowerFormType>;
  onSubmit: (data: BorrowerFormType) => void;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function BorrowerForm({ 
  initialValues, 
  onSubmit, 
  isSubmitting,
  onCancel 
}: BorrowerFormProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BorrowerFormType>({
    resolver: zodResolver(borrowerSchema),
    defaultValues: initialValues,
  });

  const [locationInput, setLocationInput] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const currentLocation = watch('location');

  // Generar todas las sugerencias posibles
  const allSuggestions: LocationSuggestion[] = Object.entries(cubaLocations).flatMap(
    ([province, municipalities]) => 
      municipalities.map(municipality => ({
        municipality,
        province,
        fullName: `${municipality}, ${province}`
      }))
  );

  // Manejar cambios en el input de ubicación
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);
    
    if (value.length > 1) {
      const filtered = allSuggestions.filter(item =>
        item.fullName.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Seleccionar una sugerencia
  const selectSuggestion = (suggestion: LocationSuggestion) => {
    setValue('location', suggestion.fullName);
    setLocationInput(suggestion.fullName);
    setShowSuggestions(false);
  };

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sincronizar el valor del formulario con el input
  useEffect(() => {
    if (currentLocation) {
      setLocationInput(currentLocation);
    }
  }, [currentLocation]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
        <input
          {...register('phone')}
          type="text"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
          placeholder="Ej: 55555555"
          maxLength={20}
        />
        {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>}
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
          placeholder="Ej: Juan Pérez"
        />
        {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
        ref={suggestionsRef}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
        <input
          {...register('location')}
          type="text"
          value={locationInput}
          onChange={handleLocationChange}
          onFocus={() => locationInput.length > 1 && setShowSuggestions(true)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder-gray-400"
          placeholder="Ej: Playa, La Habana"
          autoComplete="off"
        />
        {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location.message}</p>}
        
        {showSuggestions && suggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
          >
            {suggestions.map((item, index) => (
              <div
                key={index}
                onClick={() => selectSuggestion(item)}
                className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex justify-between"
              >
                <span className="font-medium">{item.municipality}</span>
                <span className="text-gray-500 text-sm">{item.province}</span>
              </div>
            ))}
          </motion.div>
        )}
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