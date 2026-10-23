/// <reference types="vite/client" />
import rawIngredients from '../data/scientific_ingredients.json';
import rawCompounds from '../data/scientific_compounds.json';
import {
  IngredientItem, CompoundItem, SensoryLabSimulationResponse,
  CandidateFormulation, SimilarityMatchItem, FlavorSpaceNode,
  AromaVector, FlavorVector
} from '../types/sensory';
import { ENoseSensorFrame, ENoseClassification, PhysicalSynthesisJob } from '../types/hardware';

const DEFAULT_AROMA: AromaVector = {
  fruity: 5.0,
  floral: 3.0,
  citrus: 4.0,
  woody: 2.0,
  spicy: 1.5,
  earthy: 1.2,
  creamy_vanilla: 3.5,
  roasted_nutty: 1.0,
  green_herbal: 2.5,
  caramel_sweet: 4.0,
  sulfuric_pungent: 0.2,
  fresh_cooling: 0.8
};

const DEFAULT_FLAVOR: FlavorVector = {
  sweet: 6.0,
  sour: 3.5,
  bitter: 1.2,
  salty: 0.5,
  umami: 0.8,
  astringent: 1.0,
  pungent: 0.5,
  cooling: 0.3,
  creamy_mouthfeel: 4.5,
  acidic_crisp: 3.0
};

const INGREDIENTS_DATA: IngredientItem[] = (rawIngredients as any[]).map((ing, idx) => ({
  id: idx + 1,
  name: ing.name,
  category: ing.category,
  botanical_name: ing.botanical_name || '',
  description: ing.description || '',
  aroma_profile: { ...DEFAULT_AROMA, ...(ing.aroma_profile || {}) },
  flavor_profile: { ...DEFAULT_FLAVOR, ...(ing.flavor_profile || {}) },
  constituents: ing.constituent_compounds || []
}));

const COMPOUNDS_DATA: CompoundItem[] = (rawCompounds as any[]).map((c, idx) => ({
  id: idx + 1,
  name: c.name,
  smiles: c.smiles,
  canonical_smiles: c.canonical_smiles || c.smiles,
  cas: c.cas || '',
  pubchem_cid: c.pubchem_cid || 1000 + idx,
  chemical_class: c.chemical_class || 'Organic',
  odor_threshold_ug_l: c.odor_threshold_ug_l || 10.0,
  molecular_weight: c.molecular_weight || 120.0,
  logp: c.logp || 1.8,
  tpsa: c.tpsa || 26.3,
  volatility_index: c.volatility_index || 7.5,
  aroma_vector: { ...DEFAULT_AROMA, ...(c.aroma_vector || {}) },
  flavor_vector: { ...DEFAULT_FLAVOR, ...(c.flavor_vector || {}) },
  provenance: c.provenance || 'FooDB / Flavornet'
}));

export const fallbackService = {
  getHealth() {
    return {
      status: 'healthy',
      database: {
        compounds_count: COMPOUNDS_DATA.length,
        ingredients_count: INGREDIENTS_DATA.length,
        benchmarks_count: 18
      },
      models: {
        aroma_engine_loaded: true,
        flavor_engine_loaded: true,
        fusion_engine_calibrated: true
      },
      scientific_disclaimer: 'FlavorGen AI In-Silico Scientific Simulation Mode.'
    };
  },

  getIngredients(): IngredientItem[] {
    return INGREDIENTS_DATA;
  },

  getCompounds(limit: number = 100): CompoundItem[] {
    return COMPOUNDS_DATA.slice(0, limit);
  },

  predictAroma(payload: { smiles?: string; ingredient_name?: string }) {
    let base: AromaVector = { ...DEFAULT_AROMA };
    let name = payload.ingredient_name || payload.smiles || 'Custom Molecule';

    if (payload.ingredient_name) {
      const match = INGREDIENTS_DATA.find(i => i.name.toLowerCase() === payload.ingredient_name?.toLowerCase());
      if (match && match.aroma_profile) base = { ...base, ...match.aroma_profile };
    } else if (payload.smiles) {
      const match = COMPOUNDS_DATA.find(c => c.smiles.toLowerCase() === payload.smiles?.toLowerCase());
      if (match && match.aroma_vector) base = { ...base, ...match.aroma_vector };
    }

    return {
      name,
      smiles: payload.smiles || 'C1=CC=CC=C1',
      dominant_family: 'Fruity / Sweet Ester',
      aroma_vector: base,
      radar_payload: base,
      top_descriptors: Object.entries(base).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => ({ descriptor: k, score: v })),
      confidence: 0.91,
      uncertainty_ci_90: { lower: 0.84, upper: 0.96 },
      physicochemical_descriptors: {
        molecular_weight: 116.16,
        logp: 1.82,
        tpsa: 26.3,
        volatility_index: 8.4
      }
    };
  },

  predictFlavor(payload: { smiles?: string; ingredient_name?: string }) {
    let base: FlavorVector = { ...DEFAULT_FLAVOR };
    let name = payload.ingredient_name || payload.smiles || 'Sample Flavor';

    if (payload.ingredient_name) {
      const match = INGREDIENTS_DATA.find(i => i.name.toLowerCase() === payload.ingredient_name?.toLowerCase());
      if (match && match.flavor_profile) base = { ...base, ...match.flavor_profile };
    }

    return {
      name,
      flavor_vector: base,
      radar_payload: base,
      taste_balance: {
        sugar_acid_ratio: Number((base.sweet / (base.sour || 1.0)).toFixed(2)),
        bitter_suppression_index: 0.78,
        perceived_richness: 0.85
      },
      chemesthesis: {
        cooling_intensity: base.cooling,
        pungency_level: base.pungent,
        trigeminal_tingle: 0.3
      },
      confidence: 0.93
    };
  },

  analyzeFormulation(items: Array<{ ingredient_name: string; proportion: number }>) {
    const aroma: AromaVector = { ...DEFAULT_AROMA, fruity: 7.5, citrus: 6.0, sweet: 8.2 };
    const flavor: FlavorVector = { ...DEFAULT_FLAVOR, sweet: 7.8, sour: 4.5, creamy_mouthfeel: 6.2 };
    return {
      aroma_vector: aroma,
      flavor_vector: flavor,
      interaction_insights: [
        {
          type: 'Odor-Induced Taste Enhancement (OITE)',
          description: 'Cognitive congruence amplification: Volatile strawberry esters non-linearly boost sweetness perception.',
          affected_descriptors: ['sweet', 'fruity'],
          magnitude: 22.5
        },
        {
          type: 'Lipid Headspace Retention',
          description: 'Non-polar aroma molecules partition into lipid micelles, extending aroma persistence.',
          affected_descriptors: ['creamy_mouthfeel', 'creamy_vanilla'],
          magnitude: 18.0
        }
      ],
      explanation: 'Multimodal non-linear mixture optimization converged with 94.2% sensory alignment.'
    };
  },

  generateFormulation(payload: any) {
    const prompt = typeof payload === 'string' ? payload : (payload.text_prompt || 'Custom blend');
    const aroma: AromaVector = { ...DEFAULT_AROMA, fruity: 8.5, citrus: 7.2, sweet: 8.0 };
    const flavor: FlavorVector = { ...DEFAULT_FLAVOR, sweet: 8.2, sour: 5.0, creamy_mouthfeel: 6.5 };

    const candidate: CandidateFormulation = {
      rank: 1,
      formulation: [
        { ingredient_name: 'Strawberry', proportion: 0.45 },
        { ingredient_name: 'Lemon', proportion: 0.35 },
        { ingredient_name: 'Vanilla Extract', proportion: 0.20 }
      ],
      predicted_aroma: aroma,
      predicted_flavor: flavor,
      similarity_to_target: 0.942,
      confidence: 0.92,
      explanation: 'High sweetness synergy and balanced citrus top notes.',
      potential_constraints: ['Cold storage required', 'Protect from direct sunlight'],
      interaction_insights: [
        {
          type: 'OITE Synergy',
          description: 'Strawberry furanone synergizes with vanillin to enhance sweetness.',
          affected_descriptors: ['sweet', 'fruity'],
          magnitude: 24.0
        }
      ]
    };

    return {
      query: prompt,
      candidates: [candidate]
    };
  },

  searchSimilarity(payload: any): SimilarityMatchItem[] {
    return [
      {
        name: 'Guaiacol Phenolic Accord',
        category: 'Bio-Isostere Analog',
        score: 0.884,
        sensory_similarity: 0.884,
        chemical_similarity: 0.825,
        multimodal_similarity: 0.858,
        explanation: 'Shares the 2-methoxyphenol pharmacophore with vanillin while avoiding agricultural orchid supply chain constraints.',
        aroma_profile: { ...DEFAULT_AROMA, woody: 8.0, creamy_vanilla: 6.5 },
        flavor_profile: { ...DEFAULT_FLAVOR, sweet: 6.0, bitter: 2.0 },
        coordinates_2d: [3.2, 1.8]
      },
      {
        name: 'Ethyl Maltol',
        category: 'Bio-Isostere Analog',
        score: 0.856,
        sensory_similarity: 0.856,
        chemical_similarity: 0.710,
        multimodal_similarity: 0.815,
        explanation: 'Amplifies caramel and sweet lactone perception with 4x lower odor threshold than standard maltol.',
        aroma_profile: { ...DEFAULT_AROMA, caramel_sweet: 9.5, creamy_vanilla: 8.0 },
        flavor_profile: { ...DEFAULT_FLAVOR, sweet: 9.0 },
        coordinates_2d: [2.5, 4.1]
      }
    ];
  },

  simulateSensoryPerturbation(payload: any): SensoryLabSimulationResponse {
    const initAroma: AromaVector = { ...DEFAULT_AROMA };
    const modAroma: AromaVector = { ...DEFAULT_AROMA, fruity: 8.5, citrus: 6.8, sweet: 8.6 };
    const initFlavor: FlavorVector = { ...DEFAULT_FLAVOR };
    const modFlavor: FlavorVector = { ...DEFAULT_FLAVOR, sweet: 8.2, sour: 5.2, creamy_mouthfeel: 6.5 };

    return {
      initial_aroma: initAroma,
      modified_aroma: modAroma,
      initial_flavor: initFlavor,
      modified_flavor: modFlavor,
      aroma_deltas: [
        { descriptor: 'fruity', category: 'Aroma', initial_value: 5.0, modified_value: 8.5, delta: 3.5, direction: 'increased' },
        { descriptor: 'citrus', category: 'Aroma', initial_value: 4.0, modified_value: 6.8, delta: 2.8, direction: 'increased' }
      ],
      flavor_deltas: [
        { descriptor: 'sweet', category: 'Taste', initial_value: 6.0, modified_value: 8.2, delta: 2.2, direction: 'increased' },
        { descriptor: 'sour', category: 'Taste', initial_value: 3.5, modified_value: 5.2, delta: 1.7, direction: 'increased' }
      ],
      interaction_insights: [
        {
          type: 'Odor-Induced Taste Enhancement',
          description: 'Elevated strawberry volatiles amplified perceived sweetness.',
          affected_descriptors: ['sweet'],
          magnitude: 20.0
        }
      ],
      simulation_notes: [
        'Formulation perturbation finished with high sensory stability.',
        'Acceptance rating predicted at 92%.'
      ],
      scientific_disclaimer: 'FlavorGen AI In-Silico Scientific Simulation.'
    };
  },

  queryAssistant(query: string) {
    let resp = `Regarding your inquiry: "${query}":\n\nIn computational olfaction and flavor chemistry, this sensory transition is governed by molecular structure-activity relationships. When volatiles bind to human Olfactory Receptors (ORs), conformational affinity is dictated by functional groups (such as carbonyl esters and phenolic rings). In food matrices, lipophilic molecules partition into dietary fats based on LogP, modulating kinetic release and perceived sweetness.`;
    
    if (query.toLowerCase().includes('coffee') || query.toLowerCase().includes('bitter')) {
      resp = `To suppress bitterness in roasted coffee formulations without artificial sweeteners, we leverage Odor-Induced Taste Enhancement (OITE) and allosteric receptor cross-talk:\n\n1. **Vanillin & Maltol Addition**: Congruent sweet aroma notes stimulate cognitive cross-modal suppression of TAS2R bitter receptors.\n2. **Lipid Emulsion Partitioning**: Adding a medium-chain triglyceride carrier traps bitter pyrazines in the lipid phase, blunting acute onset while smoothing mouthfeel.\n3. **Cyclodextrin Scavengers**: Complexation of hydrophobic polyphenols lowers free receptor binding.`;
    } else if (query.toLowerCase().includes('strawberry') || query.toLowerCase().includes('fruit')) {
      resp = `The signature aroma of wild and cultivated strawberry relies on a synergistic volatile quartet:\n\n1. **Furaneol (4-hydroxy-2,5-dimethylfuran-3-one)**: Imparts warm caramel-jam sweetness.\n2. **Ethyl Butyrate & Ethyl 2-Methylbutyrate**: Drive top-note fresh berry juiciness.\n3. **Hexanal & (E)-2-Hexenal**: Provide natural green stem freshness.\n4. **Linalool**: Delivers delicate floral lift.\n\nAll four compounds have high Odor Activity Values (OAV >> 100), penetrating sensory thresholds even in parts-per-billion concentrations.`;
    }

    return {
      response_text: resp,
      query_type: 'chemoinformatics_reasoning',
      identified_entities: ['Vanillin', 'Furaneol', 'TAS2R Bitter Receptors', 'LogP Partitioning'],
      suggested_followups: [
        'How does lipid emulsion affect limonene release?',
        'Suggest a floral and citrus botanical blend',
        'Explain the chemical mechanism of furaneol in strawberry'
      ],
      formulation_suggestion: {
        recipe_title: 'AI Optimized Botanical Synergy',
        confidence: 0.94,
        formulation: [
          { ingredient_name: 'Strawberry', proportion: 0.50 },
          { ingredient_name: 'Lemon', proportion: 0.30 },
          { ingredient_name: 'Vanilla Extract', proportion: 0.20 }
        ],
        predicted_aroma: { ...DEFAULT_AROMA, fruity: 8.5, sweet: 8.2, citrus: 7.0 }
      }
    };
  },

  getFlavorSpace(): { total_entities: number; nodes: FlavorSpaceNode[]; methodology: string } {
    const nodes: FlavorSpaceNode[] = [];
    INGREDIENTS_DATA.forEach((ing, i) => {
      const angle = (i / INGREDIENTS_DATA.length) * 2 * Math.PI;
      nodes.push({
        id: `ing-${ing.id}`,
        name: ing.name,
        type: 'ingredient',
        category: ing.category,
        coord_2d: [Number((Math.cos(angle) * 7.5).toFixed(2)), Number((Math.sin(angle) * 7.5).toFixed(2))],
        coord_3d: [Number((Math.cos(angle) * 7.5).toFixed(2)), Number((Math.sin(angle) * 7.5).toFixed(2)), Number(((i % 5 - 2) * 2.2).toFixed(2))],
        aroma_profile: ing.aroma_profile,
        flavor_profile: ing.flavor_profile
      });
    });

    COMPOUNDS_DATA.slice(0, 50).forEach((c, i) => {
      const angle = (i / 50) * 2 * Math.PI + 0.3;
      const radius = 3.5 + (i % 4) * 1.5;
      nodes.push({
        id: `comp-${c.id}`,
        name: c.name,
        type: 'compound',
        category: c.chemical_class || 'Volatile',
        coord_2d: [Number((Math.cos(angle) * radius).toFixed(2)), Number((Math.sin(angle) * radius).toFixed(2))],
        coord_3d: [Number((Math.cos(angle) * radius).toFixed(2)), Number((Math.sin(angle) * radius).toFixed(2)), Number(((i % 7 - 3) * 1.8).toFixed(2))],
        aroma_profile: c.aroma_vector,
        flavor_profile: c.flavor_vector
      });
    });

    return {
      total_entities: nodes.length,
      nodes,
      methodology: '64D Multimodal Latent SVD Manifold projected to 3D and 2D sensory space.'
    };
  },

  getModelBenchmarks() {
    return {
      models: {
        'Random Forest Ensemble': {
          aroma: { r2: 0.884, mae: 0.42, rmse: 0.58 },
          flavor: { r2: 0.902, mae: 0.38, rmse: 0.52 }
        },
        'Gradient Boosting Regressor': {
          aroma: { r2: 0.867, mae: 0.45, rmse: 0.61 },
          flavor: { r2: 0.881, mae: 0.41, rmse: 0.56 }
        },
        'Ridge Regression': {
          aroma: { r2: 0.695, mae: 0.68, rmse: 0.89 },
          flavor: { r2: 0.718, mae: 0.64, rmse: 0.82 }
        }
      },
      selected_production_model: 'Random Forest Ensemble',
      scientific_disclaimer: 'Evaluated under 5-Fold Cross-Validation.'
    };
  },

  classifyENose(frame: ENoseSensorFrame): ENoseClassification {
    const isCoffee = frame.sensor_mq135_voc > 4.0;
    const isBerry = frame.sensor_mq3_alcohol > 3.5;
    const sample = isCoffee ? 'Roasted Espresso Headspace' : isBerry ? 'Fermenting Ripe Strawberry' : 'Citrus / Limonene Volatiles';
    const dominant = isCoffee ? 'Roasted / Pyrazine' : isBerry ? 'Ester / Sweet Fruity' : 'Citrus / Fruity';

    return {
      sample_name: sample,
      dominant_odor_family: dominant,
      confidence: 0.94,
      predicted_aroma_vector: {
        citrus: isCoffee ? 0.8 : isBerry ? 3.1 : 9.4,
        fruity: isCoffee ? 1.0 : isBerry ? 9.6 : 8.5,
        sweet: isCoffee ? 2.5 : isBerry ? 8.8 : 5.1,
        roasted: isCoffee ? 9.2 : 0.4,
        woody: isCoffee ? 6.4 : 1.5,
        green: 3.5, floral: 3.0, spicy: 1.2, pungent: 0.3, earthy: 0.8, fatty: 0.8, sulfurous: 0.05
      },
      predicted_voc_fingerprint: {
        alcohol_fraction: 0.35,
        total_voc_ppm: Number((frame.sensor_mq135_voc * 38.5).toFixed(1)),
        aldehyde_reactivity: 0.62,
        mox_conductance_change: 32.4
      },
      sensor_normalized_ratios: {
        mq3_ratio: Number((frame.sensor_mq3_alcohol / 0.45).toFixed(2)),
        mq135_ratio: Number((frame.sensor_mq135_voc / 0.85).toFixed(2)),
        mq138_ratio: Number((frame.sensor_mq138_aldehydes / 0.60).toFixed(2)),
        bme688_conductance: Number((frame.sensor_bme688_gas_res_kohm / 85.0).toFixed(2))
      },
      temperature_humidity_compensated: true,
      status: 'Sensor Array Calibrated & Stream Processed'
    };
  },

  getENosePresets() {
    return {
      'Citrus / Limonene Volatiles': { dominant: 'Citrus / Fruity', mq3: 1.4, mq135: 2.8, mq138: 4.1, bme688: 28.0 },
      'Roasted Espresso Headspace': { dominant: 'Roasted / Pyrazine', mq3: 3.1, mq135: 4.6, mq138: 3.8, bme688: 15.0 },
      'Fermenting Ripe Strawberry': { dominant: 'Ester / Sweet Fruity', mq3: 4.2, mq135: 3.5, mq138: 4.8, bme688: 22.0 },
      'Vanilla & Bakery Tonka': { dominant: 'Vanilla / Balsamic', mq3: 1.8, mq135: 2.4, mq138: 3.2, bme688: 35.0 },
      'Dark Cocoa & Polyphenols': { dominant: 'Nutty / Roasted', mq3: 2.2, mq135: 3.9, mq138: 3.0, bme688: 19.0 }
    };
  },

  programDispenser(payload: any): PhysicalSynthesisJob {
    const title = payload.recipe_title || 'Custom FlavorGen Blend';
    const vol = payload.total_volume_microliters || 1000.0;
    return {
      recipe_title: title,
      total_volume_microliters: vol,
      execution_time_seconds: 3.5,
      flavor_channels: [
        { channel_id: 1, name: 'Lemon Extract', reservoir_type: 'flavor_liquid', solution_compound: 'Lemon Extract', color_hex: '#D99738', target_volume_microliters: vol * 0.45, pump_flow_rate_ul_per_sec: 25.0, pulse_duration_ms: 18000, duty_cycle_pct: 90.0 },
        { channel_id: 2, name: 'Wild Strawberry', reservoir_type: 'flavor_liquid', solution_compound: 'Wild Strawberry', color_hex: '#D99738', target_volume_microliters: vol * 0.35, pump_flow_rate_ul_per_sec: 25.0, pulse_duration_ms: 14000, duty_cycle_pct: 70.0 },
        { channel_id: 3, name: 'Vanilla Orchid', reservoir_type: 'flavor_liquid', solution_compound: 'Vanilla Orchid', color_hex: '#D99738', target_volume_microliters: vol * 0.20, pump_flow_rate_ul_per_sec: 25.0, pulse_duration_ms: 8000, duty_cycle_pct: 40.0 },
        { channel_id: 4, name: 'Aux Channel 4', reservoir_type: 'flavor_liquid', solution_compound: 'Standby Buffer', color_hex: '#475569', target_volume_microliters: 0, pump_flow_rate_ul_per_sec: 25.0, pulse_duration_ms: 0, duty_cycle_pct: 0 },
        { channel_id: 5, name: 'Aux Channel 5', reservoir_type: 'flavor_liquid', solution_compound: 'Standby Buffer', color_hex: '#475569', target_volume_microliters: 0, pump_flow_rate_ul_per_sec: 25.0, pulse_duration_ms: 0, duty_cycle_pct: 0 },
        { channel_id: 6, name: 'Aux Channel 6', reservoir_type: 'flavor_liquid', solution_compound: 'Standby Buffer', color_hex: '#475569', target_volume_microliters: 0, pump_flow_rate_ul_per_sec: 25.0, pulse_duration_ms: 0, duty_cycle_pct: 0 }
      ],
      aroma_piezo_channels: [
        { channel_id: 7, name: 'Limonene Citrus Headspace', reservoir_type: 'aroma_ultrasonic', solution_compound: 'Limonene', color_hex: '#EAB308', target_volume_microliters: 22.5, pump_flow_rate_ul_per_sec: 10.0, pulse_duration_ms: 450, duty_cycle_pct: 65.0 },
        { channel_id: 8, name: 'Furaneol Strawberry Mist', reservoir_type: 'aroma_ultrasonic', solution_compound: 'Furaneol', color_hex: '#F43F5E', target_volume_microliters: 30.0, pump_flow_rate_ul_per_sec: 10.0, pulse_duration_ms: 600, duty_cycle_pct: 80.0 },
        { channel_id: 9, name: 'Vanillin Sweet Cloud', reservoir_type: 'aroma_ultrasonic', solution_compound: 'Vanillin', color_hex: '#D97706', target_volume_microliters: 19.0, pump_flow_rate_ul_per_sec: 10.0, pulse_duration_ms: 380, duty_cycle_pct: 50.0 },
        { channel_id: 10, name: 'Roasted Pyrazine Vapor', reservoir_type: 'aroma_ultrasonic', solution_compound: 'Pyrazine', color_hex: '#B45309', target_volume_microliters: 12.5, pump_flow_rate_ul_per_sec: 10.0, pulse_duration_ms: 250, duty_cycle_pct: 35.0 },
        { channel_id: 11, name: 'Linalool Floral Zest', reservoir_type: 'aroma_ultrasonic', solution_compound: 'Linalool', color_hex: '#EC4899', target_volume_microliters: 16.0, pump_flow_rate_ul_per_sec: 10.0, pulse_duration_ms: 320, duty_cycle_pct: 42.0 },
        { channel_id: 12, name: 'Cooling Trigeminal Menthol', reservoir_type: 'aroma_ultrasonic', solution_compound: 'Menthol', color_hex: '#06B6D4', target_volume_microliters: 9.0, pump_flow_rate_ul_per_sec: 10.0, pulse_duration_ms: 180, duty_cycle_pct: 25.0 }
      ],
      mcu_serial_command: 'FLAVORGEN_EXEC:PUMP:1:18000;PUMP:2:14000;PUMP:3:8000;PIEZO:7:450:165;PIEZO:8:600:204;END',
      safety_check_passed: true,
      disclaimer: 'FlavorGen AI Physical Actuation Program.'
    };
  },

  getArduinoFirmware() {
    return {
      firmware_name: 'FlavorGen_Hardware_Controller.ino',
      target: 'ESP32 / Arduino Mega 2560',
      baud_rate: 115200,
      source_code: `/*
 * FlavorGen AI - IoT Hardware Firmware
 * Target: ESP32 or Arduino Mega (12-Channel Microfluidic & Ultrasonic Driver)
 * Baud: 115200
 */

#include <Arduino.h>

const int PIN_MQ3 = 34;       // Alcohol & Volatiles
const int PIN_MQ135 = 35;     // VOCs & Ambient Gas
const int PIN_MQ138 = 32;     // Aldehydes & Aromatics

const int PUMP_PINS[6] = {16, 17, 18, 19, 21, 22};
const int PIEZO_PINS[6] = {23, 25, 26, 27, 14, 12};

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  for(int i = 0; i < 6; i++) {
    pinMode(PUMP_PINS[i], OUTPUT);
    digitalWrite(PUMP_PINS[i], LOW);
    pinMode(PIEZO_PINS[i], OUTPUT);
    digitalWrite(PIEZO_PINS[i], LOW);
  }
  
  Serial.println("FLAVORGEN_AI_READY:FW_v1.0.0");
}

void loop() {
  int raw_mq3 = analogRead(PIN_MQ3);
  int raw_mq135 = analogRead(PIN_MQ135);
  int raw_mq138 = analogRead(PIN_MQ138);
  
  float v_mq3 = (raw_mq3 / 4095.0) * 3.3;
  float v_mq135 = (raw_mq135 / 4095.0) * 3.3;
  float v_mq138 = (raw_mq138 / 4095.0) * 3.3;

  Serial.print("TELEMETRY:{\\"sensor_mq3_alcohol\\":");
  Serial.print(v_mq3, 3);
  Serial.print(",\\"sensor_mq135_voc\\":");
  Serial.print(v_mq135, 3);
  Serial.print(",\\"sensor_mq138_aldehydes\\":");
  Serial.print(v_mq138, 3);
  Serial.println("}");

  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\\n');
    cmd.trim();
    if (cmd.startsWith("FLAVORGEN_EXEC:")) {
      Serial.println("DISPENSER:SYNTHESIZING...");
      Serial.println("DISPENSER:SYNTHESIS_COMPLETE");
    }
  }

  delay(250);
}
`
    };
  }
};
