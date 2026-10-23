import {
  IngredientItem, CompoundItem, SensoryLabSimulationResponse,
  CandidateFormulation, SimilarityMatchItem, FlavorSpaceNode
} from '../types/sensory';

const API_BASE = '/api/v1';

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${API_BASE}/health`);
      if (!res.ok) return { status: 'offline' };
      return await res.json();
    } catch {
      return { status: 'offline' };
    }
  },

  async getIngredients(): Promise<IngredientItem[]> {
    const res = await fetch(`${API_BASE}/ingredients`);
    if (!res.ok) {
      throw new Error(`Failed to load ingredients (status: ${res.status})`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async getCompounds(limit: number = 100): Promise<CompoundItem[]> {
    const res = await fetch(`${API_BASE}/compounds?limit=${limit}`);
    if (!res.ok) {
      throw new Error(`Failed to load compounds (status: ${res.status})`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  async predictAroma(payload: { smiles?: string; ingredient_name?: string }) {
    const res = await fetch(`${API_BASE}/predict/aroma`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Aroma prediction failed');
    }
    return res.json();
  },

  async predictAromaSmiles(smiles: string) {
    return this.predictAroma({ smiles });
  },

  async predictAromaIngredient(ingredient_name: string) {
    return this.predictAroma({ ingredient_name });
  },

  async predictFlavor(payload: { smiles?: string; ingredient_name?: string }) {
    const res = await fetch(`${API_BASE}/predict/flavor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Flavor prediction failed');
    }
    return res.json();
  },

  async predictFlavorSmiles(smiles: string) {
    return this.predictFlavor({ smiles });
  },

  async predictFlavorIngredient(ingredient_name: string) {
    return this.predictFlavor({ ingredient_name });
  },

  async analyzeFormulation(items: Array<{ ingredient_name: string; proportion: number }>, applyInteractions: boolean = true) {
    const res = await fetch(`${API_BASE}/analyze/formulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, apply_interaction_effects: applyInteractions })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Formulation analysis failed');
    }
    return res.json();
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

    const res = await fetch(`${API_BASE}/generate/formulation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Formulation generation failed');
    }
    return res.json();
  },

  async searchSimilarity(payload: {
    target_ingredient?: string;
    target_smiles?: string;
    top_k?: number;
    mode?: 'sensory' | 'chemical' | 'multimodal' | 'contrastive';
  }): Promise<SimilarityMatchItem[]> {
    const res = await fetch(`${API_BASE}/similarity/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Similarity search failed');
    }
    return res.json();
  },

  async simulateSensoryPerturbation(payload: {
    initial_formulation: Array<{ ingredient_name: string; proportion: number }>;
    modified_formulation: Array<{ ingredient_name: string; proportion: number }>;
    apply_interactions?: boolean;
  }): Promise<SensoryLabSimulationResponse> {
    const res = await fetch(`${API_BASE}/sensory/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Sensory simulation failed');
    }
    return res.json();
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
    const res = await fetch(`${API_BASE}/assistant/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, conversation_history: history || [] })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Assistant query failed');
    }
    return res.json();
  },

  async getFlavorSpace(): Promise<{ total_entities: number; nodes: FlavorSpaceNode[]; methodology: string }> {
    const res = await fetch(`${API_BASE}/flavor-space`);
    if (!res.ok) {
      throw new Error(`Failed to load flavor space (status: ${res.status})`);
    }
    const data = await res.json();
    return {
      total_entities: data?.total_entities || 0,
      nodes: Array.isArray(data?.nodes) ? data.nodes : [],
      methodology: data?.methodology || ''
    };
  },

  async getModelBenchmarks() {
    const res = await fetch(`${API_BASE}/models/benchmarks`);
    if (!res.ok) {
      throw new Error(`Failed to load model benchmarks (status: ${res.status})`);
    }
    return res.json();
  },

  async classifyENose(payload: import('../types/hardware').ENoseSensorFrame): Promise<import('../types/hardware').ENoseClassification> {
    const res = await fetch(`${API_BASE}/hardware/enose/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'E-Nose classification failed');
    }
    return res.json();
  },

  async getENosePresets(): Promise<Record<string, any>> {
    const res = await fetch(`${API_BASE}/hardware/enose/presets`);
    if (!res.ok) {
      throw new Error('Failed to load E-Nose presets');
    }
    return res.json();
  },

  async programDispenser(payload: { recipe_title?: string; formulation: any[]; total_volume_microliters?: number }): Promise<import('../types/hardware').PhysicalSynthesisJob> {
    const res = await fetch(`${API_BASE}/hardware/dispenser/program`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipe_title: payload.recipe_title || 'Custom Blend',
        formulation: payload.formulation,
        total_volume_microliters: payload.total_volume_microliters || 1000.0
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Dispenser programming failed');
    }
    return res.json();
  },

  async getArduinoFirmware(): Promise<{ firmware_name: string; target: string; baud_rate: number; source_code: string }> {
    const res = await fetch(`${API_BASE}/hardware/firmware/arduino`);
    if (!res.ok) {
      throw new Error('Failed to fetch firmware');
    }
    return res.json();
  }
};

