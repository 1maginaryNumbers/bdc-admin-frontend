import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiEye } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';

const MerchandiseManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [merchandise, setMerchandise] = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transaksiLoading, setTransaksiLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTransaksiModal, setShowTransaksiModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [editingMerchandise, setEditingMerchandise] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    deskripsi: '',
    harga: '',
    stok: '',
    status: 'tersedia'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchMerchandise();
    fetchTransaksi();
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

  const fetchMerchandise = async () => {
    try {
      const response = await axios.get('https://finalbackend-ochre.vercel.app/api/merchandise');
      const data = response.data;
      if (Array.isArray(data)) {
        setMerchandise(data);
      } else if (data.merchandise && Array.isArray(data.merchandise)) {
        setMerchandise(data.merchandise);
      } else {
        setMerchandise([]);
      }
    } catch (error) {
      toast.error('Failed to fetch merchandise data');
      setMerchandise([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransaksi = async () => {
    try {
      const response = await axios.get('https://finalbackend-ochre.vercel.app/api/merchandise-transaksi');
      setTransaksi(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch transaction data');
      setTransaksi([]);
    } finally {
      setTransaksiLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nama', formData.nama);
      formDataToSend.append('deskripsi', formData.deskripsi);
      formDataToSend.append('harga', formData.harga);
      formDataToSend.append('stok', formData.stok);
      formDataToSend.append('status', formData.status);
      
      if (selectedFile) {
        formDataToSend.append('gambar', selectedFile);
      }

      if (editingMerchandise) {
        await axios.put(`https://finalbackend-ochre.vercel.app/api/merchandise/${editingMerchandise._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Merchandise updated successfully');
      } else {
        await axios.post('https://finalbackend-ochre.vercel.app/api/merchandise', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('Merchandise created successfully');
      }
      setShowModal(false);
      setEditingMerchandise(null);
      setFormData({ nama: '', deskripsi: '', harga: '', stok: '', status: 'tersedia' });
      setSelectedFile(null);
      setPreviewUrl('');
      fetchMerchandise();
    } catch (error) {
      toast.error('Failed to save merchandise');
    }
  };

  const handleEdit = (merchandise) => {
    setEditingMerchandise(merchandise);
    setFormData({
      nama: merchandise.nama,
      deskripsi: merchandise.deskripsi || '',
      harga: merchandise.harga.toString(),
      stok: merchandise.stok.toString(),
      status: merchandise.status
    });
    setSelectedFile(null);
    setPreviewUrl(merchandise.gambar ? (merchandise.gambar.startsWith('data:') ? merchandise.gambar : `https://finalbackend-ochre.vercel.app${merchandise.gambar}`) : '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this merchandise?')) {
      try {
        await axios.delete(`https://finalbackend-ochre.vercel.app/api/merchandise/${id}`);
        toast.success('Merchandise deleted successfully');
        fetchMerchandise();
      } catch (error) {
        toast.error('Failed to delete merchandise');
      }
    }
  };

  const openModal = () => {
    setEditingMerchandise(null);
    setFormData({ nama: '', deskripsi: '', harga: '', stok: '', status: 'tersedia' });
    setSelectedFile(null);
    setPreviewUrl('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMerchandise(null);
    setFormData({ nama: '', deskripsi: '', harga: '', stok: '', status: 'tersedia' });
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'tersedia': { text: 'Tersedia', class: 'btn-success' },
      'habis': { text: 'Habis', class: 'btn-danger' },
      'pending': { text: 'Pending', class: 'btn-secondary' },
      'berhasil': { text: 'Berhasil', class: 'btn-success' },
      'settlement': { text: 'Settlement', class: 'btn-success' },
      'capture': { text: 'Capture', class: 'btn-success' },
      'gagal': { text: 'Gagal', class: 'btn-danger' },
      'failed': { text: 'Failed', class: 'btn-danger' },
      'deny': { text: 'Deny', class: 'btn-danger' },
      'cancel': { text: 'Cancel', class: 'btn-danger' },
      'expire': { text: 'Expire', class: 'btn-danger' },
      'refund': { text: 'Refund', class: 'btn-warning' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'btn-secondary' };
    return <span className={`btn btn-sm ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openTransaksiModal = (transaksiItem) => {
    setSelectedTransaksi(transaksiItem);
    setShowTransaksiModal(true);
  };

  const closeTransaksiModal = () => {
    setShowTransaksiModal(false);
    setSelectedTransaksi(null);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`https://finalbackend-ochre.vercel.app/api/merchandise-transaksi/${id}/status`, { status });
      toast.success('Transaction status updated successfully');
      fetchTransaksi();
      fetchMerchandise();
    } catch (error) {
      toast.error('Failed to update transaction status');
    }
  };

  if (loading) {
    return <div className="loading">Loading merchandise data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Merchandise Management</h1>
        <p className="page-subtitle">Manage temple merchandise</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Merchandise List</h3>
          <button className="btn btn-primary" onClick={openModal}>
            <FiPlus /> Add Merchandise
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Deskripsi</th>
                <th>Harga</th>
                <th>Gambar</th>
                <th>Stok</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {merchandise.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '500' }}>{item.nama}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.deskripsi || '-'}
                  </td>
                  <td>{formatCurrency(item.harga)}</td>
                  <td>
                    {item.gambar ? (
                      <img 
                        src={item.gambar.startsWith('data:') ? item.gambar : `https://finalbackend-ochre.vercel.app${item.gambar}`}
                        alt={item.nama}
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'inline';
                        }}
                      />
                    ) : null}
                    <span style={{ display: item.gambar ? 'none' : 'inline' }}>-</span>
                  </td>
                  <td>{item.stok}</td>
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
          <h3>Purchase History</h3>
        </div>

        {transaksiLoading ? (
          <div className="loading">Loading transaction data...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Pembeli</th>
                  <th>Email</th>
                  <th>Telepon</th>
                  <th>Produk</th>
                  <th>Jumlah</th>
                  <th>Total Harga</th>
                  <th>Status</th>
                  <th>Metode</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transaksi.map((item) => (
                    <tr key={item._id}>
                      <td>{formatDate(item.tanggalTransaksi)}</td>
                      <td style={{ fontWeight: '500' }}>{item.namaPembeli}</td>
                      <td>{item.email || '-'}</td>
                      <td>{item.nomorTelepon || '-'}</td>
                      <td>
                        {item.merchandise && typeof item.merchandise === 'object' ? (
                          item.merchandise.nama
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{item.jumlah}</td>
                      <td>{formatCurrency(item.totalHarga)}</td>
                      <td>{getStatusBadge(item.status)}</td>
                      <td>
                        {item.paymentGateway === 'midtrans' ? (
                          <div>
                            <div style={{ fontWeight: '500' }}>Midtrans</div>
                            {item.midtransPaymentType && (
                              <div style={{ fontSize: '0.85em', color: '#666' }}>
                                {item.midtransPaymentType}
                                {item.midtransBank && ` - ${item.midtransBank}`}
                              </div>
                            )}
                            {item.midtransVaNumber && (
                              <div style={{ fontSize: '0.85em', color: '#666' }}>
                                VA: {item.midtransVaNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          item.metodePembayaran || '-'
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'nowrap' }}>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => openTransaksiModal(item)}
                            style={{ flexShrink: 0 }}
                            title="View details"
                          >
                            <FiEye />
                          </button>
                          {item.status === 'pending' && (
                            <>
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleUpdateStatus(item._id, 'berhasil')}
                                style={{ flexShrink: 0 }}
                                title="Approve"
                              >
                                ✓
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleUpdateStatus(item._id, 'gagal')}
                                style={{ flexShrink: 0 }}
                                title="Reject"
                              >
                                ✗
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }} ref={modalRef}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingMerchandise ? 'Edit Merchandise' : 'Add New Merchandise'}
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
                  <label className="form-label">Harga *</label>
                  <input
                    type="number"
                    name="harga"
                    value={formData.harga}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stok *</label>
                  <input
                    type="number"
                    name="stok"
                    value={formData.stok}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Gambar</label>
                <input
                  type="file"
                  name="gambar"
                  onChange={handleFileChange}
                  className="form-control"
                  accept="image/*"
                />
                {previewUrl && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="tersedia">Tersedia</option>
                  <option value="habis">Habis</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingMerchandise ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransaksiModal && selectedTransaksi && (
        <div className="modal">
          <div className="modal-content" ref={transaksiModalRef} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Transaction Details</h3>
              <button className="close-btn" onClick={closeTransaksiModal}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Transaction ID:</label>
                <p style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{selectedTransaksi._id}</p>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tanggal:</label>
                <p>{formatDate(selectedTransaksi.tanggalTransaksi)}</p>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nama Pembeli:</label>
                <p>{selectedTransaksi.namaPembeli}</p>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Email:</label>
                <p>{selectedTransaksi.email || '-'}</p>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nomor Telepon:</label>
                <p>{selectedTransaksi.nomorTelepon || '-'}</p>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Produk:</label>
                <p>
                  {selectedTransaksi.merchandise && typeof selectedTransaksi.merchandise === 'object' ? (
                    <>
                      {selectedTransaksi.merchandise.nama} - {formatCurrency(selectedTransaksi.merchandise.harga || 0)}
                    </>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Jumlah:</label>
                <p>{selectedTransaksi.jumlah} item(s)</p>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Total Harga:</label>
                <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#28a745' }}>
                  {formatCurrency(selectedTransaksi.totalHarga)}
                </p>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Status:</label>
                <div>{getStatusBadge(selectedTransaksi.status)}</div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Metode Pembayaran:</label>
                <p>
                  {selectedTransaksi.paymentGateway === 'midtrans' ? 'Midtrans' : selectedTransaksi.metodePembayaran || '-'}
                </p>
                {selectedTransaksi.midtransPaymentType && (
                  <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                    Type: {selectedTransaksi.midtransPaymentType}
                    {selectedTransaksi.midtransBank && ` (${selectedTransaksi.midtransBank})`}
                  </p>
                )}
                {selectedTransaksi.midtransVaNumber && (
                  <p style={{ fontSize: '0.9em', color: '#666', marginTop: '5px' }}>
                    VA Number: {selectedTransaksi.midtransVaNumber}
                  </p>
                )}
              </div>
              {selectedTransaksi.alamatPengiriman && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Alamat Pengiriman:</label>
                  <p style={{ 
                    padding: '10px', 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {selectedTransaksi.alamatPengiriman}
                  </p>
                </div>
              )}
              {selectedTransaksi.midtransOrderId && (
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Midtrans Order ID:</label>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{selectedTransaksi.midtransOrderId}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedTransaksi.status === 'pending' && (
                <>
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      handleUpdateStatus(selectedTransaksi._id, 'berhasil');
                      closeTransaksiModal();
                    }}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      handleUpdateStatus(selectedTransaksi._id, 'gagal');
                      closeTransaksiModal();
                    }}
                  >
                    Reject
                  </button>
                </>
              )}
              <button type="button" className="btn btn-secondary" onClick={closeTransaksiModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchandiseManagement;
