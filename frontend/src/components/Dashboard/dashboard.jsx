import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faTimes, faUser } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [alert, setAlert] = useState({ message: '', type: '', visible: false });
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // Check if user is logged in and has 'admin' or 'superadmin' role
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      // Redirect if not logged in or role is not 'admin' or 'superadmin'
      window.location.href = '/'; // Redirect to homepage or login page
    } else {
      fetchUsers(); // Fetch users if logged in as admin or superadmin
    }
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    setAlert({ message: '', type: '', visible: false });
  
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAlert({ message: 'You must be logged in to view users.', type: 'danger', visible: true });
        return;
      }
  
      const response = await axios.get('http://backend.wallandtone.com/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
  
      console.log('API Response:', response);  // Log the entire response object
  
      if (response.status === 200 && Array.isArray(response.data)) {
        let users = response.data;
  
        // If the role of logged-in user is not superadmin, filter out superadmin users
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.role !== 'superadmin') {
          users = users.filter(u => u.role !== 'superadmin');
        }
  
        setUsers(users);
        setAlert({ message: 'Users loaded successfully!', type: 'success', visible: true });
      } else {
        setAlert({ message: 'Unexpected response format.', type: 'danger', visible: true });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setAlert({ message: 'Error fetching users. Please try again.', type: 'danger', visible: true });
    } finally {
      setLoading(false);
      setTimeout(() => setAlert({ message: '', type: '', visible: false }), 1000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
  
    try {
      const token = localStorage.getItem('token');  // Retrieve the JWT token from localStorage
  
      // Ensure the token is present
      if (!token) {
        alert('No token found. Please log in again.');
        return;
      }
  
      // Make the DELETE request to delete the user
      const response = await axios.delete(`http://backend.wallandtone.com/api/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,  // Send the token in the Authorization header
        },
      });
  
      // If the request is successful, update the UI
      if (response.status === 200) {
        setUsers(users.filter(user => user._id !== id));  // Remove the deleted user from the list
        setAlert({ message: 'User deleted successfully!', type: 'success', visible: true });
      }
    } catch (error) {
      console.error('Error deleting user:', error);  // Log any error that occurs
      setAlert({ message: 'Error deleting user. Please try again.', type: 'danger', visible: true });
    } finally {
      setTimeout(() => setAlert({ message: '', type: '', visible: false }), 1000);
    }
  };
  
  

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');  // Ensure token is retrieved from localStorage
  
      // Make the PUT request to update the user
      const response = await axios.put(`http://backend.wallandtone.com/api/users/${editingUser._id}`, editingUser, {
        headers: {
          'Authorization': `Bearer ${token}`,  // Send token in the Authorization header
        },
      });
  
      if (response.status === 200) {
        setUsers(users.map(user => user._id === editingUser._id ? editingUser : user)); // Update user list
        setEditingUser(null); // Reset editing state
        setAlert({ message: 'User updated successfully!', type: 'success', visible: true });
      }
    } catch (error) {
      console.error('Error updating user:', error);  // Log any error
      setAlert({ message: 'Error updating user. Please try again.', type: 'danger', visible: true });
    } finally {
      setTimeout(() => setAlert({ message: '', type: '', visible: false }), 1000);
    }
  };
  

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <button className="view-users-button" onClick={() => setShowUserModal(true)}>
        View Users
      </button>

      {showUserModal && (
        <div className="user-modal">
          <div className="user-modal-content">
            <button className="close-modal-button" onClick={() => setShowUserModal(false)}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h2><FontAwesomeIcon icon={faUser} /> User List</h2>

            {alert.visible && (
              <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
                {alert.message}
                <button type="button" className="close" onClick={() => setAlert({ ...alert, visible: false })}>
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            )}

            {loading ? (
              <p>Loading users...</p>
            ) : (
              <div className="user-table-container">
                <table>
                  <thead>
                    <tr>
                      <th>First Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td>{user.firstName}</td>
                        <td>{user.email}</td>
                        <td>{user.phone}</td>
                        <td>
                          <button className="edit-button" onClick={() => setEditingUser(user)}>
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="delete-button" onClick={() => handleDelete(user._id)}>
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {editingUser && (
                  <div className="edit-user-form">
                    <h3>Edit User</h3>
                    <input
                      type="text"
                      value={editingUser.firstName}
                      onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                      placeholder="First Name"
                    />
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                      placeholder="Email"
                    />
                    <input
                      type="text"
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      placeholder="Phone"
                    />
                    <button onClick={handleUpdate}>Update User</button>
                    <button onClick={() => setEditingUser(null)}>Cancel</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
