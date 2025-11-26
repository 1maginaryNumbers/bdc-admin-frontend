import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiX, FiEye } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';
import { compressImage, isFileSizeAcceptable, formatFileSize } from '../utils/imageCompression';

const PaketSumbanganManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [paketSumbangan, setPaketSumbangan] = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPaket, setEditingPaket] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    namaPaket: '',
    deskripsi: '',
    nominal: '',
    detailBarang: [],
    status: 'nonaktif',
    tanggalMulai: '',
    tanggalSelesai: '',
    stok: ''
  });
  const [newBarang, setNewBarang] = useState({
    namaBarang: '',
    jumlah: 1,
    keterangan: ''
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  useEscapeKey(() => {
    if (showModal) {
      closeModal();
    }
    if (showDetailModal) {
      setShowDetailModal(false);
      setSelectedTransaksi(null);
    }
  });

  const modalRef = useOutsideClick(() => {
    if (showModal) {
      closeModal();
    }
  });

  const fetchData = async () => {
    try {
      const [paketRes, transaksiRes] = await Promise.all([
        axios.get('https://finalbackend-ochre.vercel.app/api/paket-sumbangan'),
        axios.get('https://finalbackend-ochre.vercel.app/api/paket-sumbangan/transaksi/all')
      ]);
      
      setPaketSumbangan(paketRes.data || []);
      setTransaksi(transaksiRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
      setPaketSumbangan([]);
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

  const handleAddBarang = () => {
    if (!newBarang.namaBarang) {
      toast.error('Nama barang is required');
      return;
    }
    setFormData({
      ...formData,
      detailBarang: [...formData.detailBarang, { ...newBarang }]
    });
    setNewBarang({ namaBarang: '', jumlah: 1, keterangan: '' });
  };

  const handleRemoveBarang = (index) => {
    setFormData({
      ...formData,
      detailBarang: formData.detailBarang.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('namaPaket', formData.namaPaket);
      formDataToSend.append('deskripsi', formData.deskripsi);
      formDataToSend.append('nominal', parseFloat(formData.nominal));
      formDataToSend.append('detailBarang', JSON.stringify(formData.detailBarang));
      formDataToSend.append('status', formData.status);
      if (formData.tanggalMulai) {
        formDataToSend.append('tanggalMulai', formData.tanggalMulai);
      }
      if (formData.tanggalSelesai) {
        formDataToSend.append('tanggalSelesai', formData.tanggalSelesai);
      }
      if (formData.stok) {
        formDataToSend.append('stok', parseInt(formData.stok));
      }

      if (selectedFile) {
        formDataToSend.append('gambar', selectedFile);
      }

      if (editingPaket) {
        await axios.put(`https://finalbackend-ochre.vercel.app/api/paket-sumbangan/${editingPaket._id}`, formDataToSend);
        toast.success('Paket sumbangan updated successfully');
      } else {
        await axios.post('https://finalbackend-ochre.vercel.app/api/paket-sumbangan', formDataToSend);
        toast.success('Paket sumbangan created successfully');
      }
      setShowModal(false);
      setEditingPaket(null);
      setSelectedFile(null);
      setFormData({ namaPaket: '', deskripsi: '', nominal: '', detailBarang: [], status: 'nonaktif', tanggalMulai: '', tanggalSelesai: '', stok: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to save paket sumbangan');
    }
  };

  const handleEdit = (paket) => {
    setEditingPaket(paket);
    setFormData({
      namaPaket: paket.namaPaket || '',
      deskripsi: paket.deskripsi || '',
      nominal: paket.nominal ? paket.nominal.toString() : '',
      detailBarang: paket.detailBarang || [],
      status: paket.status || 'nonaktif',
      tanggalMulai: paket.tanggalMulai ? new Date(paket.tanggalMulai).toISOString().split('T')[0] : '',
      tanggalSelesai: paket.tanggalSelesai ? new Date(paket.tanggalSelesai).toISOString().split('T')[0] : '',
      stok: paket.stok ? paket.stok.toString() : ''
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this paket sumbangan?')) {
      try {
        await axios.delete(`https://finalbackend-ochre.vercel.app/api/paket-sumbangan/${id}`);
        toast.success('Paket sumbangan deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete paket sumbangan');
      }
    }
  };

  const handleUpdateTransaksiStatus = async (id, status) => {
    try {
      await axios.put(`https://finalbackend-ochre.vercel.app/api/paket-sumbangan/transaksi/${id}/status`, { status });
      toast.success('Transaksi status updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update transaksi status');
    }
  };

  const openModal = () => {
    setEditingPaket(null);
    setFormData({ namaPaket: '', deskripsi: '', nominal: '', detailBarang: [], status: 'nonaktif', tanggalMulai: '', tanggalSelesai: '', stok: '' });
    setSelectedFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPaket(null);
    setSelectedFile(null);
    setFormData({ namaPaket: '', deskripsi: '', nominal: '', detailBarang: [], status: 'nonaktif', tanggalMulai: '', tanggalSelesai: '', stok: '' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'aktif': { text: 'Aktif', class: 'btn-success' },
      'nonaktif': { text: 'Nonaktif', class: 'btn-secondary' },
      'pending': { text: 'Pending', class: 'btn-secondary' },
      'berhasil': { text: 'Berhasil', class: 'btn-success' },
      'settlement': { text: 'Settlement', class: 'btn-success' },
      'capture': { text: 'Capture', class: 'btn-success' },
      'gagal': { text: 'Gagal', class: 'btn-danger' },
      'failed': { text: 'Failed', class: 'btn-danger' },
      'deny': { text: 'Deny', class: 'btn-danger' },
      'cancel': { text: 'Cancel', class: 'btn-danger' },
      'expire': { text: 'Expire', class: 'btn-danger' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'btn-secondary' };
    return <span className={`btn btn-sm ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('http')) {
      return url;
    }
    return `${process.env.REACT_APP_API_URL || 'https://finalbackend-ochre.vercel.app'}${url}`;
  };

  if (loading) {
    return <div className="loading">Loading paket sumbangan data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Paket Sumbangan Management</h1>
        <p className="page-subtitle">Manage donation packages for special events</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Paket Sumbangan List</h3>
          <button className="btn btn-primary" onClick={openModal}>
            <FiPlus /> Add Paket
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama Paket</th>
                <th>Nominal</th>
                <th>Detail Barang</th>
                <th>Stok</th>
                <th>Terjual</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paketSumbangan.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '500' }}>{item.namaPaket}</td>
                  <td>{formatCurrency(item.nominal || 0)}</td>
                  <td>
                    {item.detailBarang && item.detailBarang.length > 0 ? (
                      <div style={{ fontSize: '0.85em' }}>
                        {item.detailBarang.map((barang, idx) => (
                          <div key={idx}>
                            {barang.namaBarang} (x{barang.jumlah})
                          </div>
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>{item.stok !== null ? item.stok : 'Unlimited'}</td>
                  <td>{item.terjual || 0}</td>
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
                <th>Nama Pembeli</th>
                <th>Paket</th>
                <th>Jumlah</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transaksi.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '500' }}>{item.namaPembeli}</td>
                  <td>{item.paketSumbangan?.namaPaket || '-'}</td>
                  <td>{formatCurrency(item.nominal || 0)}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>{formatDate(item.tanggalTransaksi)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => {
                          setSelectedTransaksi(item);
                          setShowDetailModal(true);
                        }}
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      {item.status === 'pending' && (
                        <>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleUpdateTransaksiStatus(item._id, 'berhasil')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleUpdateTransaksiStatus(item._id, 'gagal')}
                          >
                            Reject
                          </button>
                        </>
                      )}
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
          <div className="modal-content" ref={modalRef} style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingPaket ? 'Edit Paket Sumbangan' : 'Add New Paket Sumbangan'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Paket *</label>
                <input
                  type="text"
                  name="namaPaket"
                  value={formData.namaPaket}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Deskripsi</label>
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
                  <label className="form-label">Nominal *</label>
                  <input
                    type="number"
                    name="nominal"
                    value={formData.nominal}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    step="1000"
                    required
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
                    <option value="nonaktif">Nonaktif</option>
                    <option value="aktif">Aktif</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Tanggal Mulai</label>
                  <input
                    type="date"
                    name="tanggalMulai"
                    value={formData.tanggalMulai}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tanggal Selesai</label>
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
                <label className="form-label">Stok (kosongkan untuk unlimited)</label>
                <input
                  type="number"
                  name="stok"
                  value={formData.stok}
                  onChange={handleChange}
                  className="form-control"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gambar</label>
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
                {editingPaket && editingPaket.gambar && !selectedFile && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px' }}>Current Image:</p>
                    <img 
                      src={getImageUrl(editingPaket.gambar)} 
                      alt="Current" 
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Detail Barang</label>
                <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '15px', marginBottom: '15px' }}>
                  {formData.detailBarang.map((barang, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500' }}>{barang.namaBarang}</div>
                        <div style={{ fontSize: '0.85em', color: '#666' }}>
                          Jumlah: {barang.jumlah}
                          {barang.keterangan && ` | ${barang.keterangan}`}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveBarang(index)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: '10px', marginTop: '10px' }}>
                    <input
                      type="text"
                      placeholder="Nama Barang"
                      value={newBarang.namaBarang}
                      onChange={(e) => setNewBarang({ ...newBarang, namaBarang: e.target.value })}
                      className="form-control"
                    />
                    <input
                      type="number"
                      placeholder="Jumlah"
                      value={newBarang.jumlah}
                      onChange={(e) => setNewBarang({ ...newBarang, jumlah: parseInt(e.target.value) || 1 })}
                      className="form-control"
                      min="1"
                    />
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input
                        type="text"
                        placeholder="Keterangan (optional)"
                        value={newBarang.keterangan}
                        onChange={(e) => setNewBarang({ ...newBarang, keterangan: e.target.value })}
                        className="form-control"
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleAddBarang}
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPaket ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedTransaksi && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Detail Transaksi</h3>
              <button className="close-btn" onClick={() => {
                setShowDetailModal(false);
                setSelectedTransaksi(null);
              }}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>Informasi Pembeli</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 0', color: '#666', width: '40%' }}>Nama:</td>
                      <td style={{ padding: '8px 0', fontWeight: '500' }}>{selectedTransaksi.namaPembeli || '-'}</td>
                    </tr>
                    {selectedTransaksi.email && (
                      <tr>
                        <td style={{ padding: '8px 0', color: '#666' }}>Email:</td>
                        <td style={{ padding: '8px 0' }}>{selectedTransaksi.email}</td>
                      </tr>
                    )}
                    {selectedTransaksi.nomorTelepon && (
                      <tr>
                        <td style={{ padding: '8px 0', color: '#666' }}>Nomor Telepon:</td>
                        <td style={{ padding: '8px 0' }}>{selectedTransaksi.nomorTelepon}</td>
                      </tr>
                    )}
                    {selectedTransaksi.alamat && (
                      <tr>
                        <td style={{ padding: '8px 0', color: '#666', verticalAlign: 'top' }}>Alamat:</td>
                        <td style={{ padding: '8px 0', whiteSpace: 'pre-wrap' }}>{selectedTransaksi.alamat}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>Detail Pembayaran</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 0', color: '#666', width: '40%' }}>Jumlah:</td>
                      <td style={{ padding: '8px 0', fontWeight: 'bold', fontSize: '18px', color: '#667eea' }}>
                        {formatCurrency(selectedTransaksi.nominal || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', color: '#666' }}>Status:</td>
                      <td style={{ padding: '8px 0' }}>{getStatusBadge(selectedTransaksi.status)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', color: '#666' }}>Tanggal:</td>
                      <td style={{ padding: '8px 0' }}>{formatDate(selectedTransaksi.tanggalTransaksi)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', color: '#666' }}>Metode Pembayaran:</td>
                      <td style={{ padding: '8px 0' }}>
                        {selectedTransaksi.paymentGateway === 'midtrans' ? (
                          <div>
                            <div style={{ fontWeight: '500' }}>Midtrans</div>
                            {selectedTransaksi.midtransPaymentType && (
                              <div style={{ fontSize: '0.9em', color: '#666' }}>
                                {selectedTransaksi.midtransPaymentType}
                                {selectedTransaksi.midtransBank && ` - ${selectedTransaksi.midtransBank}`}
                              </div>
                            )}
                            {selectedTransaksi.midtransVaNumber && (
                              <div style={{ fontSize: '0.9em', color: '#666', fontFamily: 'monospace' }}>
                                VA: {selectedTransaksi.midtransVaNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          'Manual'
                        )}
                      </td>
                    </tr>
                    {selectedTransaksi.midtransOrderId && (
                      <tr>
                        <td style={{ padding: '8px 0', color: '#666' }}>Order ID:</td>
                        <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: '0.9em' }}>
                          {selectedTransaksi.midtransOrderId}
                        </td>
                      </tr>
                    )}
                    {selectedTransaksi.midtransTransactionId && (
                      <tr>
                        <td style={{ padding: '8px 0', color: '#666' }}>Transaction ID:</td>
                        <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: '0.9em' }}>
                          {selectedTransaksi.midtransTransactionId}
                        </td>
                      </tr>
                    )}
                    {selectedTransaksi.midtransTransactionStatus && (
                      <tr>
                        <td style={{ padding: '8px 0', color: '#666' }}>Transaction Status:</td>
                        <td style={{ padding: '8px 0' }}>{selectedTransaksi.midtransTransactionStatus}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedTransaksi.paketSumbangan && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>Paket Sumbangan</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 0', color: '#666', width: '40%' }}>Nama Paket:</td>
                        <td style={{ padding: '8px 0', fontWeight: '500' }}>
                          {selectedTransaksi.paketSumbangan?.namaPaket || '-'}
                        </td>
                      </tr>
                      {selectedTransaksi.paketSumbangan?.deskripsi && (
                        <tr>
                          <td style={{ padding: '8px 0', color: '#666', verticalAlign: 'top' }}>Deskripsi:</td>
                          <td style={{ padding: '8px 0' }}>{selectedTransaksi.paketSumbangan.deskripsi}</td>
                        </tr>
                      )}
                      {selectedTransaksi.paketSumbangan?.detailBarang && selectedTransaksi.paketSumbangan.detailBarang.length > 0 && (
                        <tr>
                          <td style={{ padding: '8px 0', color: '#666', verticalAlign: 'top' }}>Isi Paket:</td>
                          <td style={{ padding: '8px 0' }}>
                            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                              {selectedTransaksi.paketSumbangan.detailBarang.map((barang, idx) => (
                                <li key={idx}>
                                  {barang.namaBarang || barang.namaItem || 'Item'} (x{barang.jumlah})
                                  {barang.keterangan && ` - ${barang.keterangan}`}
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => {
                setShowDetailModal(false);
                setSelectedTransaksi(null);
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaketSumbanganManagement;

