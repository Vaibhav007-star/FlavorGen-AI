export interface ENoseSensorFrame {
  timestamp_ms?: number;
  sensor_mq3_alcohol: number;
  sensor_mq135_voc: number;
  sensor_mq138_aldehydes: number;
  sensor_bme688_gas_res_kohm: number;
  temperature_c: number;
  relative_humidity_pct: number;
}

export interface ENoseClassification {
  sample_name: string;
  dominant_odor_family: string;
  confidence: number;
  predicted_aroma_vector: Record<string, number>;
  predicted_voc_fingerprint: {
    alcohol_fraction: number;
    total_voc_ppm: number;
    aldehyde_reactivity: number;
    mox_conductance_change: number;
  };
  sensor_normalized_ratios: {
    mq3_ratio: number;
    mq135_ratio: number;
    mq138_ratio: number;
    bme688_conductance: number;
  };
  temperature_humidity_compensated: boolean;
  status: string;
}

export interface DispenserChannelConfig {
  channel_id: number;
  name: string;
  reservoir_type: 'flavor_liquid' | 'aroma_ultrasonic';
  solution_compound: string;
  color_hex: string;
  target_volume_microliters: number;
  pump_flow_rate_ul_per_sec: number;
  pulse_duration_ms: number;
  duty_cycle_pct: number;
}

export interface PhysicalSynthesisJob {
  recipe_title: string;
  total_volume_microliters: number;
  execution_time_seconds: number;
  flavor_channels: DispenserChannelConfig[];
  aroma_piezo_channels: DispenserChannelConfig[];
  mcu_serial_command: string;
  safety_check_passed: boolean;
  disclaimer: string;
}
