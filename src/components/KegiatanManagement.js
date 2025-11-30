import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';

const KegiatanManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [kegiatan, setKegiatan] = useState([]);
  const [filteredKegiatan, setFilteredKegiatan] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingKegiatan, setEditingKegiatan] = useState(null);
  const [filters, setFilters] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: ''
  });
  const [formData, setFormData] = useState({
    namaKegiatan: '',
    deskripsi: '',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date().toISOString().split('T')[0],
    waktuMulai: '',
    waktuSelesai: '',
    tempat: '',
    kapasitas: '',
    kategori: '',
    status: 'akan_datang'
  });
  const [sameDay, setSameDay] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalKegiatan: 0,
    kegiatanPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchKegiatan = useCallback(async () => {
    try {
      setLoading(true);
      const [kegiatanRes, kategoriRes] = await Promise.all([
        axios.get(`https://finalbackend-ochre.vercel.app/api/kegiatan?page=${currentPage}&limit=20`),
        axios.get('https://finalbackend-ochre.vercel.app/api/kategori-jadwal')
      ]);
      setKategori(kategoriRes.data);
      const data = kegiatanRes.data;
      
      let kegiatanList = [];
      if (Array.isArray(data)) {
        kegiatanList = data;
      } else if (data.kegiatan && Array.isArray(data.kegiatan)) {
        kegiatanList = data.kegiatan;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const updatedKegiatan = kegiatanList.map((item) => {
        if (item.tanggalSelesai && item.status !== 'selesai') {
          const endDate = new Date(item.tanggalSelesai);
          endDate.setHours(0, 0, 0, 0);
          
          if (endDate < today) {
            return { ...item, status: 'selesai' };
          }
        }
        return item;
      });
      
      if (Array.isArray(data)) {
        setKegiatan(updatedKegiatan);
        setFilteredKegiatan(updatedKegiatan);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalKegiatan: updatedKegiatan.length,
          kegiatanPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else if (data.kegiatan && Array.isArray(data.kegiatan)) {
        setKegiatan(updatedKegiatan);
        setFilteredKegiatan(updatedKegiatan);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalKegiatan: updatedKegiatan.length,
          kegiatanPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        setKegiatan([]);
        setFilteredKegiatan([]);
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
      setFilteredKegiatan([]);
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
  }, [currentPage]);

  useEffect(() => {
    fetchKegiatan();
  }, [fetchKegiatan, refreshTrigger]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
    setSelectedItems([]); // Clear selections when filters change
  };

  useEffect(() => {
    let filtered = [...kegiatan];
    
    if (filters.name) {
      filtered = filtered.filter(item => 
        (item.namaKegiatan || '').toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    
    if (filters.startDate) {
      filtered = filtered.filter(item => {
        if (!item.tanggalMulai) return false;
        const itemDate = new Date(item.tanggalMulai).toISOString().split('T')[0];
        return itemDate === filters.startDate;
      });
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(item => {
        if (!item.tanggalSelesai) return false;
        const itemDate = new Date(item.tanggalSelesai).toISOString().split('T')[0];
        return itemDate === filters.endDate;
      });
    }
    
    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    setFilteredKegiatan(filtered);
  }, [filters, kegiatan]);

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
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'sameDay') {
      setSameDay(checked);
      if (checked) {
        setFormData({
          ...formData,
          tanggalSelesai: formData.tanggalMulai
        });
      }
    } else {
      const newFormData = {
        ...formData,
        [name]: value
      };
      
      if (name === 'tanggalMulai' && sameDay) {
        newFormData.tanggalSelesai = value;
      }
      
      setFormData(newFormData);
    }
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
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      namaKegiatan: '',
      deskripsi: '',
      tanggalMulai: today,
      tanggalSelesai: today,
      waktuMulai: '',
      waktuSelesai: '',
      tempat: '',
      kapasitas: '',
      kategori: '',
      status: 'akan_datang'
    });
    setSameDay(true);
  };

  const handleEdit = (kegiatan) => {
    setEditingKegiatan(kegiatan);
    const tanggalMulai = kegiatan.tanggalMulai ? kegiatan.tanggalMulai.split('T')[0] : new Date().toISOString().split('T')[0];
    const tanggalSelesai = kegiatan.tanggalSelesai ? kegiatan.tanggalSelesai.split('T')[0] : tanggalMulai;
    const isSameDay = !kegiatan.tanggalSelesai || tanggalMulai === tanggalSelesai;
    
    setFormData({
      namaKegiatan: kegiatan.namaKegiatan || '',
      deskripsi: kegiatan.deskripsi || '',
      tanggalMulai: tanggalMulai,
      tanggalSelesai: tanggalSelesai,
      waktuMulai: kegiatan.waktuMulai || kegiatan.waktu || '',
      waktuSelesai: kegiatan.waktuSelesai || '',
      tempat: kegiatan.tempat || '',
      kapasitas: kegiatan.kapasitas || '',
      kategori: kegiatan.kategori?._id || kegiatan.kategori || '',
      status: kegiatan.status || 'akan_datang'
    });
    setSameDay(isSameDay);
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

  const handleForceComplete = async (kegiatan) => {
    if (window.confirm(`Are you sure you want to mark "${kegiatan.namaKegiatan}" as completed?`)) {
      try {
        await axios.put(`https://finalbackend-ochre.vercel.app/api/kegiatan/${kegiatan._id}`, {
          namaKegiatan: kegiatan.namaKegiatan,
          deskripsi: kegiatan.deskripsi,
          tanggalMulai: kegiatan.tanggalMulai,
          tanggalSelesai: kegiatan.tanggalSelesai,
          waktuMulai: kegiatan.waktuMulai,
          waktuSelesai: kegiatan.waktuSelesai,
          tempat: kegiatan.tempat,
          kapasitas: kegiatan.kapasitas,
          kategori: kegiatan.kategori?._id || kegiatan.kategori,
          status: 'selesai'
        });
        toast.success('Kegiatan marked as completed');
        fetchKegiatan();
      } catch (error) {
        toast.error('Failed to update kegiatan status');
      }
    }
  };

  const handleActivate = async (kegiatan) => {
    if (window.confirm(`Are you sure you want to activate "${kegiatan.namaKegiatan}"?`)) {
      try {
        await axios.put(`https://finalbackend-ochre.vercel.app/api/kegiatan/${kegiatan._id}/activate`);
        toast.success('Kegiatan activated successfully');
        fetchKegiatan();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to activate kegiatan');
      }
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredKegiatan.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredKegiatan.map(item => item._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select items to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
      try {
        await axios.post('https://finalbackend-ochre.vercel.app/api/kegiatan/bulk-delete', { ids: selectedItems });
        toast.success(`Successfully deleted ${selectedItems.length} item(s)`);
        setSelectedItems([]);
        fetchKegiatan();
      } catch (error) {
        toast.error('Failed to delete items');
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
      'sedang_berlangsung': { text: 'Sedang Berlangsung', class: 'btn-success' },
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
          <div style={{ display: 'flex', gap: '10px' }}>
            {selectedItems.length > 0 && (
              <button className="btn btn-danger" onClick={handleBulkDelete}>
                <FiTrash2 /> Delete Selected ({selectedItems.length})
              </button>
            )}
            <button className="btn btn-primary" onClick={openModal}>
              <FiPlus /> Add Kegiatan
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label" style={{ marginBottom: '5px', display: 'block' }}>Filter by Name</label>
            <input
              type="text"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              className="form-control"
              placeholder="Search activity name..."
            />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label" style={{ marginBottom: '5px', display: 'block' }}>Filter by Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label" style={{ marginBottom: '5px', display: 'block' }}>Filter by End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="form-control"
            />
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label className="form-label" style={{ marginBottom: '5px', display: 'block' }}>Filter by Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="form-control"
            >
              <option value="">All Status</option>
              <option value="akan_datang">Akan Datang</option>
              <option value="sedang_berlangsung">Sedang Berlangsung</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setFilters({ name: '', startDate: '', endDate: '', status: '' })}
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Top Pagination Controls */}
        {renderPagination()}

        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredKegiatan.length && filteredKegiatan.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Nama Kegiatan</th>
                <th>Deskripsi</th>
                <th>Kategori</th>
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
              {filteredKegiatan.map((item) => (
                <tr key={item._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => handleSelectItem(item._id)}
                    />
                  </td>
                  <td>{item.namaKegiatan}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.deskripsi}
                  </td>
                  <td>{item.kategori?.nama || '-'}</td>
                  <td>{formatDate(item.tanggalMulai)}</td>
                  <td>{formatDate(item.tanggalSelesai)}</td>
                  <td>
                    {item.waktuMulai && item.waktuSelesai
                      ? `${item.waktuMulai} - ${item.waktuSelesai}`
                      : item.waktuMulai || item.waktu || '-'}
                  </td>
                  <td>{item.tempat || '-'}</td>
                  <td>{item.kapasitas || '-'}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
                      {item.status === 'akan_datang' && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleActivate(item)}
                          style={{ flexShrink: 0 }}
                          title="Activate Kegiatan"
                        >
                          Activate
                        </button>
                      )}
                      {item.status !== 'selesai' && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleForceComplete(item)}
                          style={{ flexShrink: 0 }}
                          title="Mark as Completed"
                        >
                          Complete
                        </button>
                      )}
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

        {/* Bottom Pagination Controls */}
        {renderPagination()}
      </div>

      {showModal && (
        <div className="modal" style={{
          padding: window.innerWidth <= 768 ? '5px' : '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto'
        }}>
          <div 
            className="modal-content" 
            ref={modalRef}
            style={{
              width: window.innerWidth <= 768 ? '100%' : '600px',
              maxWidth: window.innerWidth <= 768 ? '100%' : '600px',
              maxHeight: window.innerWidth <= 768 ? '95vh' : '90vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              margin: 'auto',
              boxSizing: 'border-box',
              position: 'relative'
            }}
          >
            <div className="modal-header">
              <h3 className="modal-title">
                {editingKegiatan ? 'Edit Kegiatan' : 'Tambah Kegiatan Baru'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ width: '100%', boxSizing: 'border-box' }}>
              <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                <label className="form-label">Judul *</label>
                <input
                  type="text"
                  name="namaKegiatan"
                  value={formData.namaKegiatan}
                  onChange={handleChange}
                  className="form-control"
                  required
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                <label className="form-label">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                gap: '15px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">Tanggal Mulai *</label>
                  <input
                    type="date"
                    name="tanggalMulai"
                    value={formData.tanggalMulai}
                    onChange={handleChange}
                    className="form-control"
                    required
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">Tanggal Selesai *</label>
                  <input
                    type="date"
                    name="tanggalSelesai"
                    value={formData.tanggalSelesai}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={sameDay}
                    min={formData.tanggalMulai}
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ width: '100%', boxSizing: 'border-box', marginBottom: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="sameDay"
                    checked={sameDay}
                    onChange={handleChange}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span>Kegiatan dimulai dan berakhir di hari yang sama</span>
                </label>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                gap: '15px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">Kategori *</label>
                  <select
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                    className="form-control"
                    required
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  >
                    <option value="">Tidak Ada Kategori</option>
                    {kategori.map((kat) => (
                      <option key={kat._id} value={kat._id}>
                        {kat.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-control"
                    required
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  >
                    <option value="akan_datang">Akan Datang</option>
                    <option value="sedang_berlangsung">Sedang Berlangsung</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                gap: '15px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">Waktu Mulai *</label>
                  <input
                    type="time"
                    name="waktuMulai"
                    value={formData.waktuMulai}
                    onChange={handleChange}
                    className="form-control"
                    required
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">Waktu Selesai *</label>
                  <input
                    type="time"
                    name="waktuSelesai"
                    value={formData.waktuSelesai}
                    onChange={handleChange}
                    className="form-control"
                    required
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
                gap: '15px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">Tempat *</label>
                  <input
                    type="text"
                    name="tempat"
                    value={formData.tempat}
                    onChange={handleChange}
                    className="form-control"
                    required
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>

                <div className="form-group" style={{ width: '100%', boxSizing: 'border-box' }}>
                  <label className="form-label">Kapasitas *</label>
                  <input
                    type="number"
                    name="kapasitas"
                    value={formData.kapasitas}
                    onChange={handleChange}
                    className="form-control"
                    min="1"
                    required
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{
                display: 'flex',
                flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
                gap: '10px'
              }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={closeModal}
                  style={{
                    width: window.innerWidth <= 768 ? '100%' : 'auto',
                    padding: window.innerWidth <= 768 ? '12px' : '8px 16px'
                  }}
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{
                    width: window.innerWidth <= 768 ? '100%' : 'auto',
                    padding: window.innerWidth <= 768 ? '12px' : '8px 16px'
                  }}
                >
                  {editingKegiatan ? 'Perbarui' : 'Buat'}
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
