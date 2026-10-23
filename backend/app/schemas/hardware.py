"""
Pydantic Schemas for Hardware E-Nose Ingestion and Microfluidic Dispenser Actuation.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field


class ENoseSensorFrame(BaseModel):
    timestamp_ms: Optional[int] = Field(default=None, description="Millisecond timestamp from MCU clock")
    sensor_mq3_alcohol: float = Field(..., description="MQ-3 Analog voltage / raw ADC (0.0 - 5.0V)")
    sensor_mq135_voc: float = Field(..., description="MQ-135 Air Quality / VOCs voltage")
    sensor_mq138_aldehydes: float = Field(..., description="MQ-138 Aldehydes & Aromatics voltage")
    sensor_bme688_gas_res_kohm: float = Field(default=50.0, description="Bosch BME688 MOX gas resistance in kOhm")
    temperature_c: float = Field(default=22.0, description="Ambient temperature in Celsius")
    relative_humidity_pct: float = Field(default=50.0, description="Ambient relative humidity (%)")


class ENoseClassificationResponse(BaseModel):
    sample_name: str
    dominant_odor_family: str
    confidence: float
    predicted_aroma_vector: Dict[str, float]
    predicted_voc_fingerprint: Dict[str, float]
    sensor_normalized_ratios: Dict[str, float]
    temperature_humidity_compensated: bool
    status: str


class DispenserChannelConfig(BaseModel):
    channel_id: int
    name: str
    reservoir_type: str  # "flavor_liquid" or "aroma_ultrasonic"
    solution_compound: str
    color_hex: str
    target_volume_microliters: float
    pump_flow_rate_ul_per_sec: float = 25.0  # standard micro-peristaltic flow rate
    pulse_duration_ms: int
    duty_cycle_pct: float


class PhysicalSynthesisJobResponse(BaseModel):
    recipe_title: str
    total_volume_microliters: float
    execution_time_seconds: float
    flavor_channels: List[DispenserChannelConfig]
    aroma_piezo_channels: List[DispenserChannelConfig]
    mcu_serial_command: str
    safety_check_passed: bool
    disclaimer: str
