import React, { useState, useMemo } from 'react';
import { Service, ServiceCategory } from '../../types';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { Search, Clock, Check, Sparkles, ArrowRight, Layers } from 'lucide-react';

interface Step1ServicesProps {
  categories: ServiceCategory[];
  services: Service[];
  selectedService?: Service | null;
  selectedServices?: Service[];
  onSelectService?: (service: Service) => void;
  onToggleService?: (service: Service) => void;
  onProceed?: () => void;
  totalPrice?: number;
  totalDuration?: number;
}

export const Step1Services: React.FC<Step1ServicesProps> = ({
  categories,
  services,
  selectedService,
  selectedServices = [],
  onSelectService,
  onToggleService,
  onProceed,
  totalPrice = 0,
  totalDuration = 0,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active selection set
  const activeIds = useMemo(() => {
    if (selectedServices && selectedServices.length > 0) {
      return new Set(selectedServices.map((s) => s.id));
    }
    if (selectedService) {
      return new Set([selectedService.id]);
    }
    return new Set<string>();
  }, [selectedServices, selectedService]);

  const handleCardClick = (service: Service) => {
    if (onToggleService) {
      onToggleService(service);
    } else if (onSelectService) {
      onSelectService(service);
    }
  };

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

  const selectedCount = activeIds.size;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Informative Tip: Multi-selection Combo */}
      <div className="glass-panel rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 border border-brand-primary/20 bg-brand-primary/[0.04]">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-brand-primary/20 text-brand-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              Monte seu Combo Personalizado
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate">
              Toque nos serviços desejados (ex: Corte + Barba + Sobrancelha) para agendá-los juntos.
            </p>
          </div>
        </div>
        {selectedCount > 1 && (
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-brand-primary text-black shrink-0 flex items-center space-x-1 shadow-md shadow-brand-primary/20">
            <Layers className="w-3.5 h-3.5" />
            <span>Combo ({selectedCount})</span>
          </span>
        )}
      </div>

      {/* Search e Category Filter Toolbar */}
      <div className="glass-panel rounded-2xl p-3.5 sm:p-4 space-y-3 sm:space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por serviço (ex: corte, barba, hidratação...)"
            className="w-full glass-input pl-10 pr-16 py-2.5 sm:py-3 rounded-xl text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-md bg-black/5 dark:bg-white/10 touch-target flex items-center justify-center"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all touch-target flex items-center shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-brand-primary text-black shadow-md shadow-brand-primary/20'
                : 'glass-pill text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            Todos ({services.length})
          </button>
          {categories.map((cat) => {
            const count = services.filter((s) => s.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all touch-target flex items-center shrink-0 ${
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
        <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center text-slate-500 dark:text-slate-400">
          <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">Nenhum serviço encontrado</p>
          <p className="text-xs">Tente buscar por outro termo ou selecione outra categoria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredServices.map((service) => {
            const isSelected = activeIds.has(service.id);
            return (
              <SpotlightCard
                key={service.id}
                isActive={isSelected}
                onClick={() => handleCardClick(service)}
                className={`flex flex-col justify-between group p-4 sm:p-5 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-brand-primary/60 bg-brand-primary/[0.04]'
                    : 'hover:border-brand-primary/30'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-black/5 dark:border-white/5">
                      <Clock className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      <span>{service.duration_minutes} min</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      {service.is_featured && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <span>Destaque</span>
                        </span>
                      )}
                      {isSelected && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-brand-primary text-black shadow-sm">
                          <span>Selecionado</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Service Title e Description */}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors font-heading break-words">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Bottom Price e Select Action */}
                <div className="flex items-center justify-between pt-3.5 sm:pt-4 mt-3 sm:mt-4 border-t border-black/10 dark:border-white/10">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-medium">Valor</span>
                    <span className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-heading">
                      R$ {service.price.toFixed(2)}
                    </span>
                  </div>

                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-brand-primary text-black font-bold shadow-lg shadow-brand-primary/30 scale-105'
                        : 'bg-black/5 dark:bg-white/5 text-slate-400 group-hover:bg-brand-primary group-hover:text-black'
                    }`}
                  >
                    {isSelected ? <Check className="w-5 h-5 stroke-[2.5]" /> : <span className="text-sm font-semibold">+</span>}
                  </div>
                </div>
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {/* Quick Combo Floating Bar on Step 1 (when at least 1 service is selected) */}
      {selectedCount > 0 && onProceed && (
        <div className="glass-panel rounded-2xl p-4 border border-brand-primary/30 bg-white/90 dark:bg-zinc-900/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-brand-primary text-black font-extrabold flex items-center justify-center shrink-0 shadow-md">
              {selectedCount}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {selectedCount === 1 ? '1 serviço selecionado' : `${selectedCount} serviços no combo`}
              </p>
              <p className="text-xs text-brand-primary font-semibold">
                Total: R$ {totalPrice.toFixed(2)} • ~{totalDuration} min
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onProceed}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-brand-primary text-black hover:opacity-95 active:scale-95 transition-all shadow-md shadow-brand-primary/25 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Continuar para Profissional</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
