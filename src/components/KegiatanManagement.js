import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiCalendar } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';

const KegiatanManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState(null);
  const [formData, setFormData] = useState({
    namaKegiatan: '',
    deskripsi: '',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date().toISOString().split('T')[0],
    waktu: '',
    tempat: '',
    kapasitas: '',
    status: 'akan_datang'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalKegiatan: 0,
    kegiatanPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchKegiatan = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://finalbackend-ochre.vercel.app/api/kegiatan?page=${currentPage}&limit=20`);
      const data = response.data;
      if (Array.isArray(data)) {
        setKegiatan(data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalKegiatan: data.length,
          kegiatanPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else if (data.kegiatan && Array.isArray(data.kegiatan)) {
        setKegiatan(data.kegiatan);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalKegiatan: data.kegiatan.length,
          kegiatanPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        setKegiatan([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalKegiatan: 0,
          kegiatanPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error('Error fetching kegiatan:', error);
      toast.error('Failed to fetch kegiatan data');
      setKegiatan([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalKegiatan: 0,
        kegiatanPerPage: 20,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKegiatan();
  }, [currentPage, refreshTrigger]);

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
      const dataToSend = {
        ...formData,
        tanggalMulai: new Date(formData.tanggalMulai).toISOString(),
        tanggalSelesai: new Date(formData.tanggalSelesai).toISOString(),
        kapasitas: formData.kapasitas ? parseInt(formData.kapasitas) : null
      };

      if (editingKegiatan) {
        await axios.put(`https://finalbackend-ochre.vercel.app/api/kegiatan/${editingKegiatan._id}`, dataToSend);
        toast.success('Kegiatan updated successfully');
      } else {
        await axios.post('https://finalbackend-ochre.vercel.app/api/kegiatan', dataToSend);
        toast.success('Kegiatan created successfully');
      }
      setShowModal(false);
      setEditingKegiatan(null);
      resetForm();
      setCurrentPage(1);
      fetchKegiatan();
    } catch (error) {
      toast.error('Failed to save kegiatan');
    }
  };

  const resetForm = () => {
    setFormData({
      namaKegiatan: '',
      deskripsi: '',
      tanggalMulai: new Date().toISOString().split('T')[0],
      tanggalSelesai: new Date().toISOString().split('T')[0],
      waktu: '',
      tempat: '',
      kapasitas: '',
      status: 'akan_datang'
    });
  };

  const handleEdit = (kegiatan) => {
    setEditingKegiatan(kegiatan);
    setFormData({
      namaKegiatan: kegiatan.namaKegiatan,
      deskripsi: kegiatan.deskripsi,
      tanggalMulai: kegiatan.tanggalMulai ? kegiatan.tanggalMulai.split('T')[0] : new Date().toISOString().split('T')[0],
      tanggalSelesai: kegiatan.tanggalSelesai ? kegiatan.tanggalSelesai.split('T')[0] : new Date().toISOString().split('T')[0],
      waktu: kegiatan.waktu || '',
      tempat: kegiatan.tempat || '',
      kapasitas: kegiatan.kapasitas || '',
      status: kegiatan.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this kegiatan?')) {
      try {
        await axios.delete(`https://finalbackend-ochre.vercel.app/api/kegiatan/${id}`);
        toast.success('Kegiatan deleted successfully');
        setCurrentPage(1);
        fetchKegiatan();
      } catch (error) {
        toast.error('Failed to delete kegiatan');
      }
    }
  };

  const openModal = () => {
    setEditingKegiatan(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingKegiatan(null);
    resetForm();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'akan_datang': { text: 'Akan Datang', class: 'btn-secondary' },
      'aktif': { text: 'Aktif', class: 'btn-success' },
      'selesai': { text: 'Selesai', class: 'btn-primary' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'btn-secondary' };
    return <span className={`btn btn-sm ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return <div className="loading">Loading kegiatan data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Kegiatan Management</h1>
        <p className="page-subtitle">Manage temple activities and events</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Kegiatan List</h3>
          <button className="btn btn-primary" onClick={openModal}>
            <FiPlus /> Add Kegiatan
          </button>
        </div>

        {/* Top Pagination Controls */}
        {renderPagination()}

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama Kegiatan</th>
                <th>Deskripsi</th>
                <th>Tanggal Mulai</th>
                <th>Tanggal Selesai</th>
                <th>Waktu</th>
                <th>Tempat</th>
                <th>Kapasitas</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {kegiatan.map((item) => (
                <tr key={item._id}>
                  <td>{item.namaKegiatan}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.deskripsi}
                  </td>
                  <td>{formatDate(item.tanggalMulai)}</td>
                  <td>{formatDate(item.tanggalSelesai)}</td>
                  <td>{item.waktu || '-'}</td>
                  <td>{item.tempat || '-'}</td>
                  <td>{item.kapasitas || '-'}</td>
                  <td>{getStatusBadge(item.status)}</td>
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
          <div className="modal-content" style={{ maxWidth: '600px' }} ref={modalRef}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingKegiatan ? 'Edit Kegiatan' : 'Add New Kegiatan'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Kegiatan *</label>
                <input
                  type="text"
                  name="namaKegiatan"
                  value={formData.namaKegiatan}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi *</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Tanggal Mulai *</label>
                  <input
                    type="date"
                    name="tanggalMulai"
                    value={formData.tanggalMulai}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Selesai *</label>
                  <input
                    type="date"
                    name="tanggalSelesai"
                    value={formData.tanggalSelesai}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Waktu</label>
                  <input
                    type="text"
                    name="waktu"
                    value={formData.waktu}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="e.g., 09:00 - 12:00"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tempat</label>
                  <input
                    type="text"
                    name="tempat"
                    value={formData.tempat}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Kapasitas</label>
                  <input
                    type="number"
                    name="kapasitas"
                    value={formData.kapasitas}
                    onChange={handleChange}
                    className="form-control"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-control"
                  >
                    <option value="akan_datang">Akan Datang</option>
                    <option value="aktif">Aktif</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingKegiatan ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default KegiatanManagement;
