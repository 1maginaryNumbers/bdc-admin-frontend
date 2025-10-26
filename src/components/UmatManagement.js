import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiUsers } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';

const UmatManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [umat, setUmat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUmat, setEditingUmat] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    kontak: '',
    alamat: '',
    email: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUmat: 0,
    umatPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchUmat = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://finalbackend-ochre.vercel.app/api/umat?page=${currentPage}&limit=20`);
      const data = response.data;
      if (Array.isArray(data)) {
        setUmat(data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalUmat: data.length,
          umatPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else if (data.umat && Array.isArray(data.umat)) {
        setUmat(data.umat);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalUmat: data.umat.length,
          umatPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        setUmat([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalUmat: 0,
          umatPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      toast.error('Failed to fetch umat data');
      setUmat([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalUmat: 0,
        umatPerPage: 20,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchUmat();
  }, [fetchUmat, refreshTrigger]);

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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-center align-items-center mt-3">
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
          >
            Previous
          </button>
          
          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const startPage = Math.max(1, pagination.currentPage - 2);
            const pageNum = startPage + i;
            if (pageNum > pagination.totalPages) return null;
            
            return (
              <button
                key={pageNum}
                className={`btn btn-sm ${pageNum === pagination.currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
          </button>
        </div>
      </div>
    );
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
      if (editingUmat) {
        await axios.put(`http://finalbackend-ochre.vercel.app/api/umat/${editingUmat._id}`, formData);
        toast.success('Umat updated successfully');
      } else {
        await axios.post('http://finalbackend-ochre.vercel.app/api/umat', formData);
        toast.success('Umat created successfully');
      }
      setShowModal(false);
      setEditingUmat(null);
      setFormData({ nama: '', kontak: '', alamat: '', email: '' });
      setCurrentPage(1);
      fetchUmat();
    } catch (error) {
      toast.error('Failed to save umat');
    }
  };

  const handleEdit = (umat) => {
    setEditingUmat(umat);
    setFormData({
      nama: umat.nama,
      kontak: umat.kontak || '',
      alamat: umat.alamat || '',
      email: umat.email || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this umat?')) {
      try {
        await axios.delete(`http://finalbackend-ochre.vercel.app/api/umat/${id}`);
        toast.success('Umat deleted successfully');
        setCurrentPage(1);
        fetchUmat();
      } catch (error) {
        toast.error('Failed to delete umat');
      }
    }
  };

  const openModal = () => {
    setEditingUmat(null);
    setFormData({ nama: '', kontak: '', alamat: '', email: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUmat(null);
    setFormData({ nama: '', kontak: '', alamat: '', email: '' });
  };

  if (loading) {
    return <div className="loading">Loading umat data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Umat Management</h1>
        <p className="page-subtitle">Manage congregation members</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Umat List</h3>
          <button className="btn btn-primary" onClick={openModal}>
            <FiPlus /> Add Umat
          </button>
        </div>

        {/* Top Pagination Controls */}
        {renderPagination()}

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Kontak</th>
                <th>Alamat</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {umat.map((item) => (
                <tr key={item._id}>
                  <td>{item.nama}</td>
                  <td>{item.kontak || '-'}</td>
                  <td>{item.alamat || '-'}</td>
                  <td>{item.email || '-'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(item)}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item._id)}
                      style={{ marginLeft: '8px' }}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination Controls */}
        {renderPagination()}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingUmat ? 'Edit Umat' : 'Add New Umat'}
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
                <label className="form-label">Kontak</label>
                <input
                  type="text"
                  name="kontak"
                  value={formData.kontak}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alamat</label>
                <textarea
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingUmat ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UmatManagement;
