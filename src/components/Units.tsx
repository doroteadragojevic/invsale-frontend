import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from 'react-icons/fa';
import '../styles/Units.css';
import AdminHeader from "./AdminMenu";

type Unit = {
  idUnit: number;
  name: string;
  description: string | null;
};

const Units = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [editedDescriptions, setEditedDescriptions] = useState<{ [key: string]: string }>({});
  const [editedNames, setEditedNames] = useState<{ [key: string]: string }>({});
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitDescription, setNewUnitDescription] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    fetch(`${apiUrl}/units/`)
      .then((res) => res.json())
      .then((data) => {
        setUnits(data);
        const initialDescriptions: { [key: string]: string } = {};
        const initialNames: { [key: string]: string } = {};
        data.forEach((unit: Unit) => {
          initialDescriptions[unit.idUnit] = unit.description ?? "";
          initialNames[unit.idUnit] = unit.name ?? "";
        });
        setEditedDescriptions(initialDescriptions);
        setEditedNames(initialNames);
      })
      .catch((err) => console.error("Error fetching units:", err));
  }, []);

  const validate = (idUnit: number) => {
    const name = editedNames[idUnit] ?? "";
    const description = editedDescriptions[idUnit] ?? "";
    const newErrors: { [key: string]: string } = {};

    if (!name) newErrors[idUnit] = "Name cannot be empty.";
    else if (name.length > 20) newErrors[idUnit] = "Name cannot exceed 20 characters.";

    if (description.length > 50) newErrors[idUnit] = "Description cannot exceed 50 characters.";

    setErrors((prev) => ({ ...prev, [idUnit]: newErrors[idUnit] }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNameChange = (idUnit: number, value: string) => {
    setEditedNames((prev) => ({
      ...prev,
      [idUnit]: value,
    }));
    validate(idUnit);
  };

  const handleDescriptionChange = (idUnit: number, value: string) => {
    setEditedDescriptions((prev) => ({
      ...prev,
      [idUnit]: value,
    }));
    validate(idUnit);
  };

  const handleSave = (idUnit: number) => {
    if (!validate(idUnit)) return;

    const apiUrl = process.env.REACT_APP_API_URL;
    const updatedName = editedNames[idUnit];
    const updatedDescription = editedDescriptions[idUnit];

    fetch(`${apiUrl}/units/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idUnit, name: updatedName, description: updatedDescription }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save');
        console.log(`Saved name and description for unit ${updatedName}`);
      })
      .catch((err) => console.error("Error saving name and description:", err));
  };

  const handleDelete = (idUnit: number) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    fetch(`${apiUrl}/units/${idUnit}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete');
        setUnits(prev => prev.filter(unit => unit.idUnit !== idUnit));
      })
      .catch((err) => console.error("Error deleting unit:", err));
  };

  return (
    <div>
      <AdminHeader />
    <div className="units">
      <h2 className="units-title">Packaging</h2>
      <table className="units-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => (
            <tr key={unit.idUnit}>
              <td>
                <input
                  type="text"
                  value={editedNames[unit.idUnit] ?? unit.name}
                  onChange={(e) => handleNameChange(unit.idUnit, e.target.value)}
                  className="unit-name-input"
                />
                {errors[unit.idUnit] && <p className="error-message">{errors[unit.idUnit]}</p>}
              </td>
              <td>
                <input
                  type="text"
                  value={editedDescriptions[unit.idUnit] ?? unit.description}
                  onChange={(e) => handleDescriptionChange(unit.idUnit, e.target.value)}
                  className="description-input"
                />
              </td>
              <td>
                <button
                  onClick={() => handleSave(unit.idUnit)}
                  className="save-button-u"
                  disabled={!!errors[unit.idUnit]}
                >
                  SAVE
                </button>
              </td>
              <td>
                <button
                  onClick={() => handleDelete(unit.idUnit)}
                  className="delete-button-u"
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default Units;
