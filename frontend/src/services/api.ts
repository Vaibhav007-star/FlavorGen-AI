/// <reference types="vite/client" />
import {
  IngredientItem, CompoundItem, SensoryLabSimulationResponse,
  CandidateFormulation, SimilarityMatchItem, FlavorSpaceNode
} from '../types/sensory';
import { ENoseSensorFrame, ENoseClassification, PhysicalSynthesisJob } from '../types/hardware';
import { fallbackService } from './fallbackService';

const API_BASE = ((import.meta as any).env?.VITE_API_BASE as string) || '/api/v1';

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) return fallbackService.getHealth();
      return await res.json();
    } catch {
      return fallbackService.getHealth();
    }
  },

  async getIngredients(): Promise<IngredientItem[]> {
    try {
      const res = await fetch(`${API_BASE}/ingredients`);
      if (!res.ok) return fallbackService.getIngredients();
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : fallbackService.getIngredients();
    } catch {
      return fallbackService.getIngredients();
    }
  },

  async getCompounds(limit: number = 100): Promise<CompoundItem[]> {
    try {
      const res = await fetch(`${API_BASE}/compounds?limit=${limit}`);
      if (!res.ok) return fallbackService.getCompounds(limit);
      const data = await res.json();
      return Array.isArray(data) && data.length > 0 ? data : fallbackService.getCompounds(limit);
    } catch {
      return fallbackService.getCompounds(limit);
    }
  },

  async predictAroma(payload: { smiles?: string; ingredient_name?: string }) {
    try {
      const res = await fetch(`${API_BASE}/predict/aroma`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return fallbackService.predictAroma(payload);
      return await res.json();
    } catch {
      return fallbackService.predictAroma(payload);
    }
  },

  async predictAromaSmiles(smiles: string) {
    return this.predictAroma({ smiles });
  },

  async predictAromaIngredient(ingredient_name: string) {
    return this.predictAroma({ ingredient_name });
  },

  async predictFlavor(payload: { smiles?: string; ingredient_name?: string }) {
    try {
      const res = await fetch(`${API_BASE}/predict/flavor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return fallbackService.predictFlavor(payload);
      return await res.json();
    } catch {
      return fallbackService.predictFlavor(payload);
    }
  },

  async predictFlavorSmiles(smiles: string) {
    return this.predictFlavor({ smiles });
  },

  async predictFlavorIngredient(ingredient_name: string) {
    return this.predictFlavor({ ingredient_name });
  },

  async analyzeFormulation(items: Array<{ ingredient_name: string; proportion: number }>, applyInteractions: boolean = true) {
    try {
      const res = await fetch(`${API_BASE}/analyze/formulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, apply_interaction_effects: applyInteractions })
      });
      if (!res.ok) return fallbackService.analyzeFormulation(items);
      return await res.json();
    } catch {
      return fallbackService.analyzeFormulation(items);
    }
  },

  async generateFormulation(
    payloadOrPrompt: string | {
      text_prompt?: string;
      target_aroma?: Record<string, number>;
      target_flavor?: Record<string, number>;
      excluded_ingredients?: string[];
      max_ingredients?: number;
    },
    excludedIngredients?: string[],
    maxIngredients?: number
  ) {
    let payload: any;
    if (typeof payloadOrPrompt === 'string') {
      payload = {
        text_prompt: payloadOrPrompt,
        excluded_ingredients: excludedIngredients || [],
        max_ingredients: maxIngredients || 4
      };
    } else {
      payload = payloadOrPrompt;
    }

    try {
      const res = await fetch(`${API_BASE}/generate/formulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return fallbackService.generateFormulation(payload);
      return await res.json();
    } catch {
      return fallbackService.generateFormulation(payload);
    }
  },

  async searchSimilarity(payload: {
    target_ingredient?: string;
    target_smiles?: string;
    top_k?: number;
    mode?: 'sensory' | 'chemical' | 'multimodal' | 'contrastive';
  }): Promise<SimilarityMatchItem[]> {
    try {
      const res = await fetch(`${API_BASE}/similarity/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return fallbackService.searchSimilarity(payload);
      return await res.json();
    } catch {
      return fallbackService.searchSimilarity(payload);
    }
  },

  async simulateSensoryPerturbation(payload: {
    initial_formulation: Array<{ ingredient_name: string; proportion: number }>;
    modified_formulation: Array<{ ingredient_name: string; proportion: number }>;
    apply_interactions?: boolean;
  }): Promise<SensoryLabSimulationResponse> {
    try {
      const res = await fetch(`${API_BASE}/sensory/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return fallbackService.simulateSensoryPerturbation(payload);
      return await res.json();
    } catch {
      return fallbackService.simulateSensoryPerturbation(payload);
    }
  },

  async simulateSensoryShift(
    initial_formulation: Array<{ ingredient_name: string; proportion: number }>,
    modified_formulation: Array<{ ingredient_name: string; proportion: number }>,
    apply_interactions: boolean = true
  ): Promise<SensoryLabSimulationResponse> {
    return this.simulateSensoryPerturbation({
      initial_formulation,
      modified_formulation,
      apply_interactions
    });
  },

  async queryAssistant(query: string, history?: Array<{ role: string; content: string }>) {
    try {
      const res = await fetch(`${API_BASE}/assistant/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, conversation_history: history || [] })
      });
      if (!res.ok) return fallbackService.queryAssistant(query);
      return await res.json();
    } catch {
      return fallbackService.queryAssistant(query);
    }
  },

  async getFlavorSpace(): Promise<{ total_entities: number; nodes: FlavorSpaceNode[]; methodology: string }> {
    try {
      const res = await fetch(`${API_BASE}/flavor-space`);
      if (!res.ok) return fallbackService.getFlavorSpace();
      const data = await res.json();
      return {
        total_entities: data?.total_entities || 0,
        nodes: Array.isArray(data?.nodes) && data.nodes.length > 0 ? data.nodes : fallbackService.getFlavorSpace().nodes,
        methodology: data?.methodology || ''
      };
    } catch {
      return fallbackService.getFlavorSpace();
    }
  },

  async getModelBenchmarks() {
    try {
      const res = await fetch(`${API_BASE}/models/benchmarks`);
      if (!res.ok) return fallbackService.getModelBenchmarks();
      return await res.json();
    } catch {
      return fallbackService.getModelBenchmarks();
    }
  },

  async classifyENose(payload: ENoseSensorFrame): Promise<ENoseClassification> {
    try {
      const res = await fetch(`${API_BASE}/hardware/enose/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) return fallbackService.classifyENose(payload);
      return await res.json();
    } catch {
      return fallbackService.classifyENose(payload);
    }
  },

  async getENosePresets(): Promise<Record<string, any>> {
    try {
      const res = await fetch(`${API_BASE}/hardware/enose/presets`);
      if (!res.ok) return fallbackService.getENosePresets();
      return await res.json();
    } catch {
      return fallbackService.getENosePresets();
    }
  },

  async programDispenser(payload: { recipe_title?: string; formulation: any[]; total_volume_microliters?: number }): Promise<PhysicalSynthesisJob> {
    try {
      const res = await fetch(`${API_BASE}/hardware/dispenser/program`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe_title: payload.recipe_title || 'Custom Blend',
          formulation: payload.formulation,
          total_volume_microliters: payload.total_volume_microliters || 1000.0
        })
      });
      if (!res.ok) return fallbackService.programDispenser(payload);
      return await res.json();
    } catch {
      return fallbackService.programDispenser(payload);
    }
  },

  async getArduinoFirmware(): Promise<{ firmware_name: string; target: string; baud_rate: number; source_code: string }> {
    try {
      const res = await fetch(`${API_BASE}/hardware/firmware/arduino`);
      if (!res.ok) return fallbackService.getArduinoFirmware();
      return await res.json();
    } catch {
      return fallbackService.getArduinoFirmware();
    }
  }
};
