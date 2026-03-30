import { FiMapPin, FiClock, FiUsers, FiCheck } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './CarpoolCard.css';
import carpoolData from '../data/carpools.json';

function CarpoolCardItem({ carpool }) {
  const handleRequest = () => {
    toast.success(`🚗 Ride request sent to ${carpool.name}!`, {
      position: 'bottom-right',
      autoClose: 3000,
      theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light',
    });
  };

  return (
    <div className="carpool-card" id={`carpool-card-${carpool.id}`}>
      <div className="carpool-card-header">
        <div className="carpool-avatar">{carpool.avatar}</div>
        <div className="carpool-info">
          <div className="carpool-name">
            {carpool.name}
            {carpool.verified && (
              <span className="verified-badge" title="Verified">
                <FiCheck />
              </span>
            )}
          </div>
          <div className="carpool-car">{carpool.car}</div>
        </div>
        <div className="carpool-rating">
          <FaStar size={12} /> {carpool.rating}
        </div>
      </div>

      <div className="carpool-details">
        <div className="carpool-detail">
          <div className="carpool-detail-icon"><FiMapPin /></div>
          {carpool.route}
        </div>
        <div className="carpool-detail">
          <div className="carpool-detail-icon"><FiClock /></div>
          Departure: {carpool.time}
        </div>
        <div className="carpool-detail">
          <div className="carpool-detail-icon"><FiUsers /></div>
          <span className="seats-badge">{carpool.seatsAvailable} seat{carpool.seatsAvailable > 1 ? 's' : ''} left</span>
        </div>
      </div>

      <div className="carpool-footer">
        <div className="carpool-cost">
          ₹{carpool.costPerSeat} <span>/seat</span>
        </div>
        <button
          className="request-ride-btn"
          onClick={handleRequest}
          id={`request-ride-${carpool.id}`}
        >
          Request Ride
        </button>
      </div>
    </div>
  );
}

export default function CarpoolSection() {
  return (
    <section className="carpool-section container" id="carpool">
      <h2 className="section-title">🚗 Available Carpools</h2>
      <p className="section-subtitle">Share your ride, save money, reduce emissions</p>
      <div className="carpool-grid">
        {carpoolData.carpools.map((carpool, i) => (
          <CarpoolCardItem
            key={carpool.id}
            carpool={carpool}
          />
        ))}
      </div>
    </section>
  );
}
