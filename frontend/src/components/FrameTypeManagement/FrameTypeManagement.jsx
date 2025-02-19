import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FrameTypeManagement.css'; // Custom CSS

const FrameTypeManagement = () => {
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
      const { data } = await axios.get('/api/frame-types');
      setFrameTypes(data);
      setLoadingFrameTypes(false);
    } catch (err) {
      setError('Error fetching frame types');
      setLoadingFrameTypes(false);
    }
  };

  const fetchSubFrameTypes = async () => {
    try {
      const { data } = await axios.get('/api/sub-frame-types');
      setSubFrameTypes(data);
      setLoadingSubFrameTypes(false);
    } catch (err) {
      setError('Error fetching sub frame types');
      setLoadingSubFrameTypes(false);
    }
  };

  const handleAddFrameType = async () => {
    if (!newFrameType.name || !newFrameType.description || !newFrameType.price) {
      setError('Please provide name, description, and price for the frame type');
      return;
    }

    try {
      const { data } = await axios.post('/api/frame-types', newFrameType);
      setFrameTypes([...frameTypes, data]);
      setNewFrameType({ name: '', description: '', price: 0 });
      setError('');
    } catch (err) {
      setError('Error adding frame type');
    }
  };

  const handleAddSubFrameType = async () => {
    if (!newSubFrameType.name || !newSubFrameType.frameType || !newSubFrameType.description || !newSubFrameType.price) {
      setError('Please provide name, frame type, description, and price for the sub frame type');
      return;
    }

    try {
      const { data } = await axios.post('/api/sub-frame-types', newSubFrameType);
      setSubFrameTypes([...subFrameTypes, data]);
      setNewSubFrameType({ name: '', frameType: '', description: '', price: 0 });
      setError('');
    } catch (err) {
      setError('Error adding sub frame type');
    }
  };

  const handleEditFrameType = async (frameType) => {
    setEditingFrameType(frameType);
    setNewFrameType({ name: frameType.name, description: frameType.description, price: frameType.price });
  };

  const handleEditSubFrameType = async (subFrameType) => {
    setEditingSubFrameType(subFrameType);
    setNewSubFrameType({ name: subFrameType.name, frameType: subFrameType.frameType, description: subFrameType.description, price: subFrameType.price });
  };

  const handleUpdateFrameType = async () => {
    if (!newFrameType.name || !newFrameType.description || !newFrameType.price) {
      setError('Please provide name, description, and price for the frame type');
      return;
    }

    try {
      const { data } = await axios.put(`/api/frame-types/${editingFrameType._id}`, newFrameType);
      const updatedFrameTypes = frameTypes.map((frameType) => (frameType._id === editingFrameType._id ? data : frameType));
      setFrameTypes(updatedFrameTypes);
      setNewFrameType({ name: '', description: '', price: 0 });
      setEditingFrameType(null);
      setError('');
    } catch (err) {
      setError('Error updating frame type');
    }
  };

  const handleUpdateSubFrameType = async () => {
    if (!newSubFrameType.name || !newSubFrameType.frameType || !newSubFrameType.description || !newSubFrameType.price) {
      setError('Please provide name, frame type, description, and price for the sub frame type');
      return;
    }

    try {
      const { data } = await axios.put(`/api/sub-frame-types/${editingSubFrameType._id}`, newSubFrameType);
      const updatedSubFrameTypes = subFrameTypes.map((subFrameType) => (subFrameType._id === editingSubFrameType._id ? data : subFrameType));
      setSubFrameTypes(updatedSubFrameTypes);
      setNewSubFrameType({ name: '', frameType: '', description: '', price: 0 });
      setEditingSubFrameType(null);
      setError('');
    } catch (err) {
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
                onChange={(e) => setNewFrameType({ ...newFrameType, price: e.target.value })}
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
                {frameTypes.map((frameType) => (
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
                onChange={(e) =>
                  setNewSubFrameType({ ...newSubFrameType, description: e.target.value })
                }
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
                onChange={(e) => setNewSubFrameType({ ...newSubFrameType, price: e.target.value })}
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
        ) : (
          <ul className="list-group">
            {frameTypes.map((frameType) => (
              <li key={frameType._id} className="list-group-item d-flex justify-content-between">
                <span>
                  {frameType.name} - ${frameType.price}
                </span>
                <button
                  className="btn btn-sm btn-primary w-25"
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
        {subFrameTypes.length === 0 ? (
          <div>No sub frame types available.</div>
        ) : (
          <ul className="list-group">
            {subFrameTypes.map((subFrameType) => (
              <li key={subFrameType._id} className="list-group-item d-flex justify-content-between">
                <span>
                  {subFrameType.name} - ${subFrameType.price} - {subFrameType.frameType ? subFrameType.frameType.name : 'Frame Type Not Found'}
                </span>
                <button
                  className="btn btn-sm btn-secondary w-25"
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