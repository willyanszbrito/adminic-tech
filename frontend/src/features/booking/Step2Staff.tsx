import React from 'react';
import { Staff, Service } from '../../types';
import { SpotlightCard } from '../../components/ui/SpotlightCard';
import { Star, Users, Check, Award } from 'lucide-react';

interface Step2StaffProps {
  staffList: Staff[];
  selectedService: Service | null;
  selectedStaff: Staff | null;
  isAnyStaff: boolean;
  onSelectStaff: (staff: Staff | null, isAny: boolean) => void;
}

export const Step2Staff: React.FC<Step2StaffProps> = ({
  staffList,
  selectedService,
  selectedStaff,
  isAnyStaff,
  onSelectStaff,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Informative Header */}
      <div className="glass-panel rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold font-heading text-slate-900 dark:text-white truncate">
            Escolha o Especialista
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
            {selectedService
              ? `Profissionais para ${selectedService.name}`
              : 'Selecione quem irá realizar seu atendimento'}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 shrink-0">
          {staffList.length} disponíveis
        </span>
      </div>

      {/* Staff Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {/* Option: Any Staff Member */}
        <SpotlightCard
          isActive={isAnyStaff}
          onClick={() => onSelectStaff(null, true)}
          className="flex flex-col justify-between group border-dashed p-4 sm:p-5"
        >
          <div className="flex items-start space-x-3.5 sm:space-x-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center text-brand-primary shrink-0">
              <Users className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center space-x-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors font-heading truncate">
                  Qualquer Profissional
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Mais Rápido
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                Encontra o horário mais próximo com qualquer membro qualificado da equipe.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3.5 sm:pt-4 mt-3 sm:mt-4 border-t border-black/10 dark:border-white/10">
            <span className="text-xs text-slate-500 dark:text-slate-400">Atribuição automática</span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isAnyStaff
                  ? 'bg-brand-primary text-black font-bold shadow-lg shadow-brand-primary/30'
                  : 'bg-black/5 dark:bg-white/5 text-slate-400 group-hover:bg-brand-primary group-hover:text-black'
              }`}
            >
              {isAnyStaff ? <Check className="w-5 h-5 stroke-[2.5]" /> : <span className="text-xs font-semibold">+</span>}
            </div>
          </div>
        </SpotlightCard>

        {/* Specific Staff Cards */}
        {staffList.map((staff) => {
          const isSelected = !isAnyStaff && selectedStaff?.id === staff.id;
          return (
            <SpotlightCard
              key={staff.id}
              isActive={isSelected}
              onClick={() => onSelectStaff(staff, false)}
              className="flex flex-col justify-between group p-4 sm:p-5"
            >
              <div>
                <div className="flex items-start space-x-3.5 sm:space-x-4">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-black/10 dark:border-white/15 bg-zinc-200 dark:bg-zinc-900 shadow-md">
                      <img
                        src={staff.avatar_url || `https://placehold.co/150x150/18181b/f59e0b?text=${encodeURIComponent(staff.name.charAt(0))}`}
                        alt={staff.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://placehold.co/150x150/18181b/f59e0b?text=${encodeURIComponent(staff.name.charAt(0))}`;
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-1.5 -right-1 px-1.5 py-0.5 rounded-md bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 text-[10px] font-bold text-amber-500 flex items-center space-x-0.5 shadow-md">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                      <span>{staff.rating.toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Staff Info */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors font-heading truncate">
                      {staff.name}
                    </h3>
                    <p className="text-xs text-brand-primary font-medium flex items-center space-x-1">
                      <Award className="w-3 h-3 shrink-0" />
                      <span className="truncate">{staff.role}</span>
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {staff.bio}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3.5 sm:pt-4 mt-3 sm:mt-4 border-t border-black/10 dark:border-white/10">
                <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                  {staff.total_reviews} avaliações
                </span>

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
    </div>
  );
};
