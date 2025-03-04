import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FrameTypeManagement.css';

const FrameTypeManagement = () => {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://wallandtone.com');

  // States for FrameTypes, SubFrameTypes, and FrameSizes
  const [frameTypes, setFrameTypes] = useState([]);
  const [subFrameTypes, setSubFrameTypes] = useState([]);
  const [frameSizes, setFrameSizes] = useState([]);

  // States for new entries and editing
  const [newFrameType, setNewFrameType] = useState({ name: '', description: '', price: 0 });
  const [newSubFrameType, setNewSubFrameType] = useState({
    name: '',
    frameType: '',
    description: '',
    price: 0,
    images: []
  });
  const [newFrameSize, setNewFrameSize] = useState({ name: '', frameType: '', price: 0 });

  const [editingFrameType, setEditingFrameType] = useState(null);
  const [editingSubFrameType, setEditingSubFrameType] = useState(null);
  const [editingFrameSize, setEditingFrameSize] = useState(null);

  const [loadingFrameTypes, setLoadingFrameTypes] = useState(true);
  const [loadingSubFrameTypes, setLoadingSubFrameTypes] = useState(true);
  const [loadingFrameSizes, setLoadingFrameSizes] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFrameTypes();
    fetchSubFrameTypes();
    fetchFrameSizes();
  }, []);

  // Fetch Functions
  const fetchFrameTypes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/frame-types`);
      setFrameTypes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching frame types:', err);
      setError('Error fetching frame types');
    } finally {
      setLoadingFrameTypes(false);
    }
  };

  const fetchSubFrameTypes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/sub-frame-types`);
      setSubFrameTypes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching sub frame types:', err);
      setError('Error fetching sub frame types');
    } finally {
      setLoadingSubFrameTypes(false);
    }
  };

  const fetchFrameSizes = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/frame-sizes`);
      setFrameSizes(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching frame sizes:', err);
      setError('Error fetching frame sizes');
    } finally {
      setLoadingFrameSizes(false);
    }
  };

  // ---------------------- FrameType Handlers ----------------------
  const handleAddFrameType = async () => {
    if (!newFrameType.name || !newFrameType.description || newFrameType.price === undefined) {
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

  const handleEditFrameType = (frameType) => {
    setEditingFrameType(frameType);
    setNewFrameType({ name: frameType.name, description: frameType.description, price: frameType.price });
  };

  const handleUpdateFrameType = async () => {
    if (!newFrameType.name || !newFrameType.description || newFrameType.price === undefined) {
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

  const handleDeleteFrameType = async (frameTypeId) => {
    try {
      await axios.delete(`${apiUrl}/api/frame-types/${frameTypeId}`);
      setFrameTypes(prev => prev.filter(ft => ft._id !== frameTypeId));
    } catch (err) {
      console.error('Error deleting frame type:', err);
      setError('Error deleting frame type');
    }
  };

  // ---------------------- SubFrameType Handlers ----------------------
  const handleAddSubFrameType = async () => {
    if (!newSubFrameType.name || !newSubFrameType.frameType || !newSubFrameType.description || newSubFrameType.price === undefined) {
      setError('Please provide name, frame type, description, and price for the sub frame type');
      return;
    }
    try {
      const response = await axios.post(`${apiUrl}/api/sub-frame-types`, newSubFrameType);
      setSubFrameTypes(prev => [...prev, response.data]);
      setNewSubFrameType({ name: '', frameType: '', description: '', price: 0, images: [] });
      setError('');
    } catch (err) {
      console.error('Error adding sub frame type:', err);
      setError('Error adding sub frame type');
    }
  };

  const handleEditSubFrameType = (subFrameType) => {
    setEditingSubFrameType(subFrameType);
    setNewSubFrameType({
      name: subFrameType.name,
      frameType: subFrameType.frameType._id,
      description: subFrameType.description,
      price: subFrameType.price,
      images: subFrameType.images || []
    });
  };

  const handleUpdateSubFrameType = async () => {
    if (!newSubFrameType.name || !newSubFrameType.frameType || !newSubFrameType.description || newSubFrameType.price === undefined) {
      setError('Please provide name, frame type, description, and price for the sub frame type');
      return;
    }
    try {
      const response = await axios.put(`${apiUrl}/api/sub-frame-types/${editingSubFrameType._id}`, newSubFrameType);
      setSubFrameTypes(prev => prev.map(sft => sft._id === editingSubFrameType._id ? response.data : sft));
      setNewSubFrameType({ name: '', frameType: '', description: '', price: 0, images: [] });
      setEditingSubFrameType(null);
      setError('');
    } catch (err) {
      console.error('Error updating sub frame type:', err);
      setError('Error updating sub frame type');
    }
  };

  const handleDeleteSubFrameType = async (subFrameTypeId) => {
    try {
      await axios.delete(`${apiUrl}/api/sub-frame-types/${subFrameTypeId}`);
      setSubFrameTypes(prev => prev.filter(sft => sft._id !== subFrameTypeId));
    } catch (err) {
      console.error('Error deleting sub frame type:', err);
      setError('Error deleting sub frame type');
    }
  };

  // ---------------------- FrameSize Handlers ----------------------
  const handleAddFrameSize = async () => {
    if (!newFrameSize.name || !newFrameSize.frameType || newFrameSize.price === undefined) {
      setError('Please provide name, frame type, and price for the frame size');
      return;
    }
    try {
      const response = await axios.post(`${apiUrl}/api/frame-sizes`, newFrameSize);
      setFrameSizes(prev => [...prev, response.data]);
      setNewFrameSize({ name: '', frameType: '', price: 0 });
      setError('');
    } catch (err) {
      console.error('Error adding frame size:', err);
      setError('Error adding frame size');
    }
  };

  const handleEditFrameSize = (frameSize) => {
    setEditingFrameSize(frameSize);
    setNewFrameSize({ name: frameSize.name, frameType: frameSize.frameType._id, price: frameSize.price });
  };

  const handleUpdateFrameSize = async () => {
    if (!newFrameSize.name || !newFrameSize.frameType || newFrameSize.price === undefined) {
      setError('Please provide name, frame type, and price for the frame size');
      return;
    }
    try {
      const response = await axios.put(`${apiUrl}/api/frame-sizes/${editingFrameSize._id}`, newFrameSize);
      setFrameSizes(prev => prev.map(fs => fs._id === editingFrameSize._id ? response.data : fs));
      setNewFrameSize({ name: '', frameType: '', price: 0 });
      setEditingFrameSize(null);
      setError('');
    } catch (err) {
      console.error('Error updating frame size:', err);
      setError('Error updating frame size');
    }
  };

  const handleDeleteFrameSize = async (frameSizeId) => {
    try {
      await axios.delete(`${apiUrl}/api/frame-sizes/${frameSizeId}`);
      setFrameSizes(prev => prev.filter(fs => fs._id !== frameSizeId));
    } catch (err) {
      console.error('Error deleting frame size:', err);
      setError('Error deleting frame size');
    }
  };

  return (
    <div className="frame-type-management">
      <h1 className="text-center mb-4">Frame Type Management</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="container">
        {/* Add/Update Frame Type Section */}
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5>{editingFrameType ? 'Edit Frame Type' : 'Add Frame Type'}</h5>
          </div>
          <div className="card-body">
            <div className="mb-3 form-group">
              <label htmlFor="frameTypeName" className="form-label">Frame Type Name</label>
              <input
                type="text"
                id="frameTypeName"
                className="form-control"
                placeholder="Enter frame type name"
                value={newFrameType.name}
                onChange={(e) => setNewFrameType({ ...newFrameType, name: e.target.value })}
              />
            </div>
            <div className="mb-3 form-group">
              <label htmlFor="frameTypeDescription" className="form-label">Description</label>
              <textarea
                id="frameTypeDescription"
                className="form-control"
                placeholder="Enter description"
                value={newFrameType.description}
                onChange={(e) => setNewFrameType({ ...newFrameType, description: e.target.value })}
              ></textarea>
            </div>
            <div className="mb-3 form-group">
              <label htmlFor="frameTypePrice" className="form-label">Price</label>
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
              <>
                <button className="btn btn-primary" onClick={handleUpdateFrameType}>Update Frame Type</button>
                <button className="btn btn-danger mt-2" onClick={() => handleDeleteFrameType(editingFrameType._id)}>Delete Frame Type</button>
              </>
            ) : (
              <button className="btn btn-primary" onClick={handleAddFrameType}>Add Frame Type</button>
            )}
          </div>
        </div>

        {/* Add/Update Sub Frame Type Section */}
        <div className="card mb-4">
          <div className="card-header bg-secondary text-white">
            <h5>{editingSubFrameType ? 'Edit Sub Frame Type' : 'Add Sub Frame Type'}</h5>
          </div>
          <div className="card-body">
            <div className="mb-3 form-group">
              <label htmlFor="subFrameTypeName" className="form-label">Sub Frame Type Name</label>
              <input
                type="text"
                id="subFrameTypeName"
                className="form-control"
                placeholder="Enter sub frame type name"
                value={newSubFrameType.name}
                onChange={(e) => setNewSubFrameType({ ...newSubFrameType, name: e.target.value })}
              />
            </div>
            <div className="mb-3 form-group">
              <label htmlFor="frameTypeSelect" className="form-label">Select Frame Type</label>
              <select
                id="frameTypeSelect"
                className="form-select"
                value={newSubFrameType.frameType}
                onChange={(e) => setNewSubFrameType({ ...newSubFrameType, frameType: e.target.value })}
              >
                <option value="">Choose a frame type</option>
                {Array.isArray(frameTypes) && frameTypes.map((ft) => (
                  <option key={ft._id} value={ft._id}>{ft.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3 form-group">
              <label htmlFor="subFrameTypeDescription" className="form-label">Description</label>
              <textarea
                id="subFrameTypeDescription"
                className="form-control"
                placeholder="Enter description"
                value={newSubFrameType.description}
                onChange={(e) => setNewSubFrameType({ ...newSubFrameType, description: e.target.value })}
              ></textarea>
            </div>
            <div className="mb-3 form-group">
              <label htmlFor="subFrameTypePrice" className="form-label">Price</label>
              <input
                type="number"
                id="subFrameTypePrice"
                className="form-control"
                placeholder="Enter price"
                value={newSubFrameType.price}
                onChange={(e) => setNewSubFrameType({ ...newSubFrameType, price: parseFloat(e.target.value) })}
              />
            </div>
            <div className="mb-3 form-group">
              <label htmlFor="subFrameTypeImages" className="form-label">Images (comma-separated URLs)</label>
              <input
                type="text"
                id="subFrameTypeImages"
                className="form-control"
                placeholder="Enter image URLs separated by commas"
                value={newSubFrameType.images.join(', ')}
                onChange={(e) => setNewSubFrameType({ ...newSubFrameType, images: e.target.value.split(',').map(url => url.trim()) })}
              />
            </div>
            {editingSubFrameType ? (
              <>
                <button className="btn btn-secondary" onClick={handleUpdateSubFrameType}>Update Sub Frame Type</button>
                <button className="btn btn-danger mt-2" onClick={() => handleDeleteSubFrameType(editingSubFrameType._id)}>Delete Sub Frame Type</button>
              </>
            ) : (
              <button className="btn btn-secondary" onClick={handleAddSubFrameType}>Add Sub Frame Type</button>
            )}
          </div>
        </div>

        {/* Add/Update Frame Size Section */}
        <div className="card mb-4">
          <div className="card-header bg-dark text-white">
            <h5>{editingFrameSize ? 'Edit Frame Size' : 'Add Frame Size'}</h5>
          </div>
          <div className="card-body">
            <div className="mb-3 form-group">
              <label htmlFor="frameSizeName" className="form-label">Frame Size Name</label>
              <input
                type="text"
                id="frameSizeName"
                className="form-control"
                placeholder="Enter frame size name"
                value={newFrameSize.name}
                onChange={(e) => setNewFrameSize({ ...newFrameSize, name: e.target.value })}
              />
            </div>
            <div className="mb-3 form-group">
              <label htmlFor="frameSizeSelect" className="form-label">Select Frame Type</label>
              <select
                id="frameSizeSelect"
                className="form-select"
                value={newFrameSize.frameType}
                onChange={(e) => setNewFrameSize({ ...newFrameSize, frameType: e.target.value })}
              >
                <option value="">Choose a frame type</option>
                {Array.isArray(frameTypes) && frameTypes.map((ft) => (
                  <option key={ft._id} value={ft._id}>{ft.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3 form-group">
              <label htmlFor="frameSizePrice" className="form-label">Price</label>
              <input
                type="number"
                id="frameSizePrice"
                className="form-control"
                placeholder="Enter price"
                value={newFrameSize.price}
                onChange={(e) => setNewFrameSize({ ...newFrameSize, price: parseFloat(e.target.value) })}
              />
            </div>
            {editingFrameSize ? (
              <>
                <button className="btn btn-dark" onClick={handleUpdateFrameSize}>Update Frame Size</button>
                <button className="btn btn-danger mt-2" onClick={() => handleDeleteFrameSize(editingFrameSize._id)}>Delete Frame Size</button>
              </>
            ) : (
              <button className="btn btn-dark" onClick={handleAddFrameSize}>Add Frame Size</button>
            )}
          </div>
        </div>

        {/* Display Section */}
        <div className="row">
          <div className="col-md-4">
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
                    {frameTypes.map((ft) => (
                      <li key={ft._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{ft.name} - ${ft.price}</span>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-primary" onClick={() => handleEditFrameType(ft)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteFrameType(ft._id)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-4">
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
                    {subFrameTypes.map((sft) => (
                      <li key={sft._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{sft.name} - ${sft.price} - {sft.frameType?.name || 'N/A'}</span>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-secondary" onClick={() => handleEditSubFrameType(sft)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteSubFrameType(sft._id)}>Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card">
              <div className="card-header bg-dark text-white">
                <h5>Frame Sizes</h5>
              </div>
              <div className="card-body">
                {loadingFrameSizes ? (
                  <div>Loading Frame Sizes...</div>
                ) : frameSizes.length === 0 ? (
                  <div>No frame sizes available.</div>
                ) : (
                  <ul className="list-group">
                    {frameSizes.map((fs) => (
                      <li key={fs._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <span>{fs.name} - ${fs.price} - {fs.frameType?.name || 'N/A'}</span>
                        <div className="d-flex gap-2">
                          <button className="btn btn-sm btn-dark" onClick={() => handleEditFrameSize(fs)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteFrameSize(fs._id)}>Delete</button>
                        </div>
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
