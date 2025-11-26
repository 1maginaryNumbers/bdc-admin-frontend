import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';

const StrukturManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [struktur, setStruktur] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStruktur, setEditingStruktur] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    jabatan: '',
    periode: '',
    kontak: ''
  });

  useEffect(() => {
    fetchStruktur();
  }, [refreshTrigger]);

  useEscapeKey(() => {
    if (showModal) {
      closeModal();
    }
  });

  const modalRef = useOutsideClick(() => {
    if (showModal) {
      closeModal();
    }
  });

  const fetchStruktur = async () => {
    try {
      const response = await axios.get('https://finalbackend-ochre.vercel.app/api/struktur');
      // Handle both old format (array) and new format (object with struktur property)
      const data = response.data;
      if (Array.isArray(data)) {
        setStruktur(data);
      } else if (data.struktur && Array.isArray(data.struktur)) {
        setStruktur(data.struktur);
      } else {
        setStruktur([]);
      }
    } catch (error) {
      toast.error('Failed to fetch struktur data');
      setStruktur([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStruktur) {
        await axios.put(`https://finalbackend-ochre.vercel.app/api/struktur/${editingStruktur._id}`, formData);
        toast.success('Struktur updated successfully');
      } else {
        await axios.post('https://finalbackend-ochre.vercel.app/api/struktur', formData);
        toast.success('Struktur created successfully');
      }
      setShowModal(false);
      setEditingStruktur(null);
      setFormData({ nama: '', jabatan: '', periode: '', kontak: '' });
      fetchStruktur();
    } catch (error) {
      toast.error('Failed to save struktur');
    }
  };

  const handleEdit = (struktur) => {
    setEditingStruktur(struktur);
    setFormData({
      nama: struktur.nama,
      jabatan: struktur.jabatan || '',
      periode: struktur.periode || '',
      kontak: struktur.kontak || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this struktur?')) {
      try {
        await axios.delete(`https://finalbackend-ochre.vercel.app/api/struktur/${id}`);
        toast.success('Struktur deleted successfully');
        fetchStruktur();
      } catch (error) {
        toast.error('Failed to delete struktur');
      }
    }
  };

  const openModal = () => {
    setEditingStruktur(null);
    setFormData({ nama: '', jabatan: '', periode: '', kontak: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStruktur(null);
    setFormData({ nama: '', jabatan: '', periode: '', kontak: '' });
  };

  if (loading) {
    return <div className="loading">Loading struktur data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Struktur Management</h1>
        <p className="page-subtitle">Manage temple organizational structure</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Struktur List</h3>
          <button className="btn btn-primary" onClick={openModal}>
            <FiPlus /> Add Struktur
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Jabatan</th>
                <th>Periode</th>
                <th>Kontak</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {struktur.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '500' }}>{item.nama}</td>
                  <td>{item.jabatan || '-'}</td>
                  <td>{item.periode || '-'}</td>
                  <td>{item.kontak || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleEdit(item)}
                        style={{ flexShrink: 0 }}
                      >
                        <FiEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item._id)}
                        style={{ flexShrink: 0 }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingStruktur ? 'Edit Struktur' : 'Add New Struktur'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama *</label>
                <input
                  type="text"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jabatan</label>
                <input
                  type="text"
                  name="jabatan"
                  value={formData.jabatan}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Periode</label>
                  <input
                    type="text"
                    name="periode"
                    value={formData.periode}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., 2024-2026"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Kontak</label>
                  <input
                    type="text"
                    name="kontak"
                    value={formData.kontak}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStruktur ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StrukturManagement;
