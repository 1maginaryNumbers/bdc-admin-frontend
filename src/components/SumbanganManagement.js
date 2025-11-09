import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiDollarSign, FiImage } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';
import { compressImage, isFileSizeAcceptable, formatFileSize } from '../utils/imageCompression';

const SumbanganManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [sumbangan, setSumbangan] = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTransaksiModal, setShowTransaksiModal] = useState(false);
  const [editingSumbangan, setEditingSumbangan] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    namaEvent: '',
    deskripsi: '',
    bankName: '',
    bankNumber: '',
    targetDana: '',
    tanggalSelesai: '',
    status: 'aktif'
  });
  const [transaksiFormData, setTransaksiFormData] = useState({
    nama: '',
    jumlah: '',
    metode: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  useEscapeKey(() => {
    if (showModal) {
      closeModal();
    }
    if (showTransaksiModal) {
      closeTransaksiModal();
    }
  });

  const modalRef = useOutsideClick(() => {
    if (showModal) {
      closeModal();
    }
  });

  const transaksiModalRef = useOutsideClick(() => {
    if (showTransaksiModal) {
      closeTransaksiModal();
    }
  });

  const fetchData = async () => {
    try {
      const [sumbanganRes, transaksiRes] = await Promise.all([
        axios.get('https://finalbackend-ochre.vercel.app/api/sumbangan'),
        axios.get('https://finalbackend-ochre.vercel.app/api/sumbangan/transaksi')
      ]);
      
      const sumbanganData = sumbanganRes.data;
      if (Array.isArray(sumbanganData)) {
        setSumbangan(sumbanganData);
      } else if (sumbanganData.sumbangan && Array.isArray(sumbanganData.sumbangan)) {
        setSumbangan(sumbanganData.sumbangan);
      } else {
        setSumbangan([]);
      }
      
      setTransaksi(transaksiRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
      setSumbangan([]);
      setTransaksi([]);
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (!isFileSizeAcceptable(file, 4)) {
      toast.info(`Image size is ${formatFileSize(file.size)}. Compressing...`);
    }

    try {
      const compressedFile = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.7,
        maxSizeMB: 1
      });

      if (compressedFile.size < file.size) {
        toast.success(`Image compressed: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`);
      }
      setSelectedFile(compressedFile);
    } catch (error) {
      console.error('Error compressing image:', error);
      toast.warning('Using original image file');
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('namaEvent', formData.namaEvent);
      formDataToSend.append('deskripsi', formData.deskripsi);
      formDataToSend.append('bankName', formData.bankName);
      formDataToSend.append('bankNumber', formData.bankNumber);
      formDataToSend.append('targetDana', parseFloat(formData.targetDana));
      if (formData.tanggalSelesai) {
        formDataToSend.append('tanggalSelesai', formData.tanggalSelesai);
      }
      formDataToSend.append('status', formData.status);

      if (selectedFile) {
        formDataToSend.append('qrisImage', selectedFile);
      }

      if (editingSumbangan) {
        await axios.put(`https://finalbackend-ochre.vercel.app/api/sumbangan/${editingSumbangan._id}`, formDataToSend);
        toast.success('Donation event updated successfully');
      } else {
        await axios.post('https://finalbackend-ochre.vercel.app/api/sumbangan', formDataToSend);
        toast.success('Donation event created successfully');
      }
      setShowModal(false);
      setEditingSumbangan(null);
      setSelectedFile(null);
      setFormData({ namaEvent: '', deskripsi: '', bankName: '', bankNumber: '', targetDana: '', tanggalSelesai: '', status: 'aktif' });
      fetchData();
    } catch (error) {
      toast.error('Failed to save donation event');
    }
  };

  const handleTransaksiChange = (e) => {
    setTransaksiFormData({
      ...transaksiFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleTransaksiSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...transaksiFormData,
        jumlah: parseFloat(transaksiFormData.jumlah)
      };

      await axios.post('https://finalbackend-ochre.vercel.app/api/sumbangan/transaksi', dataToSend);
      toast.success('Transaksi created successfully');
      setShowTransaksiModal(false);
      setTransaksiFormData({ nama: '', jumlah: '', metode: '', status: 'pending' });
      fetchData();
    } catch (error) {
      toast.error('Failed to save transaksi');
    }
  };

  const handleEdit = (sumbangan) => {
    setEditingSumbangan(sumbangan);
    setFormData({
      namaEvent: sumbangan.namaEvent || '',
      deskripsi: sumbangan.deskripsi || '',
      bankName: sumbangan.bankName || '',
      bankNumber: sumbangan.bankNumber || '',
      targetDana: sumbangan.targetDana ? sumbangan.targetDana.toString() : '',
      tanggalSelesai: sumbangan.tanggalSelesai ? new Date(sumbangan.tanggalSelesai).toISOString().split('T')[0] : '',
      status: sumbangan.status || 'aktif'
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this donation event?')) {
      try {
        await axios.delete(`https://finalbackend-ochre.vercel.app/api/sumbangan/${id}`);
        toast.success('Donation event deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete donation event');
      }
    }
  };

  const handleUpdateTransaksiStatus = async (id, status) => {
    try {
      await axios.put(`https://finalbackend-ochre.vercel.app/api/sumbangan/transaksi/${id}/status`, { status });
      toast.success('Transaksi status updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update transaksi status');
    }
  };

  const openModal = () => {
    setEditingSumbangan(null);
    setFormData({ namaEvent: '', deskripsi: '', bankName: '', bankNumber: '', targetDana: '', tanggalSelesai: '', status: 'aktif' });
    setSelectedFile(null);
    setShowModal(true);
  };

  const openTransaksiModal = () => {
    setTransaksiFormData({ nama: '', jumlah: '', metode: '', status: 'pending' });
    setShowTransaksiModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSumbangan(null);
    setSelectedFile(null);
    setFormData({ namaEvent: '', deskripsi: '', bankName: '', bankNumber: '', targetDana: '', tanggalSelesai: '', status: 'aktif' });
  };

  const closeTransaksiModal = () => {
    setShowTransaksiModal(false);
    setTransaksiFormData({ nama: '', jumlah: '', metode: '', status: 'pending' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'aktif': { text: 'Aktif', class: 'btn-success' },
      'selesai': { text: 'Selesai', class: 'btn-secondary' },
      'ditutup': { text: 'Ditutup', class: 'btn-danger' },
      'pending': { text: 'Pending', class: 'btn-secondary' },
      'completed': { text: 'Completed', class: 'btn-success' },
      'failed': { text: 'Failed', class: 'btn-danger' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'btn-secondary' };
    return <span className={`btn btn-sm ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) {
      return url;
    }
    return url;
  };

  if (loading) {
    return <div className="loading">Loading donation events...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sumbangan Management</h1>
        <p className="page-subtitle">Manage donation events and transactions</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Donation Events</h3>
          <div className="d-flex gap-2">
            <button className="btn btn-success" onClick={openTransaksiModal}>
              <FiPlus /> Add Transaksi
            </button>
            <button className="btn btn-primary" onClick={openModal}>
              <FiPlus /> Add Event
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Description</th>
                <th>Bank Info</th>
                <th>Target</th>
                <th>Collected</th>
                <th>QRIS</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sumbangan.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '500' }}>{item.namaEvent || item.namaPaket || '-'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.deskripsi || '-'}
                  </td>
                  <td>
                    {item.bankName ? (
                      <div>
                        <div style={{ fontWeight: '500' }}>{item.bankName}</div>
                        <div style={{ fontSize: '0.9em', color: '#666' }}>{item.bankNumber || '-'}</div>
                      </div>
                    ) : '-'}
                  </td>
                  <td>{formatCurrency(item.targetDana || 0)}</td>
                  <td>{formatCurrency(item.danaTerkumpul || 0)}</td>
                  <td>
                    {item.qrisImage ? (
                      <img 
                        src={getImageUrl(item.qrisImage)} 
                        alt="QRIS" 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <span style={{ color: '#999' }}>No QRIS</span>
                    )}
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
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

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Transaksi List</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Jumlah</th>
                <th>Metode</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transaksi.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '500' }}>{item.nama || item.namaDonatur || '-'}</td>
                  <td>{formatCurrency(item.jumlah || item.nominal || 0)}</td>
                  <td>{item.metode || item.metodePembayaran || '-'}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>{formatDate(item.tanggal || item.tanggalTransaksi)}</td>
                  <td>
                    {item.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleUpdateTransaksiStatus(item._id, 'completed')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleUpdateTransaksiStatus(item._id, 'failed')}
                          style={{ marginLeft: '8px' }}
                        >
                          Reject
                        </button>
                      </>
                    )}
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
                {editingSumbangan ? 'Edit Donation Event' : 'Add New Donation Event'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Event Name *</label>
                <input
                  type="text"
                  name="namaEvent"
                  value={formData.namaEvent}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Bank Number *</label>
                  <input
                    type="text"
                    name="bankNumber"
                    value={formData.bankNumber}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Target Amount *</label>
                  <input
                    type="number"
                    name="targetDana"
                    value={formData.targetDana}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="tanggalSelesai"
                    value={formData.tanggalSelesai}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="aktif">Aktif</option>
                  <option value="selesai">Selesai</option>
                  <option value="ditutup">Ditutup</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">QRIS Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-control"
                />
                {selectedFile && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={URL.createObjectURL(selectedFile)} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                    />
                  </div>
                )}
                {editingSumbangan && editingSumbangan.qrisImage && !selectedFile && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Current QRIS:</p>
                    <img 
                      src={getImageUrl(editingSumbangan.qrisImage)} 
                      alt="Current QRIS" 
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSumbangan ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransaksiModal && (
        <div className="modal">
          <div className="modal-content" ref={transaksiModalRef}>
            <div className="modal-header">
              <h3 className="modal-title">Add New Transaksi</h3>
              <button className="close-btn" onClick={closeTransaksiModal}>×</button>
            </div>

            <form onSubmit={handleTransaksiSubmit}>
              <div className="form-group">
                <label className="form-label">Nama *</label>
                <input
                  type="text"
                  name="nama"
                  value={transaksiFormData.nama}
                  onChange={handleTransaksiChange}
                  className="form-control"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Jumlah *</label>
                  <input
                    type="number"
                    name="jumlah"
                    value={transaksiFormData.jumlah}
                    onChange={handleTransaksiChange}
                    className="form-control"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Metode</label>
                  <select
                    name="metode"
                    value={transaksiFormData.metode}
                    onChange={handleTransaksiChange}
                    className="form-control"
                  >
                    <option value="">Select Metode</option>
                    <option value="cash">Cash</option>
                    <option value="transfer">Transfer</option>
                    <option value="check">Check</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={transaksiFormData.status}
                  onChange={handleTransaksiChange}
                  className="form-control"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeTransaksiModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SumbanganManagement;
