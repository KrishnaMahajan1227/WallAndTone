import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FrameTypeManagement.css';

const FrameTypeManagement = () => {
  const apiUrl = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://wallandtone.com');

  const [frameTypes, setFrameTypes] = useState([]);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  const [newFrameType, setNewFrameType] = useState({ name: '', description: '', price: 0 });
  const [newSubFrameType, setNewSubFrameType] = useState({
    name: '',
    frameType: '',
    description: '',
    price: 0,
  });
  const [loadingFrameTypes, setLoadingFrameTypes] = useState(true);
  const [loadingSubFrameTypes, setLoadingSubFrameTypes] = useState(true);
  const [error, setError] = useState('');
  const [editingFrameType, setEditingFrameType] = useState(null);
  const [editingSubFrameType, setEditingSubFrameType] = useState(null);

  useEffect(() => {
    fetchFrameTypes();
    fetchSubFrameTypes();
  }, []);

  const fetchFrameTypes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/frame-types`);
      setFrameTypes(Array.isArray(response.data) ? response.data : []);
      setLoadingFrameTypes(false);
    } catch (err) {
      console.error('Error fetching frame types:', err);
      setError('Error fetching frame types');
      setFrameTypes([]); // Ensure frameTypes is always an array
      setLoadingFrameTypes(false);
    }
  };

  const fetchSubFrameTypes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/sub-frame-types`);
      setSubFrameTypes(Array.isArray(response.data) ? response.data : []);
      setLoadingSubFrameTypes(false);
    } catch (err) {
      console.error('Error fetching sub frame types:', err);
      setError('Error fetching sub frame types');
      setSubFrameTypes([]); // Ensure subFrameTypes is always an array
      setLoadingSubFrameTypes(false);
    }
  };

  const handleAddFrameType = async () => {
    if (!newFrameType.name || !newFrameType.description || !newFrameType.price) {
      setError('Please provide name, description, and price for the frame type');
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/api/frame-types`, newFrameType);
      setFrameTypes(prev => [...prev, response.data]);
      setNewFrameType({ name: '', description: '', price: 0 });
      setError('');
    } catch (err) {
      console.error('Error adding frame type:', err);
      setError('Error adding frame type');
    }
  };

  const handleAddSubFrameType = async () => {
    if (!newSubFrameType.name || !newSubFrameType.frameType || !newSubFrameType.description || !newSubFrameType.price) {
      setError('Please provide name, frame type, description, and price for the sub frame type');
      return;
    }

    try {
      const response = await axios.post(`${apiUrl}/api/sub-frame-types`, newSubFrameType);
      setSubFrameTypes(prev => [...prev, response.data]);
      setNewSubFrameType({ name: '', frameType: '', description: '', price: 0 });
      setError('');
    } catch (err) {
      console.error('Error adding sub frame type:', err);
      setError('Error adding sub frame type');
    }
  };

  const handleEditFrameType = (frameType) => {
    setEditingFrameType(frameType);
    setNewFrameType({
      name: frameType.name,
      description: frameType.description,
      price: frameType.price
    });
  };

  const handleEditSubFrameType = (subFrameType) => {
    setEditingSubFrameType(subFrameType);
    setNewSubFrameType({
      name: subFrameType.name,
      frameType: subFrameType.frameType._id,
      description: subFrameType.description,
      price: subFrameType.price
    });
  };

  const handleUpdateFrameType = async () => {
    if (!newFrameType.name || !newFrameType.description || !newFrameType.price) {
      setError('Please provide name, description, and price for the frame type');
      return;
    }

    try {
      const response = await axios.put(`${apiUrl}/api/frame-types/${editingFrameType._id}`, newFrameType);
      setFrameTypes(prev => prev.map(ft => ft._id === editingFrameType._id ? response.data : ft));
      setNewFrameType({ name: '', description: '', price: 0 });
      setEditingFrameType(null);
      setError('');
    } catch (err) {
      console.error('Error updating frame type:', err);
      setError('Error updating frame type');
    }
  };

  const handleUpdateSubFrameType = async () => {
    if (!newSubFrameType.name || !newSubFrameType.frameType || !newSubFrameType.description || !newSubFrameType.price) {
      setError('Please provide name, frame type, description, and price for the sub frame type');
      return;
    }

    try {
      const response = await axios.put(`${apiUrl}/api/sub-frame-types/${editingSubFrameType._id}`, newSubFrameType);
      setSubFrameTypes(prev => prev.map(sft => sft._id === editingSubFrameType._id ? response.data : sft));
      setNewSubFrameType({ name: '', frameType: '', description: '', price: 0 });
      setEditingSubFrameType(null);
      setError('');
    } catch (err) {
      console.error('Error updating sub frame type:', err);
      setError('Error updating sub frame type');
    }
  };

  return (
    <div className="frame-type-management">
      <h1 className="text-center mb-4">Frame Type Management</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="container">
        {/* Add Frame Type Section */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5>Add Frame Type</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="frameTypeName" className="form-label">
                Frame Type Name
              </label>
              <input
                type="text"
                id="frameTypeName"
                className="form-control"
                placeholder="Enter frame type name"
                value={newFrameType.name}
                onChange={(e) => setNewFrameType({ ...newFrameType, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="frameTypeDescription" className="form-label">
                Description
              </label>
              <textarea
                id="frameTypeDescription"
                className="form-control"
                placeholder="Enter description"
                value={newFrameType.description}
                onChange={(e) => setNewFrameType({ ...newFrameType, description: e.target.value })}
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="frameTypePrice" className="form-label">
                Price
              </label>
              <input
                type="number"
                id="frameTypePrice"
                className="form-control"
                placeholder="Enter price"
                value={newFrameType.price}
                onChange={(e) => setNewFrameType({ ...newFrameType, price: parseFloat(e.target.value) })}
              />
            </div>
            {editingFrameType ? (
              <button className="btn btn-primary" onClick={handleUpdateFrameType}>
                Update Frame Type
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleAddFrameType}>
                Add Frame Type
              </button>
            )}
          </div>
        </div>

        {/* Add Sub Frame Type Section */}
        <div className="card mb-4">
          <div className="card-header bg-secondary text-white">
            <h5>Add Sub Frame Type</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="subFrameTypeName" className="form-label">
                Sub Frame Type Name
              </label>
              <input
                type="text"
                id="subFrameTypeName"
                className="form-control"
                placeholder="Enter sub frame type name"
                value={newSubFrameType.name}
                onChange={(e) => setNewSubFrameType({ ...newSubFrameType, name: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="frameTypeSelect" className="form-label">
                Select Frame Type
              </label>
              <select
                id="frameTypeSelect"
                className="form-select"
                value={newSubFrameType.frameType}
                onChange={(e) => setNewSubFrameType({ ...newSubFrameType, frameType: e.target.value })}
              >
                <option value="">Choose a frame type</option>
                {Array.isArray(frameTypes) && frameTypes.map((frameType) => (
                  <option key={frameType._id} value={frameType._id}>
                    {frameType.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="subFrameTypeDescription" className="form-label">
                Description
              </label>
              <textarea
                id="subFrameTypeDescription"
                className="form-control"
                placeholder="Enter description"
                value={newSubFrameType.description}
                onChange={(e) => setNewSubFrameType({ ...newSubFrameType, description: e.target.value })}
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="subFrameTypePrice" className="form-label">
                Price
              </label>
              <input
                type="number"
                id="subFrameTypePrice"
                className="form-control"
                placeholder="Enter price"
                value={newSubFrameType.price}
                onChange={(e) => setNewSubFrameType({ ...newSubFrameType, price: parseFloat(e.target.value) })}
              />
            </div>
            {editingSubFrameType ? (
              <button className="btn btn-secondary" onClick={handleUpdateSubFrameType}>
                Update Sub Frame Type
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={handleAddSubFrameType}>
                Add Sub Frame Type
              </button>
            )}
          </div>
        </div>

        {/* Frame Types and Sub Frame Types */}
        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-info text-white">
                <h5>Frame Types</h5>
              </div>
              <div className="card-body">
                {loadingFrameTypes ? (
                  <div>Loading Frame Types...</div>
                ) : frameTypes.length === 0 ? (
                  <div>No frame types available.</div>
                ) : (
                  <ul className="list-group">
                    {frameTypes.map((frameType) => (
                      <li key={frameType._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                          {frameType.name} - ${frameType.price}
                        </span>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleEditFrameType(frameType)}
                        >
                          Edit
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-warning text-dark">
                <h5>Sub Frame Types</h5>
              </div>
              <div className="card-body">
                {loadingSubFrameTypes ? (
                  <div>Loading Sub Frame Types...</div>
                ) : subFrameTypes.length === 0 ? (
                  <div>No sub frame types available.</div>
                ) : (
                  <ul className="list-group">
                    {subFrameTypes.map((subFrameType) => (
                      <li key={subFrameType._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>
                          {subFrameType.name} - ${subFrameType.price} - {subFrameType.frameType?.name || 'Frame Type Not Found'}
                        </span>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEditSubFrameType(subFrameType)}
                        >
                          Edit
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameTypeManagement;