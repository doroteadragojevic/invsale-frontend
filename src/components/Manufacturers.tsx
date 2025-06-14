import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaSave } from 'react-icons/fa';
import '../styles/Categories.css';
import AdminHeader from "./AdminMenu";

type Producer = {
  idManufacturer: number;
  name: string;
};

const Manufacturers = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [newProducerName, setNewProducerName] = useState('');
  const [editedManufacturers, setEditedManufacturers] = useState<{ [key: number]: string }>({});
  const [nameError, setNameError] = useState("");

  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  // Fetch producers
  useEffect(() => {
    fetch(`${apiUrl}/manufacturer/`)
      .then((res) => res.json())
      .then((data) => setProducers(data))
      .catch((err) => console.error("Error fetching producers:", err));
  }, [apiUrl]);

  const validate = (name : String) => {
    if (!name) {
      setNameError("Manufacturer name is required.");
      return false;
    } else if(name.length >= 50) {
      setNameError("Name cannot be longer than 50 characters.");
      return false;
    } else {
      setNameError("");
      return true;
    }
  }

  const validateUpdate = (name : String) => {
    if (!name) {
      alert("Manufacturer name is required.");
      return false;
    } else if(name.length >= 50) {
      alert("Name cannot be longer than 50 characters.");
      return false;
    } else {
      return true;
    }
  }
  // Create producer
  const handleCreateNew = () => {
    if (!validate(newProducerName)) {
      return;
    } else {
      const newProducer = { name: newProducerName };

    fetch(`${apiUrl}/manufacturer/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProducer),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to create new supplier');
        return res.json(); // očekujemo da API vrati stvoren objekt s id-em
      })
      .then((created) => {
        setProducers(prev => [...prev, created]);
        setNewProducerName('');
      })
      .catch((err) => console.error("Error creating supplier:", err));
    }
  };

  // Edit input change
  const handleManufacturerChange = (id: number, value: string) => {
    setEditedManufacturers(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  // Save edited producer
  const handleSaveEdit = (id: number) => {
    if(!validateUpdate(editedManufacturers[id])){
      return;
    }
    const updatedName = editedManufacturers[id];
    if (!updatedName) return; 

    fetch(`${apiUrl}/manufacturer/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idManufacturer: id, name: updatedName }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update supplier');
        setProducers(prev =>
          prev.map(p => (p.idManufacturer === id ? { ...p, name: updatedName } : p))
        );
        setEditedManufacturers(prev => {
          const newEdits = { ...prev };
          delete newEdits[id];
          return newEdits;
        });
      })
      .catch((err) => console.error("Error updating supplier:", err));
  };

  // Delete producer
  const handleDelete = (id: number) => {
    fetch(`${apiUrl}/manufacturer/${id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete supplier');
        setProducers(prev => prev.filter(p => p.idManufacturer !== id));
      })
      .catch((err) => console.error("Error deleting supplier:", err));
  };

  return (
    <div>
      <AdminHeader />
      <div className="home-container-c">
        <div className="create-category-form">
          <input
            type="text"
            placeholder="Supplier Name"
            value={newProducerName}
            onChange={(e) => setNewProducerName(e.target.value)}
            className="category-input"
          />
          {nameError && <p style={{ color: "red" }}>{nameError}</p>}
          <button onClick={handleCreateNew} className="create-new-button">
            CREATE
          </button>
        </div>

        <div className="categories-c">
          <h2 className="categories-title">Suppliers</h2>
          <table className="categories-table">
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {producers.map((producer) => (
                <tr key={producer.idManufacturer}>
                  <td>
                    <input
                      type="text"
                      value={editedManufacturers[producer.idManufacturer] ?? producer.name}
                      onChange={(e) => handleManufacturerChange(producer.idManufacturer, e.target.value)}
                      className="name-input"
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>

                    <button
                      onClick={() => handleSaveEdit(producer.idManufacturer)}
                      className="save-button-c"
                      title="Save"
                    >
                      SAVE
                    </button>
                    <button
                      onClick={() => handleDelete(producer.idManufacturer)}
                      className="delete-button-c"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Manufacturers;
