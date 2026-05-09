import { useState, useCallback, useRef } from 'react';
import { getTimeSeries } from '../services/api';

export default function useReadings() {
  const [timeSeries, setTimeSeries] = useState({});
  const [loading, setLoading] = useState(false);
  const cache = useRef({});

  const fetchTimeSeries = useCallback(async (zoneId, metric = 'sst', days = 30) => {
    const cacheKey = `${zoneId}-${metric}-${days}`;
    if (cache.current[cacheKey]) {
      setTimeSeries(prev => ({ ...prev, [cacheKey]: cache.current[cacheKey] }));
      return cache.current[cacheKey];
    }

    setLoading(true);
    try {
      const numericZone = typeof zoneId === 'string' ? parseInt(zoneId.replace(/\D/g, '')) : zoneId;
      const data = await getTimeSeries(numericZone, metric, days);
      if (data && data.timestamps && data.values) {
        // Transform to chart-friendly format: [{date, value}, ...]
        const points = data.timestamps.map((ts, i) => ({
          date: new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          hour: new Date(ts).getHours(),
          value: data.values[i],
          raw_ts: ts,
        }));
        // Downsample to daily averages for 30-day view
        const daily = {};
        points.forEach(p => {
          if (!daily[p.date]) daily[p.date] = { date: p.date, values: [], sum: 0, count: 0 };
          daily[p.date].values.push(p.value);
          daily[p.date].sum += p.value;
          daily[p.date].count++;
        });
        const result = Object.values(daily).map(d => ({
          date: d.date,
          value: +(d.sum / d.count).toFixed(4),
          min: +Math.min(...d.values).toFixed(4),
          max: +Math.max(...d.values).toFixed(4),
        }));
        cache.current[cacheKey] = result;
        setTimeSeries(prev => ({ ...prev, [cacheKey]: result }));
        return result;
      }
    } catch (err) {
      console.warn(`Failed to fetch timeseries: ${zoneId}/${metric}`, err);
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  const clearCache = useCallback(() => {
    cache.current = {};
    setTimeSeries({});
  }, []);

  return { timeSeries, loading, fetchTimeSeries, clearCache };
}
