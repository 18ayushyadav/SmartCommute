import { useState, useEffect } from 'react';
import { FiSearch, FiMapPin, FiNavigation, FiClock, FiX } from 'react-icons/fi';
import MapComponent from './MapComponent';
import RouteCard from './RouteCard';
import SkeletonLoader from './SkeletonLoader';
import routesData from '../data/routes.json';
import './RoutePlanner.css';

const RECENT_KEY = 'smartcommute_recent';
const FAV_KEY = 'smartcommute_favorites';

export default function RoutePlanner() {
  const [source, setSource] = useState('Connaught Place');
  const [destination, setDestination] = useState('Kashmere Gate');
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
    // comfort = least crowded
    const crowdOrder = { low: 0, medium: 1, high: 2 };
    return routeList.reduce((a, b) =>
      crowdOrder[a.crowdLevel.toLowerCase()] < crowdOrder[b.crowdLevel.toLowerCase()] ? a : b
    ).id;
  };

  const handleSearch = () => {
    if (!source.trim() || !destination.trim()) return;

    setLoading(true);
    setSearched(false);

    // Save to recent
    const searchEntry = `${source} → ${destination}`;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== searchEntry);
      return [searchEntry, ...filtered].slice(0, 5);
    });

    // Simulate loading
    setTimeout(() => {
      let sortedRoutes = [...routesData.routes];

      if (filter === 'cost') {
        sortedRoutes.sort((a, b) => a.cost - b.cost);
      } else if (filter === 'time') {
        sortedRoutes.sort((a, b) => a.time - b.time);
      }

      setRoutes(sortedRoutes);
      setLoading(false);
      setSearched(true);
    }, 1500);
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
              placeholder="Enter source location"
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
              placeholder="Enter destination"
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

            <button className="search-btn" onClick={handleSearch} id="search-btn">
              <FiSearch /> Find Routes
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
                source={routesData.locations.source}
                destination={routesData.locations.destination}
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
