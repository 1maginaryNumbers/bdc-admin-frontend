import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiDownload, FiCopy, FiEye } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';
import { compressImage, isFileSizeAcceptable, formatFileSize } from '../utils/imageCompression';

const SumbanganManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [sumbangan, setSumbangan] = useState([]);
  const [filteredSumbangan, setFilteredSumbangan] = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTransaksiModal, setShowTransaksiModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSumbangan, setSelectedSumbangan] = useState(null);
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [selectedQrisImage, setSelectedQrisImage] = useState(null);
  const [editingSumbangan, setEditingSumbangan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  // No filters needed for voluntary donation
  const [formData, setFormData] = useState({});
  const [regenerateQR, setRegenerateQR] = useState(false);
  const [transaksiFormData, setTransaksiFormData] = useState({
    sumbangan: '',
    namaDonatur: '',
    email: '',
    nominal: '',
    metodePembayaran: '',
    status: 'pending'
  });
  const [paymentFormData, setPaymentFormData] = useState({
    namaDonatur: '',
    email: '',
    nomorTelepon: '',
    nominal: ''
  });

  useEffect(() => {
    fetchData();
    
    const isProduction = process.env.REACT_APP_MIDTRANS_IS_PRODUCTION === 'true';
    const scriptUrl = isProduction 
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.setAttribute('data-client-key', process.env.REACT_APP_MIDTRANS_CLIENT_KEY || '');
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [refreshTrigger]);

  useEscapeKey(() => {
    if (showModal) {
      closeModal();
    }
    if (showTransaksiModal) {
      closeTransaksiModal();
    }
    if (showPaymentModal) {
      closePaymentModal();
    }
    if (showQrisModal) {
      closeQrisModal();
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

  const qrisModalRef = useOutsideClick(() => {
    if (showQrisModal) {
      closeQrisModal();
    }
  });

  const paymentModalRef = useOutsideClick(() => {
    if (showPaymentModal) {
      closePaymentModal();
    }
  });

  const detailModalRef = useOutsideClick(() => {
    if (showDetailModal) {
      setShowDetailModal(false);
      setSelectedTransaksi(null);
    }
  });

  const fetchData = async () => {
    try {
      const [sumbanganRes, transaksiRes] = await Promise.all([
        axios.get('https://finalbackend-ochre.vercel.app/api/sumbangan'),
        axios.get('https://finalbackend-ochre.vercel.app/api/sumbangan/transaksi')
      ]);
      
      const sumbanganData = sumbanganRes.data;
      let sumbanganList = [];
      if (Array.isArray(sumbanganData)) {
        sumbanganList = sumbanganData;
      } else if (sumbanganData.sumbangan && Array.isArray(sumbanganData.sumbangan)) {
        sumbanganList = sumbanganData.sumbangan;
      }
      
      // Voluntary donation is always active
      setSumbangan(sumbanganList);
      setFilteredSumbangan(sumbanganList);
      
      setTransaksi(transaksiRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
      setSumbangan([]);
      setFilteredSumbangan([]);
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

      if (selectedFile) {
        formDataToSend.append('qrisImage', selectedFile);
      }

      if (editingSumbangan) {
        if (regenerateQR && !selectedFile) {
          formDataToSend.append('regenerateQR', 'true');
        }
        await axios.put(`https://finalbackend-ochre.vercel.app/api/sumbangan/${editingSumbangan._id}`, formDataToSend);
        toast.success('QRIS updated successfully');
      } else {
        await axios.post('https://finalbackend-ochre.vercel.app/api/sumbangan', formDataToSend);
        toast.success('QRIS created successfully');
      }
      setShowModal(false);
      setEditingSumbangan(null);
      setSelectedFile(null);
      setRegenerateQR(false);
      setFormData({});
      fetchData();
    } catch (error) {
      toast.error('Failed to save QRIS');
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
      if (!transaksiFormData.sumbangan) {
        toast.error('Please select a donation event');
        return;
      }

      const dataToSend = {
        sumbangan: transaksiFormData.sumbangan,
        namaDonatur: transaksiFormData.namaDonatur,
        email: transaksiFormData.email || undefined,
        nominal: parseFloat(transaksiFormData.nominal),
        metodePembayaran: transaksiFormData.metodePembayaran || 'transfer',
        status: transaksiFormData.status
      };

      await axios.post('https://finalbackend-ochre.vercel.app/api/sumbangan/transaksi', dataToSend);
      toast.success('Transaksi created successfully');
      setShowTransaksiModal(false);
      setTransaksiFormData({ sumbangan: '', namaDonatur: '', email: '', nominal: '', metodePembayaran: '', status: 'pending' });
      fetchData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save transaksi';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (sumbangan) => {
    setEditingSumbangan(sumbangan);
    setFormData({});
    setSelectedFile(null);
    setRegenerateQR(false);
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
    setFormData({});
    setSelectedFile(null);
    setRegenerateQR(false);
    setShowModal(true);
  };

  const openTransaksiModal = () => {
    setTransaksiFormData({ sumbangan: '', namaDonatur: '', email: '', nominal: '', metodePembayaran: '', status: 'pending' });
    setShowTransaksiModal(true);
  };

  const openPaymentModal = (sumbangan) => {
    setSelectedSumbangan(sumbangan);
    setPaymentFormData({ namaDonatur: '', email: '', nomorTelepon: '', nominal: '' });
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedSumbangan(null);
    setPaymentFormData({ namaDonatur: '', email: '', nomorTelepon: '', nominal: '' });
  };

  const handlePaymentChange = (e) => {
    setPaymentFormData({
      ...paymentFormData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://finalbackend-ochre.vercel.app/api/sumbangan/payment', {
        sumbangan: selectedSumbangan._id,
        namaDonatur: paymentFormData.namaDonatur,
        email: paymentFormData.email,
        nomorTelepon: paymentFormData.nomorTelepon,
        nominal: parseFloat(paymentFormData.nominal)
      });

      if (response.data.token) {
        window.snap.pay(response.data.token, {
          onSuccess: function(result) {
            toast.success('Payment successful!');
            closePaymentModal();
            fetchData();
          },
          onPending: function(result) {
            toast.info('Payment pending. Please complete the payment.');
            closePaymentModal();
            fetchData();
          },
          onError: function(result) {
            toast.error('Payment failed. Please try again.');
          },
          onClose: function() {
            toast.info('Payment window closed.');
          }
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create payment');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSumbangan(null);
    setSelectedFile(null);
    setRegenerateQR(false);
    setFormData({});
  };

  const closeTransaksiModal = () => {
    setShowTransaksiModal(false);
    setTransaksiFormData({ sumbangan: '', namaDonatur: '', email: '', nominal: '', metodePembayaran: '', status: 'pending' });
  };

  const openQrisModal = (qrisImage) => {
    setSelectedQrisImage(qrisImage);
    setShowQrisModal(true);
  };

  const closeQrisModal = () => {
    setShowQrisModal(false);
    setSelectedQrisImage(null);
  };

  const downloadQRIS = (qrisImage) => {
    if (!qrisImage) return;
    
    const imageUrl = getImageUrl(qrisImage);
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'qris-donation.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  useEffect(() => {
    // No filtering needed for voluntary donation
    setFilteredSumbangan(sumbangan);
  }, [sumbangan]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      'berhasil': { text: 'Berhasil', class: 'btn-success' },
      'settlement': { text: 'Settlement', class: 'btn-success' },
      'capture': { text: 'Capture', class: 'btn-success' },
      'failed': { text: 'Failed', class: 'btn-danger' },
      'gagal': { text: 'Gagal', class: 'btn-danger' },
      'deny': { text: 'Deny', class: 'btn-danger' },
      'cancel': { text: 'Cancel', class: 'btn-danger' },
      'expire': { text: 'Expire', class: 'btn-danger' },
      'refund': { text: 'Refund', class: 'btn-warning' }
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
        <p className="page-subtitle">Manage voluntary donation QRIS and transactions</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>QRIS Donasi Sukarela</h3>
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={openModal}>
              <FiPlus /> {filteredSumbangan.length > 0 ? 'Update QRIS' : 'Setup QRIS'}
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>QRIS</th>
                <th>ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSumbangan.length > 0 ? filteredSumbangan.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.qrisImage ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img 
                          src={getImageUrl(item.qrisImage)} 
                          alt="QRIS" 
                          onClick={() => openQrisModal(item.qrisImage)}
                          style={{ 
                            width: '50px', 
                            height: '50px', 
                            objectFit: 'cover', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        />
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => downloadQRIS(item.qrisImage)}
                          title="Download QRIS"
                          style={{ padding: '4px 8px' }}
                        >
                          <FiDownload size={12} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#999' }}>No QRIS</span>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={async () => {
                            try {
                              const formData = new FormData();
                              formData.append('regenerateQR', 'true');
                              await axios.put(`https://finalbackend-ochre.vercel.app/api/sumbangan/${item._id}`, formData);
                              toast.success('QRIS generated successfully');
                              fetchData();
                            } catch (error) {
                              toast.error('Failed to generate QRIS');
                            }
                          }}
                          title="Generate QRIS"
                          style={{ padding: '4px 8px', fontSize: '0.75em' }}
                        >
                          Generate
                        </button>
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ 
                        fontSize: '0.75em', 
                        color: '#666', 
                        fontFamily: 'monospace',
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }} title={item._id}>
                        {item._id.substring(0, 8)}...
                      </span>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={async () => {
                          const qrisImageUrl = `https://finalbackend-ochre.vercel.app/api/sumbangan/${item._id}/qris-image`;
                          try {
                            await navigator.clipboard.writeText(qrisImageUrl);
                            toast.success('QRIS Image URL copied to clipboard!');
                          } catch (err) {
                            const textArea = document.createElement('textarea');
                            textArea.value = qrisImageUrl;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            toast.success('QRIS Image URL copied to clipboard!');
                          }
                        }}
                        title="Copy QRIS Image URL"
                        style={{ padding: '2px 6px', fontSize: '0.7em' }}
                      >
                        <FiCopy size={10} />
                      </button>
                    </div>
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
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    Belum ada QRIS. Klik tombol "Setup QRIS" untuk membuat QRIS donasi sukarela.
                  </td>
                </tr>
              )}
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
                      item.metode || item.metodePembayaran || '-'
                    )}
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>{formatDate(item.tanggal || item.tanggalTransaksi)}</td>
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
                            onClick={() => handleUpdateTransaksiStatus(item._id, 'completed')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleUpdateTransaksiStatus(item._id, 'failed')}
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
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingSumbangan ? 'Update QRIS Donasi Sukarela' : 'Setup QRIS Donasi Sukarela'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">QRIS Image {!editingSumbangan && <span style={{ fontSize: '0.85em', color: '#666', fontWeight: 'normal' }}>(Optional - will be auto-generated if not provided)</span>}</label>
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
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={regenerateQR}
                          onChange={(e) => setRegenerateQR(e.target.checked)}
                        />
                        <span style={{ fontSize: '0.9em' }}>Regenerate QR Code using Midtrans</span>
                      </label>
                    </div>
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

      {showPaymentModal && selectedSumbangan && (
        <div className="modal">
          <div className="modal-content" ref={paymentModalRef}>
            <div className="modal-header">
              <h3 className="modal-title">Create Payment - Donasi Sukarela</h3>
              <button className="close-btn" onClick={closePaymentModal}>×</button>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label className="form-label">Donor Name *</label>
                <input
                  type="text"
                  name="namaDonatur"
                  value={paymentFormData.namaDonatur}
                  onChange={handlePaymentChange}
                  className="form-control"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={paymentFormData.email}
                    onChange={handlePaymentChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    name="nomorTelepon"
                    value={paymentFormData.nomorTelepon}
                    onChange={handlePaymentChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amount (IDR) *</label>
                <input
                  type="number"
                  name="nominal"
                  value={paymentFormData.nominal}
                  onChange={handlePaymentChange}
                  className="form-control"
                  min="1"
                  step="1000"
                  required
                />
                <small className="form-text text-muted">Enter the donation amount. Target amount is the collective total from all transactions.</small>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closePaymentModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQrisModal && selectedQrisImage && (
        <div className="modal">
          <div className="modal-content" ref={qrisModalRef} style={{ maxWidth: '500px', textAlign: 'center' }}>
            <div className="modal-header">
              <h3 className="modal-title">QRIS Preview</h3>
              <button className="close-btn" onClick={closeQrisModal}>×</button>
            </div>
            <div style={{ padding: '20px' }}>
              <img 
                src={getImageUrl(selectedQrisImage)} 
                alt="QRIS Full Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '500px', 
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeQrisModal}>
                Close
              </button>
              {selectedQrisImage && (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => downloadQRIS(selectedQrisImage)}
                >
                  <FiDownload style={{ marginRight: '8px' }} />
                  Download QRIS
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedTransaksi && (
        <div className="modal">
          <div className="modal-content" ref={detailModalRef} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Detail Transaksi</h3>
              <button className="close-btn" onClick={() => {
                setShowDetailModal(false);
                setSelectedTransaksi(null);
              }}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>Informasi Donatur</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '8px 0', color: '#666', width: '40%' }}>Nama:</td>
                      <td style={{ padding: '8px 0', fontWeight: '500' }}>{selectedTransaksi.nama || selectedTransaksi.namaDonatur || '-'}</td>
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
                        {formatCurrency(selectedTransaksi.jumlah || selectedTransaksi.nominal || 0)}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', color: '#666' }}>Status:</td>
                      <td style={{ padding: '8px 0' }}>{getStatusBadge(selectedTransaksi.status)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '8px 0', color: '#666' }}>Tanggal:</td>
                      <td style={{ padding: '8px 0' }}>{formatDate(selectedTransaksi.tanggal || selectedTransaksi.tanggalTransaksi)}</td>
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
                          selectedTransaksi.metode || selectedTransaksi.metodePembayaran || 'Manual'
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
                    {selectedTransaksi.buktiPembayaran && (
                      <tr>
                        <td style={{ padding: '8px 0', color: '#666' }}>Bukti Pembayaran:</td>
                        <td style={{ padding: '8px 0' }}>
                          <a href={selectedTransaksi.buktiPembayaran} target="_blank" rel="noopener noreferrer" style={{ color: '#667eea' }}>
                            Lihat Bukti
                          </a>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {selectedTransaksi.sumbangan && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>Event Sumbangan</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 0', color: '#666', width: '40%' }}>Nama Event:</td>
                        <td style={{ padding: '8px 0', fontWeight: '500' }}>
                          Donasi Sukarela
                        </td>
                      </tr>
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

export default SumbanganManagement;
