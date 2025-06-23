import { useState, useEffect } from "react";
import '../styles/create-product.css';
import { useNavigate } from "react-router-dom";
import AdminHeader from "./AdminMenu";

export default function CreateProduct() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [threshold, setThreshold] = useState(0);
  const [ingredients, setIngredients] = useState(new Set());
  const [manufacturerId, setManufacturerId] = useState(null);
  const [image, setImage] = useState(null);

  const [manufacturers, setManufacturers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedUnits, setSelectedUnits] = useState([]);

  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");

  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitDescription, setNewUnitDescription] = useState("");

  const [priceLists, setPriceLists] = useState([]);


  const [productNameError, setProductNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [thresholdError, setThresholdError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;

        const [manufacturersRes, categoriesRes, unitsRes] = await Promise.all([
          fetch(`${apiUrl}/manufacturer/`),
          fetch(`${apiUrl}/categories/`),
          fetch(`${apiUrl}/units/`)
        ]);

        if (manufacturersRes.ok) {
          setManufacturers(await manufacturersRes.json());
        }
        if (categoriesRes.ok) {
          setCategories(await categoriesRes.json());
        }
        if (unitsRes.ok) {
          setUnits(await unitsRes.json());
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const validateFields = () => {
    let isValid = true;

    if (!productName.trim()) {
      setProductNameError("Product name is required.");
      isValid = false;
    } else if (productName.length > 50) {
      setProductNameError("Product name cannot exceed 50 characters.");
      isValid = false;
    } else {
      setProductNameError("");
    }

    if (description.length > 250) {
      setDescriptionError("Description cannot exceed 250 characters.");
      isValid = false;
    } else if (!description.trim()) {
      setProductNameError("Description is required.");
      isValid = false;
    }else {
      setDescriptionError("");
    }

    if (quantity < 0) {
      setQuantityError("Quantity cannot be negative.");
      isValid = false;
    } else {
      setQuantityError("");
    }

    if (threshold <= 0) {
      setThresholdError("Threshold must be greater than 0.");
      isValid = false;
    } else {
      setThresholdError("");
    }

    if (!image) {
      alert("Image is required.");
      isValid = false;
    } 

    return isValid;
  };

  const handleGoToStep2 = () => {
    if (validateFields()) {
      setStep(2);
    } else {
      console.log("Form is invalid, check errors.");
    }
  };

  const handleGoToStep3 = () => {
    if (validateFields()) {

      if(selectedUnits.length == 0) {
        setStep(2);
        alert("Please mark the unit.");
      } else {

      const initialPriceLists = selectedUnits.map(unit => ({
        idUnit: unit.idUnit,
        name: unit.name, 
        price: "",
        dateTimeFrom: "",
        dateTimeTo: "",
        discount: ""
  
      }));
      setPriceLists(initialPriceLists);
      setStep(3);
    }
    } else {
      console.log("Form is invalid, check errors.");
    }
    
  };

  const handleCheckboxChange = (id, setFunction) => {
    setFunction(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(item => item !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleUnitCheckboxChange = (unit) => {
    setSelectedUnits(prevSelected => {
      const exists = prevSelected.find(u => u.idUnit === unit.idUnit);
      if (exists) {
        return prevSelected.filter(u => u.idUnit !== unit.idUnit);
      } else {
        return [...prevSelected, unit];
      }
    });
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/categories/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName,
          description: newCategoryDescription || null
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories(prev => [...prev, newCategory]);
        setSelectedCategories(prev => [...prev, newCategory.name]);
        setNewCategoryName("");
        setNewCategoryDescription("");
      } else {
        alert("Error adding category.");
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const handleAddNewUnit = async () => {
    if (!newUnitName.trim()) return;
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await fetch(`${apiUrl}/units/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUnitName,
          description: newUnitDescription || null
        }),
      });

      if (response.ok) {
        const newUnit = await response.json();
        setUnits(prev => [...prev, newUnit]);
        setSelectedUnits(prev => [...prev, newUnit]);
        setNewUnitName("");
        setNewUnitDescription("");
      } else {
        alert("Error adding packaging.");
      }
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  const validatePriceLists = () => {
    let isValid = true;
  
    priceLists.forEach((item, index) => {
      if (!item.price || item.price <= 0) {
        alert(`Price is required and must be greater than 0 for unit ${item.name}`);
        isValid = false;
      }
  
      if (!item.dateTimeFrom) {
        alert(`Start date is required for unit ${item.name}`);
        isValid = false;
      }
  
      if (!item.dateTimeTo) {
        alert(`End date is required for unit ${item.name}`);
        isValid = false;
      }
  
      if (item.dateTimeFrom && item.dateTimeTo && new Date(item.dateTimeFrom) >= new Date(item.dateTimeTo)) {
        alert(`Start date must be before end date for unit ${item.name}`);
        isValid = false;
      }
    });
  
    return isValid;
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validatePriceLists()) {
      const productData = {
        name: productName,
        description,
        quantityOnStock: quantity,
        reorderNotificationThreshold: threshold,
        ingredients: Array.from(ingredients),
        idManufacturer: manufacturerId || null,
        imageData: image ? await convertImageToBase64(image) : null,
        categoryIds: Array.from(selectedCategories),
        unitIds: selectedUnits.map(u => u.idUnit)
      };
  
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const response = await fetch(`${apiUrl}/products/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
  
        if (response.ok) {
          const product = await response.json();
  
          const formData = new FormData();
          formData.append('image', image);
        const responseImage = await fetch(`${apiUrl}/products/img/${product.idProduct}`, {
          method: "POST",
          body: formData,
        });
        
        if (responseImage.ok) {
          alert("Image added!");
        } else {
          alert("Error while uploading picture.");
        }
  
        for (let i = 0; i < productData.categoryIds.length; i++) {
          const apiUrl = process.env.REACT_APP_API_URL;
          const responseCategory = await fetch(`${apiUrl}/products/${product.idProduct}/category/add/${productData.categoryIds[i]}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
  
        if (responseCategory.ok) {
          alert("Category added!");
        } else {
          alert("Error while addind category.");
        }
  
        }
  
        for (let i = 0; i < productData.unitIds.length; i++) {
          const apiUrl = process.env.REACT_APP_API_URL;
          const responseUnit = await fetch(`${apiUrl}/products/${product.idProduct}/unit/add/${productData.unitIds[i]}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });
  
        if (responseUnit.ok) {
          alert("Unit added!");
        } else {
          alert("Error while adding unit.");
        }
        
        }
  
        for (const item of priceLists) {
          await fetch(`${apiUrl}/pricelist/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              idProduct: product.idProduct,
              unitId: item.idUnit,
              price: parseFloat(item.price),
              dateTimeFrom: item.dateTimeFrom,
              dateTimeTo: item.dateTimeTo,
              discount: item.discount
            }),
          });
        }
  
  
  
          alert("Product is successfuly added!");
          navigate('/admin');
        } else {
          alert("Error while creating product.");
        }
  
      
  
      } catch (error) {
        console.error("Error while sending data:", error);
        alert("Error. Please try again.");
      }
      console.log("Form is valid, sending data...");
    } else {
      console.log("Form is invalid, check errors.");
    }
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div>
      <AdminHeader />
    <div className="create-product-container">
      <h2>Create Product</h2>
      <form onSubmit={handleSubmit}>
        
        {step === 1 && (
          <div>
            <div style={{
  width: '600px',
  height: '20px',
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '20px'
}}>
            <div style={{
  width: '200px',
  height: '5px',
  backgroundColor: '#eee',
  borderRadius: '10px',
  overflow: 'hidden'
}}>
  <div style={{
    width: '33%',
    height: '100%',
    backgroundColor: '#687616'
  }}></div>
  </div>
</div>
            <div>
              <label>Product Name</label>
              <input type="text" value={productName} onChange={e => setProductName(e.target.value)} required />
              {productNameError && <p style={{ color: "red" }}>{productNameError}</p>}
            </div>

            <div>
              <label>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} required></textarea>
              {descriptionError && <p style={{ color: "red" }}>{descriptionError}</p>}
            </div>

            <div>
              <label>Quantity on stock</label>
              <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="0" required />
              {quantityError && <p style={{ color: "red" }}>{quantityError}</p>}
            </div>

            <div>
              <label>Low stock limit</label>
              <input type="number" value={threshold} onChange={e => setThreshold(Number(e.target.value))} min="0" required />
              {thresholdError && <p style={{ color: "red" }}>{thresholdError}</p>}
            </div>

            <div>
              <label>Ingredients</label>
              <input
                type="text"
                onChange={e => {
                  const inputValue = e.target.value;
                  const newIngredients = inputValue.split(",").map(ing => ing.trim()).filter(Boolean);
                  setIngredients(new Set(newIngredients));
                }}
                placeholder="Add ingredients, separated by commas"
              />
              <ul>
                {Array.from(ingredients).map(ingredient => (
                  <li key={ingredient}>
                    {ingredient}
                    <button type="button" onClick={() => setIngredients(prev => {
                      const updated = new Set(prev);
                      updated.delete(ingredient);
                      return updated;
                    })}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <label>Supplier</label>
              <select onChange={e => setManufacturerId(e.target.value)}>
                <option value="">Select Supplier (optional)</option>
                {manufacturers.map(manu => (
                  <option key={manu.idManufacturer} value={manu.idManufacturer}>
                    {manu.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Image</label>
              <input type="file" onChange={e => setImage(e.target.files[0])} />
            </div>

            <button type="button" onClick={handleGoToStep2}>Next</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{
  width: '600px',
  height: '20px',
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '20px'
}}>
            <div style={{
  width: '200px',
  height: '5px',
  backgroundColor: '#eee',
  borderRadius: '10px',
  overflow: 'hidden'
}}>
  <div style={{
    width: '66%',
    height: '100%',
    backgroundColor: '#687616'
  }}></div>
  </div>
  </div>
            <div>
              <h3>Select Categories</h3>
              {categories.map(category => (
                <label key={category.name}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => handleCheckboxChange(category.name, setSelectedCategories)}
                  />
                  {category.name}
                </label>
              ))}

              <div>
                <h4>Add New Category</h4>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  placeholder="New Category Name"
                />
                <textarea
                  value={newCategoryDescription}
                  onChange={e => setNewCategoryDescription(e.target.value)}
                  placeholder="New Category Description (optional)"
                ></textarea>
                <button type="button" onClick={handleAddNewCategory}>Add Category</button>
              </div>
            </div>

            <div>
              <h3>Select Packaging</h3>
              {units.map(unit => (
  <div key={unit.idUnit}>
    <label>
      <input
        type="checkbox"
        checked={selectedUnits.some(u => u.idUnit === unit.idUnit)}
        onChange={() => handleUnitCheckboxChange(unit)}
      />
      {unit.name}
    </label>
  </div>
))}

              <div>
                <h4>Add New Packaging Option</h4>
                <input
                  type="text"
                  value={newUnitName}
                  onChange={e => setNewUnitName(e.target.value)}
                  placeholder="Packaging Name"
                />
                <textarea
                  value={newUnitDescription}
                  onChange={e => setNewUnitDescription(e.target.value)}
                  placeholder="Packaging Description (optional)"
                ></textarea>
                <button type="button" onClick={handleAddNewUnit}>Add Unit</button>
              </div>
            </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0px', width: '200px', marginLeft: '200px' }}>

            <button type="button" onClick={() => setStep(1)}>Back</button>
            <button type="button" onClick={handleGoToStep3}>Next</button>
            </div>
          </div>
        )}

{step === 3 && (
  <div>
    <div style={{
  width: '600px',
  height: '20px',
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '20px'
}}>
            <div style={{
  width: '200px',
  height: '5px',
  backgroundColor: '#eee',
  borderRadius: '10px',
  overflow: 'hidden'
}}>
  <div style={{
    width: '100%',
    height: '100%',
    backgroundColor: '#687616'
  }}></div>
  </div>
  </div>
    <h3>Add Price List for Packaging</h3>
    {priceLists.map((item, index) => (
      <div key={item.idUnit} style={{ marginBottom: "1rem", display: "flex", flexDirection: "column" }}>
        <h4>Packaging Name: {item.name}</h4>

        <label>Price</label>
        <input
          type="number"
          value={item.price}
          onChange={e => {
            const newPriceLists = [...priceLists];
            newPriceLists[index].price = e.target.value;
            setPriceLists(newPriceLists);
          }}
          required
        />

        <label>Activation Date</label>
        <input
          type="date"
          value={item.dateTimeFrom}
          onChange={e => {
            const newPriceLists = [...priceLists];
            newPriceLists[index].dateTimeFrom = e.target.value;
            setPriceLists(newPriceLists);
          }}
          required
        />

<label>Expiration Date</label>
        <input
          type="date"
          value={item.dateTimeTo}
          onChange={e => {
            const newPriceLists = [...priceLists];
            newPriceLists[index].dateTimeTo = e.target.value;
            setPriceLists(newPriceLists);
          }}
          required
        />

<label>Discount (decimal)</label>
        <input
          type="number"
          value={item.discount}
          onChange={e => {
            const newPriceLists = [...priceLists];
            newPriceLists[index].discount = e.target.value;
            setPriceLists(newPriceLists);
          }}
        />
      </div>

      
    ))}



    <button type="button" onClick={() => setStep(2)}>Back</button>
    <button type="submit">CREATE</button>
  </div>
)}


      </form>
    </div>
        </div>

  );
}
