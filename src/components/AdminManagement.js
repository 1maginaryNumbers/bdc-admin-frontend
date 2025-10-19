import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiSettings } from 'react-icons/fi';

const AdminManagement = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/admin/create', {
        username: formData.username,
        password: formData.password
      });
      toast.success('Admin created successfully');
      setFormData({
        username: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Management</h1>
        <p className="page-subtitle">Create new admin accounts</p>
      </div>

      <div className="content-card">
        <h3>Create New Admin</h3>
        <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-control"
              required
              minLength="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              required
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-control"
              required
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Admin'}
          </button>
        </form>
      </div>

      <div className="content-card">
        <h3>System Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Backend API</h4>
            <p style={{ fontWeight: '500' }}>http://localhost:5000</p>
          </div>
          <div>
            <h4 style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Frontend</h4>
            <p style={{ fontWeight: '500' }}>React Admin Panel</p>
          </div>
          <div>
            <h4 style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Database</h4>
            <p style={{ fontWeight: '500' }}>MongoDB</p>
          </div>
          <div>
            <h4 style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Authentication</h4>
            <p style={{ fontWeight: '500' }}>JWT Token</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
