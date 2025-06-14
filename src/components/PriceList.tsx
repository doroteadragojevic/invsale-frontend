import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import "../styles/pricelist.css";
import AdminHeader from './AdminMenu';

interface UnitDTO {
  idUnit: number;
  name: string;
  description?: string;
}

interface PriceListDTO {
  idPriceList: number;
  idProduct: number;
  productName: string;
  unitId: number;
  unitName: string;
  price: number;
  dateTimeFrom: string;
  dateTimeTo: string;
  discount?: number;
}

interface UpdatePriceListDTO {
  idPriceList?: number;
  idProduct: number;
  unitId: number;
  price: number;
  dateTimeFrom: string;
  dateTimeTo: string;
  discount?: number;
}

const PriceList: React.FC = () => {
  const location = useLocation();
  const { productId: idProduct } = location.state || {};

  const [units, setUnits] = useState<UnitDTO[]>([]);
  const [prices, setPrices] = useState<PriceListDTO[]>([]);
  const [productName, setProductName] = useState<string>('');
  const [formState, setFormState] = useState<Record<number, UpdatePriceListDTO>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idProduct) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [unitsRes, pricesRes] = await Promise.all([
          axios.get<UnitDTO[]>(`${process.env.REACT_APP_API_URL}/products/units/${idProduct}`),
          axios.get<PriceListDTO[]>(`${process.env.REACT_APP_API_URL}/pricelist/${idProduct}`),
        ]);

        const units = unitsRes.data;
        const prices = pricesRes.data;

        setUnits(units);
        setPrices(prices);
        if (prices.length > 0) setProductName(prices[0].productName);

        const initialForm: Record<number, UpdatePriceListDTO> = {};
        units.forEach((unit) => {
          const matchedPrice = prices.find((p) => p.unitId === unit.idUnit);
          initialForm[unit.idUnit] = {
            idPriceList: matchedPrice?.idPriceList,
            idProduct: idProduct,
            unitId: unit.idUnit,
            price: matchedPrice?.price || 0,
            dateTimeFrom: matchedPrice?.dateTimeFrom || new Date().toISOString(),
            dateTimeTo: matchedPrice?.dateTimeTo || new Date().toISOString(),
            discount: matchedPrice?.discount || 0,
          };
        });
        setFormState(initialForm);
      } catch (err) {
        console.error('Error fetching price list data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idProduct]);

  const handleChange = (unitId: number, field: keyof UpdatePriceListDTO, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [unitId]: {
        ...prev[unitId],
        [field]: field === 'price' || field === 'discount' ? parseFloat(value) : value,
      },
    }));
  };

  const handleSave = async (unitId: number) => {
    const data = formState[unitId];

    // Validacija
  if (!data.price || data.price <= 0) {
    alert('Price must be positive.');
    return;
  }
  if (!data.dateTimeFrom || !data.dateTimeTo) {
    alert('Please fill in the start and end date.');
    return;
  }
  if (new Date(data.dateTimeFrom) >= new Date(data.dateTimeTo)) {
    alert('End date cannot be before start date.');
    return;
  }

    try {
      if (data.idPriceList && prices.some((p) => p.unitId === unitId)) {
        await axios.put(`${process.env.REACT_APP_API_URL}/pricelist/`, data);
        alert('Price updated!');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/pricelist/`, data);
        alert('New price added!');
      }
    } catch (err) {
      console.error('Error saving price.', err);
      alert('Error occured.');
    }
  };
  

  if (!idProduct) return <p>Error: product is not selected.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <AdminHeader />
    
    <div className="home-container-pl">
      <h2>Product: {productName}</h2>
      <table className="pl-table">
        <thead>
          <tr>
            <th>Packaging</th>
            <th>Description</th>
            <th>Price</th>
            <th>Discount (%)</th>
            <th>Activation date</th>
            <th>Expiration date</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => {
            const priceData = formState[unit.idUnit];
            const hasPrice = prices.some((p) => p.unitId === unit.idUnit);
            return (
              <tr key={unit.idUnit} className={!hasPrice ? 'bg-red-50' : ''}>
                <td className="border p-2">{unit.name}</td>
                <td className="border p-2">{unit.description || '-'}</td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={priceData?.price ?? ''}
                    onChange={(e) => handleChange(unit.idUnit, 'price', e.target.value)}
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={priceData?.discount ?? ''}
                    onChange={(e) => handleChange(unit.idUnit, 'discount', e.target.value)}
                    className="w-24 border p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="datetime-local"
                    value={format(new Date(priceData?.dateTimeFrom ?? ''), "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => handleChange(unit.idUnit, 'dateTimeFrom', e.target.value)}
                    className="w-48 border p-1"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="datetime-local"
                    value={format(new Date(priceData?.dateTimeTo ?? ''), "yyyy-MM-dd'T'HH:mm")}
                    onChange={(e) => handleChange(unit.idUnit, 'dateTimeTo', e.target.value)}
                    className="w-48 border p-1"
                  />
                </td>
                <td className="border p-2">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => handleSave(unit.idUnit)}
                  >
                    SAVE
                  </button>
                  {!hasPrice && (
                    <div className="text-red-600 text-sm mt-1">No active price!</div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default PriceList;
