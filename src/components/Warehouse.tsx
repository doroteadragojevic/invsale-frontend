import React, { useEffect, useState } from 'react';
import '../styles/warehouse.css';
import AdminHeader from './AdminMenu';

interface WarehouseStatsDTO {
  productId: number;
  productName: string;
  predictedNextMonthDemand: number;
  currentStock: number;
  reorderNeeded: boolean;
}

interface ZoneProductsDTO {
  zone: string;
  productNames: string[];
}

const Warehouse: React.FC = () => {
  const [stats, setStats] = useState<WarehouseStatsDTO[]>([]);
  const [zones, setZones] = useState<ZoneProductsDTO[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/orders/warehouse/stats`)
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);

    fetch(`${apiUrl}/orders/warehouse/zones`)
      .then((res) => res.json())
      .then(setZones)
      .catch(console.error);
  }, []);

  return (
    <div>
      <AdminHeader />
  <div className="warehouse-container">
    <h2>Demand Overview</h2>

    <table className="warehouse-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Predicted Demand (Next Month)</th>
          <th>Stock Level</th>
          <th>Reorder Needed</th>
        </tr>
      </thead>
      <tbody>
        {stats.map((s) => (
          <tr key={s.productId}>
            <td>{s.productName}</td>
            <td>{s.predictedNextMonthDemand}</td>
            <td>{s.currentStock}</td>
            <td style={{ color: s.reorderNeeded ? 'red' : 'green' }}>
              {s.reorderNeeded ? 'YES' : 'NO'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>

    <h3>Optimal Product Placement in Warehouse</h3>
    <div className="warehouse-layout">
  <div className="entrance">Entrance</div>

  <div className="zones-layout">
    {zones.map((zone) => (
      <div className={`zone-block ${zone.zone}`} key={zone.zone}>
        <h4>{zone.zone.charAt(0).toUpperCase() + zone.zone.slice(1)}</h4>
        <ul>
          {zone.productNames.map((name, idx) => (
            <li key={idx}>{name}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
</div>
  </div>
  </div>
);

};

export default Warehouse;
