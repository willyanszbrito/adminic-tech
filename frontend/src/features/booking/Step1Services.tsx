import React, { useState, useMemo } from 'react';
import { Service, ServiceCategory } from '../../types';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { Search, Clock, Check } from 'lucide-react';

interface Step1ServicesProps {
  categories: ServiceCategory[];
  services: Service[];
  selectedService: Service | null;
  onSelectService: (service: Service) => void;
}

export const Step1Services: React.FC<Step1ServicesProps> = ({
  categories,
  services,
  selectedService,
  onSelectService,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory =
        selectedCategory === 'all' || service.category_id === selectedCategory;
      const matchesSearch =
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search e Category Filter Toolbar */}
      <div className="glass-panel rounded-2xl p-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por servico (ex: corte, tratamento, estetica...)"
            className="w-full glass-input pl-10 pr-4 py-2.5 rounded-xl text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/10"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                : 'glass-pill text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            Todos os Servicos ({services.length})
          </button>
          {categories.map((cat) => {
            const count = services.filter((s) => s.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                    : 'glass-pill text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List Grid */}
      {filteredServices.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400">
          <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">Nenhum servico encontrado</p>
          <p className="text-xs">Tente buscar por outro termo ou selecione outra categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service) => {
            const isSelected = selectedService?.id === service.id;
            return (
              <SpotlightCard
                key={service.id}
                isActive={isSelected}
                onClick={() => onSelectService(service)}
                className="flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-black/5 dark:border-white/5">
                      <Clock className="w-3.5 h-3.5 text-brand-primary" />
                      <span>{service.duration_minutes} minutos</span>
                    </div>

                    {service.is_featured && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        <span>Destaque</span>
                      </span>
                    )}
                  </div>

                  {/* Service Title e Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors font-heading">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Bottom Price e Select Action */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/10 dark:border-white/10">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-medium">Valor</span>
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                      R$ {service.price.toFixed(2)}
                    </span>
                  </div>

                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-brand-primary text-black font-bold shadow-lg shadow-brand-primary/30'
                        : 'bg-black/5 dark:bg-white/5 text-slate-400 group-hover:bg-brand-primary group-hover:text-black'
                    }`}
                  >
                    {isSelected ? <Check className="w-5 h-5 stroke-[2.5]" /> : <span className="text-xs font-semibold">+</span>}
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
