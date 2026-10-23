export interface AromaVector {
  fruity: number;
  floral: number;
  citrus: number;
  woody: number;
  spicy: number;
  earthy: number;
  creamy_vanilla: number;
  roasted_nutty: number;
  green_herbal: number;
  caramel_sweet: number;
  sulfuric_pungent: number;
  fresh_cooling: number;
  [key: string]: number;
}

export interface FlavorVector {
  sweet: number;
  sour: number;
  bitter: number;
  salty: number;
  umami: number;
  astringent: number;
  pungent: number;
  cooling: number;
  creamy_mouthfeel: number;
  acidic_crisp: number;
  [key: string]: number;
}

export interface RadarAxis {
  descriptor: string;
  angle_degrees: number;
  intensity: number;
  lower_bound?: number;
  upper_bound?: number;
  category?: string;
}

export interface RadarPayload {
  axes: RadarAxis[];
  polygon_data: { descriptor: string; value: number }[];
  max_scale: number;
}

export interface IngredientItem {
  id: number;
  name: string;
  category: string;
  botanical_name?: string;
  description?: string;
  aroma_profile: AromaVector;
  flavor_profile: FlavorVector;
  constituents?: Array<{
    compound_name: string;
    concentration_mg_kg: number;
    role?: string;
    chemical_class?: string;
    odor_threshold_ug_l?: number;
  }>;
}

export interface CompoundItem {
  id: number;
  name: string;
  smiles: string;
  cas?: string;
  chemical_class?: string;
  odor_threshold_ug_l?: number;
  molecular_weight: number;
  logp: number;
  tpsa: number;
  volatility_index: number;
  aroma_vector: AromaVector;
  flavor_vector: FlavorVector;
  provenance: string;
}

export interface InteractionInsight {
  type: string;
  description: string;
  affected_descriptors: string[];
  magnitude: number;
}

export interface FormulationItem {
  ingredient_name: string;
  name?: string;
  proportion: number;
  category?: string;
}

export interface CandidateFormulation {
  rank: number;
  formulation: FormulationItem[];
  predicted_aroma: AromaVector;
  predicted_flavor: FlavorVector;
  similarity_to_target: number;
  confidence: number;
  explanation: string;
  potential_constraints: string[];
  interaction_insights?: InteractionInsight[];
}

export interface DeltaSensoryProfile {
  descriptor: string;
  category: string;
  initial_value: number;
  modified_value: number;
  delta: number;
  direction: 'increased' | 'decreased' | 'unchanged';
}

export interface SensoryLabSimulationResponse {
  initial_aroma: AromaVector;
  initial_flavor: FlavorVector;
  modified_aroma: AromaVector;
  modified_flavor: FlavorVector;
  aroma_deltas: DeltaSensoryProfile[];
  flavor_deltas: DeltaSensoryProfile[];
  interaction_insights: InteractionInsight[];
  simulation_notes: string[];
  scientific_disclaimer: string;
}

export interface SimilarityMatchItem {
  name: string;
  category: string;
  score: number;
  sensory_similarity: number;
  chemical_similarity?: number;
  multimodal_similarity?: number;
  explanation: string;
  aroma_profile?: AromaVector;
  flavor_profile?: FlavorVector;
  coordinates_2d?: [number, number];
}

export interface FlavorSpaceNode {
  id: string;
  name: string;
  type: 'ingredient' | 'compound';
  category: string;
  coord_2d: [number, number];
  coord_3d?: [number, number, number];
  aroma_profile: AromaVector;
  flavor_profile: FlavorVector;
}

