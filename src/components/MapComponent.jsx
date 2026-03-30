import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapComponent.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

function FitBounds({ routes }) {
  const map = useMap();
  useEffect(() => {
    if (routes && routes.length > 0) {
      const allCoords = routes.flatMap(r => r.coordinates);
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [routes, map]);
  return null;
}

export default function MapComponent({ routes, source, destination, highlightedRoute }) {
  const center = source?.coords || [28.6139, 77.2090];

  return (
    <div className="map-wrapper">
      <div className="map-overlay">
        <div className="map-overlay-dot"></div>
        Live Map View
      </div>

      <MapContainer
        center={center}
        zoom={13}
        className="map-container"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds routes={routes} />

        {source && (
          <Marker position={source.coords} icon={createCustomIcon('#6366f1')}>
            <Popup>
              <strong>📍 Source</strong><br />{source.name}
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={destination.coords} icon={createCustomIcon('#ef4444')}>
            <Popup>
              <strong>🏁 Destination</strong><br />{destination.name}
            </Popup>
          </Marker>
        )}

        {routes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.coordinates}
            pathOptions={{
              color: route.color,
              weight: highlightedRoute === route.id ? 6 : 3,
              opacity: highlightedRoute && highlightedRoute !== route.id ? 0.3 : 0.9,
              dashArray: route.type === 'cheapest' ? '10 6' : undefined,
            }}
          />
        ))}
      </MapContainer>

      <div className="map-legend">
        <div className="map-legend-title">Route Legend</div>
        {routes.map((route) => (
          <div className="map-legend-item" key={route.id}>
            <div
              className="map-legend-line"
              style={{ background: route.color }}
            ></div>
            {route.label}
          </div>
        ))}
      </div>
    </div>
  );
}
