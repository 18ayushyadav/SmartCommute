import { FiClock, FiDollarSign, FiNavigation, FiStar } from 'react-icons/fi';
import { FaTrain, FaBus, FaCar, FaWalking } from 'react-icons/fa';
import './RouteCard.css';

const modeIcons = {
  metro: <FaTrain />,
  bus: <FaBus />,
  carpool: <FaCar />,
  walking: <FaWalking />,
};

const modeLabels = {
  metro: 'Metro',
  bus: 'Bus',
  carpool: 'Carpool',
  walking: 'Walking',
};

export default function RouteCard({ route, isRecommended, isFavorite, onFavorite, onHover, highlighted }) {
  return (
    <div
      className={`route-card${highlighted ? ' highlighted' : ''}`}
      style={{ '--route-color': route.color }}
      onMouseEnter={() => onHover(route.id)}
      onMouseLeave={() => onHover(null)}
      id={`route-card-${route.id}`}
    >
      <div className="route-card-header">
        <div className="route-card-title">
          <div className="route-type-dot" style={{ background: route.color }}></div>
          <span className="route-card-label">{route.label}</span>
        </div>
        <div className="route-card-badges">
          {isRecommended && (
            <span className="route-badge recommended">⚡ Recommended</span>
          )}
        </div>
      </div>

      <div className="route-card-stats">
        <div className="route-stat">
          <div className="route-stat-value">{route.time}</div>
          <div className="route-stat-label">Minutes</div>
        </div>
        <div className="route-stat">
          <div className="route-stat-value">₹{route.cost}</div>
          <div className="route-stat-label">Cost</div>
        </div>
        <div className="route-stat">
          <div className="route-stat-value">{route.distance}</div>
          <div className="route-stat-label">KM</div>
        </div>
      </div>

      <div className="route-card-modes">
        {route.modes.map((mode) => (
          <span className="mode-tag" key={mode}>
            {modeIcons[mode]} {modeLabels[mode]}
          </span>
        ))}
      </div>

      <div className="route-card-footer">
        <div className="crowd-indicator">
          <div className={`crowd-dot ${route.crowdLevel.toLowerCase()}`}></div>
          {route.crowdLevel} Crowd
        </div>
        <button
          className={`fav-btn${isFavorite ? ' active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(route.id);
          }}
          aria-label="Favorite route"
          id={`fav-btn-${route.id}`}
        >
          <FiStar fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
}
