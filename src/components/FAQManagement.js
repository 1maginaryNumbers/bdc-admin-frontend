import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';

const FAQManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [formData, setFormData] = useState({
    pertanyaan: '',
    jawaban: '',
    urutan: 0,
    status: 'aktif'
  });

  useEffect(() => {
    fetchFAQs();
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

  const fetchFAQs = async () => {
    try {
      const response = await axios.get('https://finalbackend-ochre.vercel.app/api/faq');
      const data = response.data;
      if (Array.isArray(data)) {
        setFaqs(data);
      } else {
        setFaqs([]);
      }
    } catch (error) {
      toast.error('Failed to fetch FAQ data');
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'urutan' ? parseInt(value) || 0 : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFAQ) {
        await axios.put(
          `https://finalbackend-ochre.vercel.app/api/faq/${editingFAQ._id}`,
          formData
        );
        toast.success('FAQ updated successfully');
      } else {
        await axios.post(
          'https://finalbackend-ochre.vercel.app/api/faq',
          formData
        );
        toast.success('FAQ created successfully');
      }
      setShowModal(false);
      setEditingFAQ(null);
      setFormData({ pertanyaan: '', jawaban: '', urutan: 0, status: 'aktif' });
      fetchFAQs();
    } catch (error) {
      toast.error('Failed to save FAQ');
    }
  };

  const handleEdit = (faq) => {
    setEditingFAQ(faq);
    setFormData({
      pertanyaan: faq.pertanyaan,
      jawaban: faq.jawaban,
      urutan: faq.urutan || 0,
      status: faq.status || 'aktif'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await axios.delete(`https://finalbackend-ochre.vercel.app/api/faq/${id}`);
        toast.success('FAQ deleted successfully');
        fetchFAQs();
      } catch (error) {
        toast.error('Failed to delete FAQ');
      }
    }
  };

  const openModal = () => {
    setEditingFAQ(null);
    setFormData({ pertanyaan: '', jawaban: '', urutan: 0, status: 'aktif' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFAQ(null);
    setFormData({ pertanyaan: '', jawaban: '', urutan: 0, status: 'aktif' });
  };

  if (loading) {
    return <div className="loading">Loading FAQ data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">FAQ Management</h1>
        <p className="page-subtitle">Manage frequently asked questions</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>FAQ List</h3>
          <button className="btn btn-primary" onClick={openModal}>
            <FiPlus /> Add FAQ
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Urutan</th>
                <th>Pertanyaan</th>
                <th>Jawaban</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((item) => (
                <tr key={item._id}>
                  <td>{item.urutan || 0}</td>
                  <td style={{ fontWeight: '500' }}>{item.pertanyaan}</td>
                  <td style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.jawaban}
                  </td>
                  <td>
                    <span
                      className={`badge ${item.status === 'aktif' ? 'badge-success' : 'badge-secondary'}`}
                    >
                      {item.status}
                    </span>
                  </td>
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

        {faqs.length === 0 && (
          <div className="text-center py-4">
            <p className="text-muted">No FAQ found. Click "Add FAQ" to create one.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '700px' }} ref={modalRef}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Pertanyaan *</label>
                <input
                  type="text"
                  name="pertanyaan"
                  value={formData.pertanyaan}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Jawaban *</label>
                <textarea
                  name="jawaban"
                  value={formData.jawaban}
                  onChange={handleChange}
                  className="form-control"
                  rows="8"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Urutan</label>
                <input
                  type="number"
                  name="urutan"
                  value={formData.urutan}
                  onChange={handleChange}
                  className="form-control"
                  min="0"
                />
                <small className="form-text text-muted">FAQ dengan urutan lebih kecil akan ditampilkan lebih dulu</small>
              </div>

              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="aktif">Aktif</option>
                  <option value="nonaktif">Nonaktif</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingFAQ ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQManagement;

