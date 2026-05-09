import React from 'react';
import TimeSeriesChart from './TimeSeriesChart';
import AlertVolumeBar from './AlertVolumeBar';
import NoiseReductionDonut from './NoiseReductionDonut';
import ConfidenceRadial from './ConfidenceRadial';
import AgentActivityBar from './AgentActivityBar';
import '../../styles/charts.css';

export default function ChartsStrip() {
  return (
    <div className="charts-strip" id="charts-strip">
      <TimeSeriesChart />
      <AlertVolumeBar />
      <NoiseReductionDonut />
      <ConfidenceRadial />
      <AgentActivityBar />
    </div>
  );
}
