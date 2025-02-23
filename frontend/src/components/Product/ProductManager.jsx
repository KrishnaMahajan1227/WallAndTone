import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './ProductManager.css';

const ProductManager = () => {
  const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://wallandtone.com');
  const [products, setProducts] = useState([]);
  const [frameTypes, setFrameTypes] = useState([]);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [formData, setFormData] = useState({
    _id: '',
    productName: '',
    description: '',
    quantity: '',
    frameTypes: [],
    subFrameTypes: [],
    sizes: [],
    startFromPrice: '',
    colors: [],
    orientations: [],
    categories: []
  });
  const [files, setFiles] = useState({
    mainImage: null,
    thumbnails: [],
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [subframeImageModalVisible, setSubframeImageModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSubFrameType, setSelectedSubFrameType] = useState(null);
  const [selectedFrameType, setSelectedFrameType] = useState(null);
  const [subframeImage, setSubframeImage] = useState(null);

  const availableColors = [
    'Black', 'White', 'Gold', 'Gray', 'Pink', 'Green', 'Orange', 'Red', 'Blue',
    'Beige', 'Brown', 'Yellow', 'Purple', 'Neon Green', 'Soft Pastels',
    'Earth Tones', 'Muted Tones', 'Cool Tones', 'Fiery Orange', 'Deep Blue',
    'Silver', 'Peach', 'Coral', 'Lavender', 'Dark Green', 'Light Brown',
    'Terracotta', 'Navy', 'Dusty Rose', 'Indigo', 'Sepia', 'Red Chalk'
  ];

  const availableOrientations = ['Portrait', 'Landscape', 'Square'];
  const availableCategories = ['Abstract', 'Surrealism', 'Expressionism', 'Minimalist', 'Fluid Art',
    'Optical Art', 'Nature Art', 'Botanical', 'Seascape', 'Wildlife', 'Scenic',
    'Marine Art', 'Animal Portraits', 'Birds', 'Fantasy Creatures', 'Cityscape',
    'Urban Art', 'Landmark', 'Classical Architecture', 'Figurative', 'Portraits',
    'Classical Art', 'Realism', 'Ukiyo-e', 'Renaissance', 'Baroque',
    'Impressionism', 'Post-Impressionism', 'Space Art', 'Cyberpunk', 'Steampunk',
    'Futuristic', 'Retro-Futurism', 'Religious Art', 'Mandalas', 'Symbolism',
    'Calligraphy', 'Fine Art Photography', 'Black & White', 'Conceptual Photography',
    'Digital Illustration', 'Pop Art', 'Vintage', 'Whimsical', 'Caricature',
    'Cartoon', 'Modern Art', 'Geometric', 'Contemporary', 'Modernism',
    'Hand-Drawn', 'Calligraphy', 'Text Art', 'Line Art', 'Food Art', 'Gourmet', 'Drinks',
    'Classic Still Life', 'Asian Art', 'Ukiyo-e', 'Tribal', 'Cultural Paintings',
    'Love & Romance', 'Seasonal Art', 'Nautical'];

  useEffect(() => {
    fetchFrameTypes();
    fetchSubFrameTypes();
    fetchSizes();
    fetchProducts();
  }, []);

  const handleError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  const fetchFrameTypes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/frame-types`);
      setFrameTypes(response.data);
    } catch (err) {
      handleError('Failed to fetch frame types');
    }
  };

  const fetchSubFrameTypes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/sub-frame-types`);
      setSubFrameTypes(response.data);
    } catch (err) {
      handleError('Failed to fetch sub frame types');
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/admin/sizes/getsizes`);
      setSizes(response.data);
    } catch (err) {
      handleError('Failed to fetch sizes');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/products`);
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      handleError('Failed to fetch products');
      setProducts([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFiles(prev => ({ ...prev, [name]: files }));
  };

  const handleFrameTypeChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      frameTypes: checked 
        ? [...prev.frameTypes, value]
        : prev.frameTypes.filter(id => id !== value)
    }));
  };

  const handleSubFrameTypeChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      subFrameTypes: checked
        ? [...prev.subFrameTypes, value]
        : prev.subFrameTypes.filter(id => id !== value)
    }));
  };

  const handleSizeChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      sizes: checked
        ? [...prev.sizes, value]
        : prev.sizes.filter(id => id !== value)
    }));
  };

  const handleColorChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      colors: checked
        ? [...prev.colors, value]
        : prev.colors.filter(color => color !== value)
    }));
  };

  const handleOrientationChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      orientations: checked
        ? [...prev.orientations, value]
        : prev.orientations.filter(orientation => orientation !== value)
    }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      categories: checked
        ? [...prev.categories, value]
        : prev.categories.filter(category => category !== value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    Object.keys(formData).forEach(key => {
      if (Array.isArray(formData[key])) {
        formData[key].forEach(value => {
          formDataToSend.append(`${key}[]`, value);
        });
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });

    if (files.mainImage?.[0]) {
      formDataToSend.append('mainImage', files.mainImage[0]);
    }

    if (files.thumbnails?.length) {
      Array.from(files.thumbnails).forEach(file => {
        formDataToSend.append('thumbnails', file);
      });
    }

    try {
      const url = formData._id
        ? `${apiUrl}/api/products/${formData._id}`
        : `${apiUrl}/api/products`;
      
      const method = formData._id ? 'put' : 'post';
      const response = await axios[method](url, formDataToSend);

      setProducts(prev => {
        const index = prev.findIndex(p => p._id === response.data._id);
        if (index !== -1) {
          return [...prev.slice(0, index), response.data, ...prev.slice(index + 1)];
        }
        return [...prev, response.data];
      });

      setSuccess('Product saved successfully');
      setModalVisible(false);
      resetForm();
    } catch (err) {
      handleError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleExcelFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleUploadExcel = async () => {
    if (!excelFile) {
      handleError('Please select an Excel file');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('excelFile', excelFile);

    try {
      await axios.post(`${apiUrl}/api/products/excel`, formDataToSend);
      fetchProducts();
      setSuccess('Products uploaded successfully');
      setExcelFile(null);
    } catch (err) {
      handleError(err.response?.data?.message || 'Failed to upload products');
    }
  };

  const handleEdit = (product) => {
    setFormData({
      _id: product._id,
      productName: product.productName,
      description: product.description,
      quantity: product.quantity,
      frameTypes: product.frameTypes.map(ft => ft._id),
      subFrameTypes: product.subFrameTypes.map(sft => sft._id),
      sizes: product.sizes.map(s => s._id),
      startFromPrice: product.startFromPrice,
      colors: product.colors || [],
      orientations: product.orientations || [],
      categories: product.categories || []
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/api/products/${id}`);
      setProducts(prev => prev.filter(p => p._id !== id));
      setSuccess('Product deleted successfully');
    } catch (err) {
      handleError('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      _id: '',
      productName: '',
      description: '',
      quantity: '',
      frameTypes: [],
      subFrameTypes: [],
      sizes: [],
      startFromPrice: '',
      colors: [],
      orientations: [],
      categories: []
    });
    setFiles({
      mainImage: null,
      thumbnails: [],
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Product Manager</h2>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3 d-flex gap-2">
        <button
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          Add New Product
        </button>

        <div className="d-flex gap-2 align-items-center">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleExcelFileChange}
            className="form-control"
          />
          <button
            className="btn btn-success"
            onClick={handleUploadExcel}
            disabled={!excelFile}
          >
            Upload Excel
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Description</th>
              <th>Frame Types</th>
              <th>Sub Frame Types</th>
              <th>Sizes</th>
              <th>Colors</th>
              <th>Orientations</th>
              <th>Categories</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Images</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product.productName}</td>
                <td>{product.description}</td>
                <td>
                  <ul className="list-unstyled mb-0">
                    {product.frameTypes.map(ft => (
                      <li key={ft._id}>{ft.name}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <ul className="list-unstyled mb-0">
                    {product.subFrameTypes.map(sft => (
                      <li key={sft._id}>{sft.name}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <ul className="list-unstyled mb-0">
                    {product.sizes.map(size => (
                      <li key={size._id}>
                        {size.width}x{size.height}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <ul className="list-unstyled mb-0">
                    {product.colors?.map((color, index) => (
                      <li key={index}>{color}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <ul className="list-unstyled mb-0">
                    {product.orientations?.map((orientation, index) => (
                      <li key={index}>{orientation}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <ul className="list-unstyled mb-0">
                    {product.categories?.map((category, index) => (
                      <li key={index}>{category}</li>
                    ))}
                  </ul>
                </td>
                <td>${product.startFromPrice}</td>
                <td>{product.quantity}</td>
                <td>
                  <div className="d-flex flex-column gap-2">
                    {product.mainImage && (
                      <img
                        src={product.mainImage}
                        alt="Main"
                        className="img-thumbnail"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    )}
                    <div className="d-flex gap-1">
                      {product.thumbnails?.map((thumbnail, index) => (
                        <img
                          key={index}
                          src={thumbnail}
                          alt={`Thumbnail ${index + 1}`}
                          className="img-thumbnail"
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      ))}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalVisible && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {formData._id ? 'Edit Product' : 'Add New Product'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setModalVisible(false)}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Quantity</label>
                    <input
                      type="number"
                      className="form-control"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      className="form-control"
                      name="startFromPrice"
                      value={formData.startFromPrice}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Colors</label>
                    <div className="color-selection-grid">
                      {availableColors.map(color => (
                        <div key={color} className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`color-${color}`}
                            value={color}
                            checked={formData.colors.includes(color)}
                            onChange={handleColorChange}
                          />
                          <label className="form-check-label" htmlFor={`color-${color}`}>
                            {color}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Orientations</label>
                    <div className="orientation-selection">
                      {availableOrientations.map(orientation => (
                        <div key={orientation} className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`orientation-${orientation}`}
                            value={orientation}
                            checked={formData.orientations.includes(orientation)}
                            onChange={handleOrientationChange}
                          />
                          <label className="form-check-label" htmlFor={`orientation-${orientation}`}>
                            {orientation}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Categories</label>
                    <div className="category-selection-grid">
                      {availableCategories.map(category => (
                        <div key={category} className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`category-${category}`}
                            value={category}
                            checked={formData.categories.includes(category)}
                            onChange={handleCategoryChange}
                          />
                          <label className="form-check-label" htmlFor={`category-${category}`}>
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Frame Types</label>
                    {frameTypes.map(ft => (
                      <div key={ft._id} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`ft-${ft._id}`}
                          value={ft._id}
                          checked={formData.frameTypes.includes(ft._id)}
                          onChange={handleFrameTypeChange}
                        />
                        <label className="form-check-label" htmlFor={`ft-${ft._id}`}>
                          {ft.name}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Sub Frame Types</label>
                    {subFrameTypes.map(sft => (
                      <div key={sft._id} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`sft-${sft._id}`}
                          value={sft._id}
                          checked={formData.subFrameTypes.includes(sft._id)}
                          onChange={handleSubFrameTypeChange}
                        />
                        <label className="form-check-label" htmlFor={`sft-${sft._id}`}>
                          {sft.name}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Sizes</label>
                    {sizes.map(size => (
                      <div key={size._id} className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`size-${size._id}`}
                          value={size._id}
                          checked={formData.sizes.includes(size._id)}
                          onChange={handleSizeChange}
                        />
                        <label className="form-check-label" htmlFor={`size-${size._id}`}>
                          {size.width}x{size.height}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Main Image</label>
                    <input
                      type="file"
                      className="form-control"
                      name="mainImage"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Thumbnails</label>
                    <input
                      type="file"
                      className="form-control"
                      name="thumbnails"
                      onChange={handleFileChange}
                      multiple
                      accept="image/*"
                    />
                  </div>

                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setModalVisible(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalVisible && <div className="modal-backdrop show"></div>}
    </div>
  );
};

export default ProductManager;
