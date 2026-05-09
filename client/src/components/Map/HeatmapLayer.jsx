import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ zones }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !zones?.length) return;

    // Defer to ensure map is fully initialized
    const timer = setTimeout(() => {
      if (typeof L.heatLayer !== 'function') return;

      const points = zones
        .filter(z => z.current?.sst_anomaly > 0)
        .map(z => [z.lat, z.lng, Math.max(0.1, z.current.sst_anomaly)]);

      if (points.length === 0) return;

      try {
        const heat = L.heatLayer(points, {
          radius: 40,
          blur: 30,
          maxZoom: 10,
          max: 2.5,
          gradient: {
            0.0: '#0000ff',
            0.3: '#00d4aa',
            0.5: '#ffd93d',
            0.7: '#ff9f43',
            1.0: '#ff3b5c'
          }
        });
        heat.addTo(map);

        return () => {
          try { map.removeLayer(heat); } catch {}
        };
      } catch (err) {
        console.warn('Heatmap error:', err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [map, zones]);

  return null;
}
