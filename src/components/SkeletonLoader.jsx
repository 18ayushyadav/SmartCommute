import './SkeletonLoader.css';

export default function SkeletonLoader({ type = 'card' }) {
  if (type === 'map') {
    return <div className="skeleton skeleton-map"></div>;
  }

  return (
    <div className="skeleton skeleton-card">
      <div className="skeleton-line short"></div>
      <div className="skeleton-line long"></div>
      <div className="skeleton-line medium"></div>
      <div className="skeleton-stats">
        <div className="skeleton-stat-box"></div>
        <div className="skeleton-stat-box"></div>
        <div className="skeleton-stat-box"></div>
      </div>
    </div>
  );
}
