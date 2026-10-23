import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, Activity, Droplets, Wind, Sparkles, Terminal, Copy, Check,
  Play, RefreshCw, Gauge, Zap, CheckCircle2, ChevronRight, Sliders, Layers
} from 'lucide-react';
import { api } from '../../services/api';
import { ENoseSensorFrame, ENoseClassification, PhysicalSynthesisJob } from '../../types/hardware';
import { PolarRadarChart } from '../charts/PolarRadarChart';

export const HardwareStudio: React.FC = () => {
  // Gas sensor reading state
  const [sensors, setSensors] = useState<ENoseSensorFrame>({
    sensor_mq3_alcohol: 1.4,
    sensor_mq135_voc: 2.8,
    sensor_mq138_aldehydes: 4.1,
    sensor_bme688_gas_res_kohm: 28.0,
    temperature_c: 23.5,
    relative_humidity_pct: 48.0,
  });

  const [activePreset, setActivePreset] = useState<string>('Citrus / Limonene Volatiles');
  const [classification, setClassification] = useState<ENoseClassification | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [firmwareModalOpen, setFirmwareModalOpen] = useState<boolean>(false);
  const [firmwareCode, setFirmwareCode] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Dispenser state
  const [synthesisJob, setSynthesisJob] = useState<PhysicalSynthesisJob | null>(null);
  const [isActuating, setIsActuating] = useState<boolean>(false);
  const [actuationStep, setActuationStep] = useState<string>('Standby');

  const presets = [
    { name: 'Citrus / Limonene Volatiles', icon: '🍋', mq3: 1.4, mq135: 2.8, mq138: 4.1, bme: 28.0 },
    { name: 'Roasted Espresso Headspace', icon: '☕', mq3: 3.1, mq135: 4.6, mq138: 3.8, bme: 15.0 },
    { name: 'Fermenting Ripe Strawberry', icon: '🍓', mq3: 4.2, mq135: 3.5, mq138: 4.8, bme: 22.0 },
    { name: 'Vanilla & Bakery Tonka', icon: '🍦', mq3: 1.8, mq135: 2.4, mq138: 3.2, bme: 35.0 },
    { name: 'Dark Cocoa & Polyphenols', icon: '🍫', mq3: 2.2, mq135: 3.9, mq138: 3.0, bme: 19.0 },
  ];

  // Auto classify when sensors update
  useEffect(() => {
    let cancel = false;
    const runClassify = async () => {
      try {
        const res = await api.classifyENose(sensors);
        if (!cancel) setClassification(res);
      } catch (e) {
        console.error('Classification error:', e);
      }
    };
    runClassify();
    return () => { cancel = true; };
  }, [sensors]);

  // Initial load: generate default synthesis program
  useEffect(() => {
    const initDispenser = async () => {
      try {
        const job = await api.programDispenser({
          recipe_title: 'Zesty Botanical Accord',
          formulation: [
            { ingredient_name: 'Lemon Extract', proportion: 0.45 },
            { ingredient_name: 'Wild Strawberry', proportion: 0.35 },
            { ingredient_name: 'Vanilla Orchid', proportion: 0.20 },
          ],
          total_volume_microliters: 1000.0,
        });
        setSynthesisJob(job);
      } catch (err) {
        console.error('Dispenser init error:', err);
      }
    };
    initDispenser();
  }, []);

  // Fetch firmware
  const openFirmware = async () => {
    setFirmwareModalOpen(true);
    if (!firmwareCode) {
      try {
        const data = await api.getArduinoFirmware();
        setFirmwareCode(data.source_code);
      } catch (e) {
        setFirmwareCode('// Failed to load firmware from server');
      }
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(firmwareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setActivePreset(preset.name);
    setSensors({
      ...sensors,
      sensor_mq3_alcohol: preset.mq3,
      sensor_mq135_voc: preset.mq135,
      sensor_mq138_aldehydes: preset.mq138,
      sensor_bme688_gas_res_kohm: preset.bme,
    });
  };

  const triggerPhysicalSynthesis = () => {
    if (isActuating) return;
    setIsActuating(true);
    setActuationStep('Priming Peristaltic Micro-Pumps...');

    setTimeout(() => {
      setActuationStep('Metering Liquid Channels (25 µL/sec)...');
    }, 1200);

    setTimeout(() => {
      setActuationStep('Firing 108 kHz Piezo Atomizer Arrays...');
    }, 2800);

    setTimeout(() => {
      setActuationStep('Physical Synthesis Complete!');
      setTimeout(() => {
        setIsActuating(false);
        setActuationStep('Standby');
      }, 1500);
    }, 4500);
  };

  return (
    <div className="space-y-7 max-w-[1440px] mx-auto pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Hardware Bridge & Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3 mt-1">
            <Cpu className="w-7 h-7 text-[#10B981]" />
            IoT E-Nose & Dispenser Hardware Hub
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-3xl">
            Stream physical multi-gas sensor arrays (MQ-3, MQ-135, MQ-138, Bosch BME688) into the AI olfaction engine and trigger microfluidic peristaltic dispensers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openFirmware}
            className="px-4 py-2 rounded-xl bg-[#161920] hover:bg-[#1E232E] border border-white/10 hover:border-emerald-500/40 text-xs font-semibold text-stone-200 hover:text-white flex items-center gap-2 transition-all shadow-sm"
          >
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Arduino / ESP32 Firmware</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left = E-Nose, Right = Dispenser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: ELECTRONIC NOSE (E-NOSE) SENSOR ARRAY      */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-[#161920]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Electronic Nose (E-Nose) Sensor Array</h2>
                  <p className="text-[11px] text-stone-400 font-mono">MOS Volatiles & Air Quality Electrodes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  LIVE STREAMING (4 Hz)
                </span>
              </div>
            </div>

            {/* Quick Calibration Presets */}
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-semibold block mb-2">
                Simulated Headspace Presets:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {presets.map((p) => {
                  const isSelected = activePreset === p.name;
                  return (
                    <button
                      key={p.name}
                      onClick={() => applyPreset(p)}
                      className={`p-2.5 rounded-xl text-left transition-all border text-xs flex items-center gap-2 ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-white shadow-md'
                          : 'bg-[#101217] border-white/[0.06] text-stone-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      <span className="text-base">{p.icon}</span>
                      <span className="truncate font-medium">{p.name.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Real-time Oscilloscope Gauges */}
            <div className="space-y-3.5 pt-2">
              {/* MQ-3: Alcohol & Volatiles */}
              <div className="p-3.5 rounded-2xl bg-[#101217] border border-white/[0.06] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    MQ-3 (Ethanol & Volatiles)
                  </span>
                  <span className="font-mono text-xs text-rose-400 font-bold">
                    {sensors.sensor_mq3_alcohol.toFixed(2)} V
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.05"
                  value={sensors.sensor_mq3_alcohol}
                  onChange={(e) => setSensors({ ...sensors, sensor_mq3_alcohol: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
              </div>

              {/* MQ-135: Total VOCs & Nitrogen Oxides */}
              <div className="p-3.5 rounded-2xl bg-[#101217] border border-white/[0.06] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    MQ-135 (Total VOCs & Sulfides)
                  </span>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    {sensors.sensor_mq135_voc.toFixed(2)} V
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="5.0"
                  step="0.05"
                  value={sensors.sensor_mq135_voc}
                  onChange={(e) => setSensors({ ...sensors, sensor_mq135_voc: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
              </div>

              {/* MQ-138: Aldehydes & Aromatics */}
              <div className="p-3.5 rounded-2xl bg-[#101217] border border-white/[0.06] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    MQ-138 (Aldehydes & Esters)
                  </span>
                  <span className="font-mono text-xs text-emerald-400 font-bold">
                    {sensors.sensor_mq138_aldehydes.toFixed(2)} V
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="5.0"
                  step="0.05"
                  value={sensors.sensor_mq138_aldehydes}
                  onChange={(e) => setSensors({ ...sensors, sensor_mq138_aldehydes: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
              </div>

              {/* BME688: MOX Gas Resistance */}
              <div className="p-3.5 rounded-2xl bg-[#101217] border border-white/[0.06] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    Bosch BME688 (MOX Gas Resistance)
                  </span>
                  <span className="font-mono text-xs text-cyan-400 font-bold">
                    {sensors.sensor_bme688_gas_res_kohm.toFixed(1)} kΩ
                  </span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="80.0"
                  step="0.5"
                  value={sensors.sensor_bme688_gas_res_kohm}
                  onChange={(e) => setSensors({ ...sensors, sensor_bme688_gas_res_kohm: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
                />
              </div>
            </div>

            {/* Environmental Temperature & Humidity Compensation */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#101217] border border-white/[0.06] text-xs">
                <span className="text-[10px] text-stone-500 font-mono block">TEMP COMP</span>
                <span className="font-mono font-bold text-white">{sensors.temperature_c.toFixed(1)} °C</span>
              </div>
              <div className="p-3 rounded-xl bg-[#101217] border border-white/[0.06] text-xs">
                <span className="text-[10px] text-stone-500 font-mono block">HUMIDITY COMP</span>
                <span className="font-mono font-bold text-white">{sensors.relative_humidity_pct.toFixed(0)} % RH</span>
              </div>
            </div>
          </div>

          {/* Real-Time Classification Result */}
          {classification && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#161920] to-[#121419] border border-emerald-500/30 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                    Decoded Sensory Spectrum
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-0.5">
                    {classification.sample_name}
                  </h3>
                  <p className="text-xs text-stone-400 font-medium">
                    Dominant Class: <span className="text-[#E5A852] font-semibold">{classification.dominant_odor_family}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 font-mono block">AI Confidence</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">
                    {(classification.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* 12-D Aroma Radar Chart */}
              <div className="flex justify-center pt-2">
                <PolarRadarChart
                  primaryData={classification.predicted_aroma_vector}
                  title="Decoded Olfactory Signature"
                  primaryColor="#10B981"
                  size={260}
                />
              </div>

              {/* Computed Chemical Volatiles Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2 font-mono">
                <div className="p-2.5 rounded-xl bg-[#101217] border border-white/[0.06]">
                  <span className="text-[10px] text-stone-500 block">TOTAL VOC</span>
                  <span className="text-xs font-bold text-amber-400">
                    {classification.predicted_voc_fingerprint.total_voc_ppm} ppm
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#101217] border border-white/[0.06]">
                  <span className="text-[10px] text-stone-500 block">ALCOHOL</span>
                  <span className="text-xs font-bold text-rose-400">
                    {(classification.predicted_voc_fingerprint.alcohol_fraction * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#101217] border border-white/[0.06]">
                  <span className="text-[10px] text-stone-500 block">ALDEHYDES</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {(classification.predicted_voc_fingerprint.aldehyde_reactivity * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#101217] border border-white/[0.06]">
                  <span className="text-[10px] text-stone-500 block">MOX COND</span>
                  <span className="text-xs font-bold text-cyan-400">
                    Δ{classification.predicted_voc_fingerprint.mox_conductance_change}%
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: 12-CHANNEL MICROFLUIDIC DISPENSER RACK     */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-[#161920]/90 backdrop-blur-xl border border-white/[0.08] shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-[#E5A852] font-bold">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">12-Channel Microfluidic & Piezo Synthesizer</h2>
                  <p className="text-[11px] text-stone-400 font-mono">Peristaltic Metering & 108 kHz Atomizers</p>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-[#E5A852] border border-amber-500/30 font-semibold">
                READY TO ACTUATE
              </span>
            </div>

            {/* Actuation Control Button */}
            <div className="p-4 rounded-2xl bg-[#101217] border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Status: {actuationStep}</span>
                <span className="text-[11px] text-stone-400 font-mono">
                  Standard Flow: 25.0 µL/sec | Total Volume: 1,000 µL
                </span>
              </div>
              <button
                onClick={triggerPhysicalSynthesis}
                disabled={isActuating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D99738] to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 transition-all disabled:opacity-50"
              >
                {isActuating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Actuating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-stone-950" />
                    <span>Trigger Physical Dispense</span>
                  </>
                )}
              </button>
            </div>

            {/* Section 1: Liquid Taste Channels (Peristaltic Pumps) */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                Primary Gustatory Channels (Peristaltic Pumps 1–6):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {synthesisJob?.flavor_channels.map((ch) => (
                  <div
                    key={ch.channel_id}
                    className="p-3 rounded-2xl bg-[#101217] border border-white/[0.06] space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-stone-200 truncate">
                        Ch {ch.channel_id}: {ch.name}
                      </span>
                      <span className="font-mono text-xs font-bold text-[#E5A852]">
                        {ch.target_volume_microliters} µL
                      </span>
                    </div>
                    {/* Animated Fill Bar */}
                    <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#D99738] to-amber-400 rounded-full"
                        animate={{
                          width: isActuating ? ['0%', '100%', '100%'] : `${Math.min(100, ch.target_volume_microliters / 4)}%`,
                        }}
                        transition={{ duration: 3, ease: 'easeInOut' }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-stone-500">
                      <span>Pulse: {ch.pulse_duration_ms} ms</span>
                      <span>Duty: {ch.duty_cycle_pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Ultrasonic Piezo Scent Atomizer Channels */}
            <div className="space-y-3 pt-2 border-t border-white/[0.06]">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold block">
                Ultrasonic Scent Atomizers (Channels 7–12, 108 kHz PWM):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {synthesisJob?.aroma_piezo_channels.map((ch) => (
                  <div
                    key={ch.channel_id}
                    className="p-3 rounded-2xl bg-[#101217] border border-white/[0.06] space-y-1.5"
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-stone-200 truncate">
                        Ch {ch.channel_id}: {ch.name}
                      </span>
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        {ch.pulse_duration_ms} ms
                      </span>
                    </div>
                    {/* Animated Mist Pulse */}
                    <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                        animate={{
                          width: isActuating ? ['0%', `${ch.duty_cycle_pct}%`, '0%'] : `${ch.duty_cycle_pct}%`,
                        }}
                        transition={{ duration: 1.5, repeat: isActuating ? Infinity : 0 }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-stone-500">
                      <span>Carrier: Volatile Mist</span>
                      <span>PWM: {Math.round(ch.duty_cycle_pct * 2.55)}/255</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Serial Command String Preview */}
            <div className="p-3 rounded-xl bg-[#101217] border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">
                MCU Serial Command Packet:
              </span>
              <p className="font-mono text-[11px] text-emerald-400 break-all select-all">
                {synthesisJob?.mcu_serial_command}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Firmware Modal */}
      <AnimatePresence>
        {firmwareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl rounded-3xl bg-[#161920] border border-white/10 shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    FlavorGen_Hardware_Controller.ino (ESP32 / Arduino C++)
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCode}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-xs font-semibold text-emerald-300 flex items-center gap-1.5 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                  <button
                    onClick={() => setFirmwareModalOpen(false)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto rounded-xl bg-[#0D0F12] p-4 border border-white/[0.06] font-mono text-xs text-stone-300 custom-scrollbar">
                <pre className="whitespace-pre">{firmwareCode}</pre>
              </div>

              <div className="text-[11px] text-stone-400 flex justify-between items-center pt-2">
                <span>Pins: MQ-3(GPIO 34), MQ-135(GPIO 35), MQ-138(GPIO 32), Pumps(GPIO 16..22)</span>
                <span className="font-mono text-emerald-400">Baud: 115200</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
