import React from 'react';
import { Tenant } from '../../types';
import { 
  Sparkles, Calendar, MessageSquare, ShieldCheck, 
  ArrowRight, CheckCircle2, Building2, Lock, ChevronRight
} from 'lucide-react';

interface ProductLandingPageProps {
  tenants: Tenant[];
  onSelectTenant: (slug: string) => void;
  onOpenLogin: () => void;
}

export const ProductLandingPage: React.FC<ProductLandingPageProps> = ({
  tenants,
  onSelectTenant,
  onOpenLogin,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08080a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Background Decorative Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[400px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-24 pb-16 sm:pt-32 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ecossistema Inteligente de Agendamento</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold font-heading tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Gestão e Agendamento de Alta Performance com <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600">Inteligência Real</span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Plataforma corporativa multi-tenant que conecta clientes a estabelecimentos de excelência com confirmação instantânea no WhatsApp, pagamentos automatizados e segurança de dados.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#parceiros"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-base flex items-center justify-center space-x-2 shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Ver Estabelecimentos Parceiros</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 text-slate-900 dark:text-white font-semibold text-base flex items-center justify-center space-x-2 transition-all"
            >
              <Lock className="w-4 h-4 text-amber-500" />
              <span>Acessar Portal do Parceiro</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="glass-panel p-5 rounded-2xl border border-black/10 dark:border-white/10 text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold font-heading text-amber-500">100%</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Tempo Real</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-black/10 dark:border-white/10 text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">Meta API</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">WhatsApp Oficial</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-black/10 dark:border-white/10 text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold font-heading text-emerald-500">Adminic Pay</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">PIX Automatizado</span>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-black/10 dark:border-white/10 text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white">SHA-256</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Trilha de Auditoria</span>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-black/5 dark:border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white">
              Tecnologia Completa para o seu Estabelecimento
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm sm:text-base">
              Elimine faltas, otimize horários de profissionais e proporcione uma experiência digital de primeiro mundo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-black/10 dark:border-white/10 space-y-4 hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Agendamento Multi-Tenant</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Cada empresa possui sua página exclusiva com tema, catálogo de serviços, corpo técnico e regras de horários personalizadas.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Sem conflitos de horários em tempo real</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Cálculo automático de intervalos e pausas</span>
                </li>
              </ul>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-black/10 dark:border-white/10 space-y-4 hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notificações WhatsApp & Agenda</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Disparo instantâneo de comprovante com QR Code e link direto para adicionar ao Google Calendar do cliente.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Meta Cloud API oficial homologada</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Notificação para cliente e colaborador</span>
                </li>
              </ul>
            </div>

            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-black/10 dark:border-white/10 space-y-4 hover:border-amber-500/40 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Segurança Enterprise & LGPD</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Controle rigoroso de acesso com autenticação JWT, Rate Limiting contra ataques DoS e trilha de auditoria imutável.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Zero vazamento de dados de clientes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Blindagem OWASP Top 10 ativa</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Partners Showcase Section */}
        <section id="parceiros" className="py-16 px-4 sm:px-6 max-w-7xl mx-auto border-t border-black/5 dark:border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2">
                <Building2 className="w-4 h-4" />
                <span>Vitrine de Parceiros Homologados</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white">
                Escolha o Estabelecimento para Agendar
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
              Acesse a página do estabelecimento parceiro para conferir serviços, preços e reservar seu horário em poucos cliques.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTenant(t.slug)}
                className="group glass-panel rounded-3xl overflow-hidden border border-black/10 dark:border-white/10 hover:border-amber-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between"
              >
                <div>
                  {/* Banner / Cover */}
                  <div className="h-36 relative overflow-hidden bg-zinc-900">
                    <img
                      src={t.banner_url}
                      alt={t.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/600x200/${t.theme.secondary_color.replace('#', '')}/${t.theme.primary_color.replace('#', '')}?text=${t.name}`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    {/* Logo & Category Badge */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/20 shadow-md bg-zinc-950 p-0.5">
                        <img
                          src={t.logo_url}
                          alt={t.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://placehold.co/100x100/${t.theme.secondary_color.replace('#', '')}/${t.theme.primary_color.replace('#', '')}?text=${t.name.charAt(0)}`;
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-400 border border-white/10 capitalize">
                        {t.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                        {t.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {t.slogan}
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {t.description}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {t.features.slice(0, 3).map((feat, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-black/5 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-black/5 dark:border-white/5"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <div className="w-full py-3 px-4 rounded-xl bg-amber-500/10 group-hover:bg-amber-500 text-amber-600 dark:text-amber-400 group-hover:text-black font-semibold text-xs flex items-center justify-center space-x-2 transition-all">
                    <span>Agendar neste Estabelecimento</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Protected Area Access Prompt */}
        <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto text-center border-t border-black/5 dark:border-white/5">
          <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-black/10 dark:border-white/10 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white">
              Área Administrativa e de Gestores
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              Colaboradores, gestores de estabelecimentos parceiros e administradores do ecossistema devem efetuar login para acessar métricas e agendas restritas.
            </p>
            <div className="pt-4">
              <button
                onClick={onOpenLogin}
                className="px-8 py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-all inline-flex items-center space-x-2"
              >
                <span>Acessar Painel Autenticado</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
