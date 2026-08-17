/**
 * Módulo de Testes A/B (CRO e Otimização Contínua de Conversão)
 * Atribuição determinística por visitante, persistência em localStorage e tracking de conversões.
 */

export type ExperimentVariant = 'control' | 'variant_b' | 'variant_c';

export interface ExperimentConfig {
  id: string;
  name: string;
  variants: ExperimentVariant[];
  weights?: number[]; // Ex: [0.5, 0.5] para split 50/50
}

const STORAGE_VISITOR_KEY = 'adminic_ab_visitor_id';
const STORAGE_ASSIGNMENTS_KEY = 'adminic_ab_assignments';

export const EXPERIMENTS = {
  CTA_BOOKING_BUTTON: {
    id: 'exp_cta_button_v1',
    name: 'Texto do Botão Principal de Agendamento',
    variants: ['control', 'variant_b'] as ExperimentVariant[],
  },
  VOUCHER_CONFIRMATION_STYLE: {
    id: 'exp_voucher_style_v1',
    name: 'Estilo do Card de Confirmação',
    variants: ['control', 'variant_b'] as ExperimentVariant[],
  },
};

class ABTestingService {
  private visitorId: string;
  private assignments: Record<string, ExperimentVariant> = {};

  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
    this.loadAssignments();
  }

  private getOrCreateVisitorId(): string {
    if (typeof window === 'undefined') return 'server_default';
    let id = localStorage.getItem(STORAGE_VISITOR_KEY);
    if (!id) {
      id = 'vis_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem(STORAGE_VISITOR_KEY, id);
    }
    return id;
  }

  private loadAssignments() {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_ASSIGNMENTS_KEY);
      if (saved) {
        this.assignments = JSON.parse(saved);
      }
    } catch {
      this.assignments = {};
    }
  }

  private saveAssignments() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_ASSIGNMENTS_KEY, JSON.stringify(this.assignments));
    } catch (e) {
      console.warn('Falha ao salvar atribuição A/B:', e);
    }
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  /**
   * Obtém a variante atribuída a este usuário para o experimento especificado.
   */
  public getVariant(experiment: ExperimentConfig): ExperimentVariant {
    if (this.assignments[experiment.id]) {
      return this.assignments[experiment.id];
    }

    // Atribuição pseudo-aleatória determinística por hash(visitorId + experimentId)
    const combinedKey = `${this.visitorId}:${experiment.id}`;
    const hash = this.hashString(combinedKey);
    const variantIndex = hash % experiment.variants.length;
    const assignedVariant = experiment.variants[variantIndex];

    this.assignments[experiment.id] = assignedVariant;
    this.saveAssignments();

    // Registra impressão no console de desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[A/B Testing] Experimento: ${experiment.name} | Variante: ${assignedVariant}`);
    }

    return assignedVariant;
  }

  /**
   * Registra a conversão de um objetivo para o experimento.
   */
  public trackConversion(experimentId: string, eventName: string = 'booking_confirmed') {
    const variant = this.assignments[experimentId] || 'control';
    try {
      const conversionData = {
        experiment_id: experimentId,
        variant,
        event: eventName,
        timestamp: new Date().toISOString(),
        visitor_id: this.visitorId,
      };

      // Dispara evento customizado para Google Analytics / DataLayer se disponível
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          action: 'ab_conversion',
          ...conversionData,
        });
      }

      console.log('[A/B Testing] Conversão Registrada:', conversionData);
    } catch (e) {
      console.warn('Erro ao trackear conversão A/B:', e);
    }
  }
}

export const abTesting = new ABTestingService();
