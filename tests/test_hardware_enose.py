"""
Unit & Integration Tests for Electronic Nose (E-Nose) and Microfluidic Dispenser Hardware System.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.hardware_service import HardwareIntegrationService
from backend.app.schemas.hardware import ENoseSensorFrame

client = TestClient(app)


def test_hardware_service_normalization_and_classification():
    service = HardwareIntegrationService()
    
    # Simulate high VOC and alcohol frame (e.g. Citrus/Limonene)
    frame = ENoseSensorFrame(
        sensor_mq3_alcohol=0.75,
        sensor_mq135_voc=2.5,
        sensor_mq138_aldehydes=2.8,
        sensor_bme688_gas_res_kohm=24.0,
        temperature_c=24.0,
        relative_humidity_pct=45.0
    )
    
    res = service.process_sensor_frame(frame)
    assert res.confidence >= 0.60
    assert "fruity" in res.predicted_aroma_vector
    assert res.temperature_humidity_compensated is True
    assert "mq3_ratio" in res.sensor_normalized_ratios


def test_hardware_dispenser_programming():
    service = HardwareIntegrationService()
    formulation = [
        {"ingredient_name": "Strawberry", "proportion": 0.6},
        {"ingredient_name": "Lemon", "proportion": 0.4}
    ]
    
    job = service.program_dispenser_synthesis("Citrus Berry Cooler", formulation, total_volume_ul=1000.0)
    assert job.recipe_title == "Citrus Berry Cooler"
    assert job.total_volume_microliters == 1000.0
    assert len(job.flavor_channels) == 6
    assert len(job.aroma_piezo_channels) == 6
    assert "FLAVORGEN_EXEC:" in job.mcu_serial_command


def test_api_hardware_endpoints():
    # 1. Test Presets
    res_presets = client.get("/api/v1/hardware/enose/presets")
    assert res_presets.status_code == 200
    assert "Citrus / Limonene Volatiles" in res_presets.json()

    # 2. Test Classify
    res_classify = client.post("/api/v1/hardware/enose/classify", json={
        "sensor_mq3_alcohol": 0.9,
        "sensor_mq135_voc": 3.1,
        "sensor_mq138_aldehydes": 3.4,
        "sensor_bme688_gas_res_kohm": 22.0,
        "temperature_c": 22.0,
        "relative_humidity_pct": 50.0
    })
    assert res_classify.status_code == 200
    data = res_classify.json()
    assert "predicted_aroma_vector" in data
    assert data["confidence"] > 0

    # 3. Test Dispenser Program
    res_dispenser = client.post("/api/v1/hardware/dispenser/program", json={
        "recipe_title": "Test Recipe",
        "formulation": [{"ingredient_name": "Vanilla", "proportion": 1.0}],
        "total_volume_microliters": 500.0
    })
    assert res_dispenser.status_code == 200
    disp_data = res_dispenser.json()
    assert disp_data["total_volume_microliters"] == 500.0

    # 4. Test Firmware
    res_fw = client.get("/api/v1/hardware/firmware/arduino")
    assert res_fw.status_code == 200
    assert "FLAVORGEN_AI_READY" in res_fw.json()["source_code"]
