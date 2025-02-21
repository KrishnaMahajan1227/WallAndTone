import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function SizesAdmin() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/';
  const [sizes, setSizes] = useState([]);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [price, setPrice] = useState('');
  const [id, setId] = useState('');
  const [mode, setMode] = useState('create');
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (token) {
      axios.get(`${apiUrl}/api/admin/sizes/getsizes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          if (Array.isArray(response.data)) {
            setSizes(response.data);
          } else {
            setSizes([]);
          }
        })
        .catch(error => {
          console.error(error);
        });
    }
  }, [token]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (mode === 'create') {
      axios.post(`${apiUrl}/api/admin/sizes/addsize`, {
        width,
        height,
        price,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          if (Array.isArray(sizes)) {
            setSizes([...sizes, response.data]);
          } else {
            setSizes([response.data]);
          }
          setWidth('');
          setHeight('');
          setPrice('');
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      axios.put(`${apiUrl}/api/admin/sizes/updatesize/${id}`, {
        width,
        height,
        price,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(response => {
          if (Array.isArray(sizes)) {
            const updatedSizes = sizes.map(size => {
              if (size._id === id) {
                return response.data;
              }
              return size;
            });
            setSizes(updatedSizes);
          } else {
            setSizes([response.data]);
          }
          setWidth('');
          setHeight('');
          setPrice('');
          setMode('create');
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  const handleDelete = (id) => {
    axios.delete(`${apiUrl}/api/admin/sizes/deletesize/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(response => {
        if (Array.isArray(sizes)) {
          const updatedSizes = sizes.filter(size => size._id !== id);
          setSizes(updatedSizes);
        } else {
          setSizes([]);
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  const handleEdit = (size) => {
    setWidth(size.width);
    setHeight(size.height);
    setPrice(size.price);
    setId(size._id);
    setMode('update');
  };

  return (
    <div className="sizes-admin-dashboard">
      <h1 className="sizes-admin-dashboard__title">Sizes Admin Dashboard</h1>
      <div className="sizes-admin-dashboard__form-container">
        <form onSubmit={handleSubmit} className="sizes-admin-dashboard__form">
          <div className="form-group">
            <label className="sizes-admin-dashboard__form-label" htmlFor="width">Width:</label>
            <input type="number" className="form-control" id="width" value={width} onChange={(event) => setWidth(event.target.value)} />
          </div>
          <div className="form-group">
            <label className="sizes-admin-dashboard__form-label" htmlFor="height">Height:</label>
            <input type="number" className="form-control" id="height" value={height} onChange={(event) => setHeight(event.target.value)} />
          </div>
          <div className="form-group">
            <label className="sizes-admin-dashboard__form-label" htmlFor="price">Price:</label>
            <input type="number" className="form-control" id="price" value={price} onChange={(event) => setPrice(event.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">{mode === 'create' ? 'Create' : 'Update'}</button>
        </form>
      </div>
      <div className="sizes-admin-dashboard__sizes-container">
        <h2 className="sizes-admin-dashboard__sizes-title">Sizes</h2>
        {Array.isArray(sizes) && sizes.length > 0 ? (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Width</th>
                <th>Height</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size._id}>
                  <td>{size.width}</td>
                  <td>{size.height}</td>
                  <td>{size.price}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => handleEdit(size)}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(size._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No sizes available.</p>
        )}
      </div>
    </div>
  );
}

export default SizesAdmin;