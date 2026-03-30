import { useState, useEffect } from 'react';
import { FiSearch, FiMapPin, FiNavigation, FiClock, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import MapComponent from './MapComponent';
import RouteCard from './RouteCard';
import SkeletonLoader from './SkeletonLoader';
import './RoutePlanner.css';

const RECENT_KEY = 'smartcommute_recent';
const FAV_KEY = 'smartcommute_favorites';

async function geocode(address) {
  const targetUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
  const res = await fetch(proxyUrl);
  const data = await res.json();
  if (data && data.length > 0) {
    return {
      name: data[0].display_name.split(',')[0],
      coords: [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    };
  }
  return null;
}

async function getRoute(srcCoords, destCoords) {
  try {
    const srcLonLat = `${srcCoords[1]},${srcCoords[0]}`;
    const destLonLat = `${destCoords[1]},${destCoords[0]}`;
    
    // Direct call, OSRM supports CORS natively
    const url = `https://router.project-osrm.org/route/v1/driving/${srcLonLat};${destLonLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationMin = Math.round(route.duration / 60);
      return { coordinates, distanceKm, durationMin };
    }
  } catch (err) {
    console.warn("OSRM routing failed (possibly rate limit), falling back to straight-line math.", err);
  }

  // Fallback: Haversine distance and straight-line points
  const toRad = p => p * Math.PI / 180;
  const R = 6371; // Earth's radius in km
  
  const dLat = toRad(destCoords[0] - srcCoords[0]);
  const dLon = toRad(destCoords[1] - srcCoords[1]);
  const lat1 = toRad(srcCoords[0]);
  const lat2 = toRad(destCoords[0]);

  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  
  const distRaw = (R * c);
  const distanceKm = distRaw.toFixed(1);
  const durationMin = Math.round(distRaw * 1.5); // assume ~40km/h average straight line

  const midLat = (srcCoords[0] + destCoords[0]) / 2;
  const midLon = (srcCoords[1] + destCoords[1]) / 2;

  return {
    coordinates: [srcCoords, [midLat, midLon], destCoords],
    distanceKm: distanceKm,
    durationMin: durationMin > 0 ? durationMin : 5
  };
}

export default function RoutePlanner() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [resolvedSource, setResolvedSource] = useState(null);
  const [resolvedDestination, setResolvedDestination] = useState(null);
  
  const [optimizeMode, setOptimizeMode] = useState('time');
  const [filter, setFilter] = useState('none');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [highlightedRoute, setHighlightedRoute] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(FAV_KEY)) || [];
    } catch { return []; }
  });
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(FAV_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentSearches));
  }, [recentSearches]);

  const getRecommendedId = (routeList) => {
    if (optimizeMode === 'time') {
      return routeList.reduce((a, b) => a.time < b.time ? a : b).id;
    }
    if (optimizeMode === 'cost') {
      return routeList.reduce((a, b) => a.cost < b.cost ? a : b).id;
    }
    const crowdOrder = { low: 0, medium: 1, high: 2 };
    return routeList.reduce((a, b) =>
      crowdOrder[a.crowdLevel.toLowerCase()] < crowdOrder[b.crowdLevel.toLowerCase()] ? a : b
    ).id;
  };

  const handleSearch = async () => {
    if (!source.trim() || !destination.trim()) return;

    setLoading(true);
    setSearched(false);

    // Save to recent
    const searchEntry = `${source} → ${destination}`;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== searchEntry);
      return [searchEntry, ...filtered].slice(0, 5);
    });

    try {
      // 1. Geocode
      const srcLoc = await geocode(source);
      const destLoc = await geocode(destination);

      if (!srcLoc || !destLoc) {
        toast.error('Could not find one or both locations. Try being more specific.', { theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light' });
        setLoading(false);
        return;
      }

      setResolvedSource(srcLoc);
      setResolvedDestination(destLoc);

      // 2. Get route
      const routeData = await getRoute(srcLoc.coords, destLoc.coords);

      if (!routeData) {
         toast.error('Could not find a valid route between these locations.', { theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light' });
         setLoading(false);
         return;
      }

      const { coordinates, distanceKm, durationMin } = routeData;
      const baseDist = parseFloat(distanceKm);
      const baseTime = durationMin;

      // Ensure minimum values
      const fastestTime = Math.max(baseTime, 5);
      const fastestCost = Math.max(Math.round(baseDist * 15), 10);
      
      let generatedRoutes = [
        {
          id: 1,
          type: "fastest",
          label: "Fastest Route",
          time: fastestTime,
          cost: fastestCost,
          distance: baseDist,
          crowdLevel: "High",
          modes: ["metro", "walking"],
          color: "#6366f1",
          coordinates: coordinates
        },
        {
          id: 2,
          type: "cheapest",
          label: "Cheapest Route",
          time: Math.max(Math.round(baseTime * 1.4), 8),
          cost: Math.max(Math.round(baseDist * 5), 5),
          distance: baseDist,
          crowdLevel: "Medium",
          modes: ["bus", "walking"],
          color: "#10b981",
          coordinates: coordinates
        },
        {
          id: 3,
          type: "leastCrowded",
          label: "Least Crowded",
          time: Math.max(Math.round(baseTime * 1.1), 6),
          cost: Math.max(Math.round(baseDist * 25), 20),
          distance: baseDist,
          crowdLevel: "Low",
          modes: ["carpool", "walking"],
          color: "#f59e0b",
          coordinates: coordinates
        }
      ];

      if (filter === 'cost') {
        generatedRoutes.sort((a, b) => a.cost - b.cost);
      } else if (filter === 'time') {
        generatedRoutes.sort((a, b) => a.time - b.time);
      }

      setRoutes(generatedRoutes);
      setLoading(false);
      setSearched(true);

    } catch (err) {
      console.error(err);
      toast.error('An error occurred while fetching route data.', { theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light' });
      setLoading(false);
    }
  };

  const handleRecentClick = (search) => {
    const [src, dest] = search.split(' → ');
    setSource(src);
    setDestination(dest);
  };

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_KEY);
  };

  const recommendedId = routes.length > 0 ? getRecommendedId(routes) : null;

  return (
    <section className="planner-section container" id="planner">
      <div className="planner-hero">
        <h1>Plan Your Commute</h1>
        <p>Find the smartest route for your daily commute with AI-powered recommendations</p>
      </div>

      <div className="planner-controls">
        <div className="planner-inputs">
          <div className="input-group">
            <label htmlFor="source-input">From</label>
            <FiMapPin className="input-icon" />
            <input
              id="source-input"
              type="text"
              placeholder="Enter source location (e.g. Times Square)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label htmlFor="dest-input">To</label>
            <FiNavigation className="input-icon" />
            <input
              id="dest-input"
              type="text"
              placeholder="Enter destination (e.g. Central Park)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </div>
        </div>

        <div className="planner-actions">
          <div className="optimize-toggles">
            <button
              className={`optimize-btn${optimizeMode === 'time' ? ' active' : ''}`}
              onClick={() => setOptimizeMode('time')}
              id="opt-time"
            >
              ⚡ Optimize for Time
            </button>
            <button
              className={`optimize-btn${optimizeMode === 'cost' ? ' active' : ''}`}
              onClick={() => setOptimizeMode('cost')}
              id="opt-cost"
            >
              💰 Optimize for Cost
            </button>
            <button
              className={`optimize-btn${optimizeMode === 'comfort' ? ' active' : ''}`}
              onClick={() => setOptimizeMode('comfort')}
              id="opt-comfort"
            >
              🛋️ Optimize for Comfort
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              className="filter-dropdown"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              id="filter-dropdown"
            >
              <option value="none">Sort by...</option>
              <option value="cost">Lowest Cost</option>
              <option value="time">Shortest Time</option>
            </select>

            <button className="search-btn" onClick={handleSearch} id="search-btn" disabled={loading}>
              <FiSearch /> {loading ? 'Searching...' : 'Find Routes'}
            </button>
          </div>
        </div>
      </div>

      {(loading || searched) && (
        <div className="planner-content">
          <div className="planner-map-col">
            {loading ? (
              <SkeletonLoader type="map" />
            ) : (
              <MapComponent
                routes={routes}
                source={resolvedSource}
                destination={resolvedDestination}
                highlightedRoute={highlightedRoute}
              />
            )}
          </div>

          <div className="planner-routes-col">
            <div className="routes-header">
              <div>
                <h2 className="section-title">Routes Found</h2>
                <p className="section-subtitle">{routes.length} options available</p>
              </div>
            </div>

            {loading ? (
              <>
                <SkeletonLoader type="card" />
                <SkeletonLoader type="card" />
                <SkeletonLoader type="card" />
              </>
            ) : (
              routes.map((route, i) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  isRecommended={route.id === recommendedId}
                  isFavorite={favorites.includes(route.id)}
                  onFavorite={toggleFavorite}
                  onHover={setHighlightedRoute}
                  highlighted={highlightedRoute === route.id}
                />
              ))
            )}
          </div>
        </div>
      )}

      {recentSearches.length > 0 && (
        <div className="recent-searches">
          <div className="routes-header">
            <div>
              <h3 className="section-title" style={{ fontSize: '1.1rem' }}>Recent Searches</h3>
            </div>
            <button className="clear-recent" onClick={clearRecent}>Clear all</button>
          </div>
          <div className="recent-tags">
            {recentSearches.map((search, i) => (
              <button
                className="recent-tag"
                key={i}
                onClick={() => handleRecentClick(search)}
                id={`recent-${i}`}
              >
                <FiClock size={12} /> {search}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
