import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from 'react-icons/fa'; 
import '../styles/Categories.css';
import AdminHeader from "./AdminMenu";

type Category = {
  name: string;
  description: string | null;
};

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editedDescriptions, setEditedDescriptions] = useState<{ [key: string]: string }>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log("Fetching from:", apiUrl);
    fetch(`${apiUrl}/categories/`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        const initialDescriptions: { [key: string]: string } = {};
        data.forEach((cat: Category) => {
          initialDescriptions[cat.name] = cat.description ?? "";
        });
        setEditedDescriptions(initialDescriptions);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const handleCategorySelect = (categoryName: string) => {
    navigate('/category', { state: { name: categoryName } });
  };

const handleDescriptionChange = (name: string, value: string) => {
  if (value.length > 200) {
    alert("Opis ne smije biti dulji od 200 znakova.");
    return;
  }

  setEditedDescriptions(prev => ({
    ...prev,
    [name]: value,
  }));
};

const handleCreateNew = () => {
  if (!newCategoryName) {
    alert("Naziv kategorije je obavezan.");
    return;
  }

  if (newCategoryName.length > 30) {
    alert("Naziv kategorije ne smije biti dulji od 30 znakova.");
    return;
  }

  if (newCategoryDescription.length > 200) {
    alert("Opis kategorije ne smije biti dulji od 200 znakova.");
    return;
  }

  const apiUrl = process.env.REACT_APP_API_URL;

  const newCategory = {
    name: newCategoryName,
    description: newCategoryDescription || "",
  };

  fetch(`${apiUrl}/categories/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newCategory),
  })
    .then((res) => {
      if (!res.ok) throw new Error('Failed to create new category');

      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setNewCategoryDescription('');
      console.log(`Created new category ${newCategoryName}`);
    })
    .catch((err) => console.error("Error creating category:", err));
};


  const handleSave = (name: string) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const updatedDescription = editedDescriptions[name];

    const updatedCategories = categories.map(cat =>
      cat.name === name ? { ...cat, description: updatedDescription } : cat
    );

    setCategories(updatedCategories);

    fetch(`${apiUrl}/categories/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name, description: updatedDescription }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save');
        console.log(`Saved description for ${name}`);
      })
      .catch((err) => console.error("Error saving description:", err));
  };

  const handleDelete = (name: string) => {
    const apiUrl = process.env.REACT_APP_API_URL;

    const encodedName = encodeURIComponent(name); 
    fetch(`${apiUrl}/categories/${encodedName}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to delete');

        setCategories(prev => prev.filter(cat => cat.name !== name));
        console.log(`Deleted category ${name}`);
      })
      .catch((err) => console.error("Error deleting category:", err));
  };

  return (
    <div>
      <AdminHeader />
      <div className="home-container-c">
        <div className="create-category-form">
          <input
            type="text"
            placeholder="Category Name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="category-input"
          />
          <textarea
            placeholder="Description (optional)"
            value={newCategoryDescription}
            onChange={(e) => setNewCategoryDescription(e.target.value)}
            className="description-textarea"
      	    rows={4}  
          />
          <button onClick={handleCreateNew} className="create-new-button-c">
            CREATE
          </button>
        </div>

        <div className="categories-c">
          <h2 className="categories-title">CATEGORIES</h2>
          <table className="categories-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.name}>
                  <td onClick={() => handleCategorySelect(category.name)} style={{ cursor: 'pointer' }}>
                    <strong>{category.name}</strong>
                  </td>
                  <td>
                    <textarea
                      value={editedDescriptions[category.name] ?? category.description}
                      onChange={(e) => handleDescriptionChange(category.name, e.target.value)}
className="description-textarea"                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
    <button onClick={() => handleSave(category.name)} className="save-button-c">
      SAVE
    </button>
    <button onClick={() => handleDelete(category.name)} className="delete-button-c">
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

export default Categories;
