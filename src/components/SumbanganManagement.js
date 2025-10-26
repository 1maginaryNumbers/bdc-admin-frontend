import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiDollarSign } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';

const SumbanganManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [sumbangan, setSumbangan] = useState([]);
  const [transaksi, setTransaksi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTransaksiModal, setShowTransaksiModal] = useState(false);
  const [editingSumbangan, setEditingSumbangan] = useState(null);
  const [formData, setFormData] = useState({
    nama: '',
    jumlah: '',
    metode: '',
    keterangan: ''
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
        axios.get('http://finalbackend-ochre.vercel.app/api/sumbangan'),
        axios.get('http://finalbackend-ochre.vercel.app/api/sumbangan/transaksi')
      ]);
      
      // Handle both old format (array) and new format (object with sumbangan property)
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

  const handleTransaksiChange = (e) => {
    setTransaksiFormData({
      ...transaksiFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        jumlah: parseFloat(formData.jumlah)
      };

      if (editingSumbangan) {
        await axios.put(`http://finalbackend-ochre.vercel.app/api/sumbangan/${editingSumbangan._id}`, dataToSend);
        toast.success('Sumbangan updated successfully');
      } else {
        await axios.post('http://finalbackend-ochre.vercel.app/api/sumbangan', dataToSend);
        toast.success('Sumbangan created successfully');
      }
      setShowModal(false);
      setEditingSumbangan(null);
      setFormData({ nama: '', jumlah: '', metode: '', keterangan: '' });
      fetchData();
    } catch (error) {
      toast.error('Failed to save sumbangan');
    }
  };

  const handleTransaksiSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...transaksiFormData,
        jumlah: parseFloat(transaksiFormData.jumlah)
      };

      await axios.post('http://finalbackend-ochre.vercel.app/api/sumbangan/transaksi', dataToSend);
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
      nama: sumbangan.nama,
      jumlah: sumbangan.jumlah.toString(),
      metode: sumbangan.metode || '',
      keterangan: sumbangan.keterangan || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sumbangan?')) {
      try {
        await axios.delete(`http://finalbackend-ochre.vercel.app/api/sumbangan/${id}`);
        toast.success('Sumbangan deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete sumbangan');
      }
    }
  };

  const handleUpdateTransaksiStatus = async (id, status) => {
    try {
      await axios.put(`http://finalbackend-ochre.vercel.app/api/sumbangan/transaksi/${id}/status`, { status });
      toast.success('Transaksi status updated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to update transaksi status');
    }
  };

  const openModal = () => {
    setEditingSumbangan(null);
    setFormData({ nama: '', jumlah: '', metode: '', keterangan: '' });
    setShowModal(true);
  };

  const openTransaksiModal = () => {
    setTransaksiFormData({ nama: '', jumlah: '', metode: '', status: 'pending' });
    setShowTransaksiModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSumbangan(null);
    setFormData({ nama: '', jumlah: '', metode: '', keterangan: '' });
  };

  const closeTransaksiModal = () => {
    setShowTransaksiModal(false);
    setTransaksiFormData({ nama: '', jumlah: '', metode: '', status: 'pending' });
  };

  const formatDate = (dateString) => {
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
      'pending': { text: 'Pending', class: 'btn-secondary' },
      'completed': { text: 'Completed', class: 'btn-success' },
      'failed': { text: 'Failed', class: 'btn-danger' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'btn-secondary' };
    return <span className={`btn btn-sm ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return <div className="loading">Loading sumbangan data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Sumbangan Management</h1>
        <p className="page-subtitle">Manage donations and transactions</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Sumbangan List</h3>
          <div className="d-flex gap-2">
            <button className="btn btn-success" onClick={openTransaksiModal}>
              <FiPlus /> Add Transaksi
            </button>
            <button className="btn btn-primary" onClick={openModal}>
              <FiPlus /> Add Sumbangan
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Jumlah</th>
                <th>Metode</th>
                <th>Keterangan</th>
                <th>Tanggal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sumbangan.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '500' }}>{item.nama}</td>
                  <td>{formatCurrency(item.jumlah)}</td>
                  <td>{item.metode || '-'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.keterangan || '-'}
                  </td>
                  <td>{formatDate(item.tanggal)}</td>
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
                  <td style={{ fontWeight: '500' }}>{item.nama}</td>
                  <td>{formatCurrency(item.jumlah)}</td>
                  <td>{item.metode || '-'}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>{formatDate(item.tanggal)}</td>
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
                {editingSumbangan ? 'Edit Sumbangan' : 'Add New Sumbangan'}
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Jumlah *</label>
                  <input
                    type="number"
                    name="jumlah"
                    value={formData.jumlah}
                    onChange={handleChange}
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
                    value={formData.metode}
                    onChange={handleChange}
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
                <label className="form-label">Keterangan</label>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                />
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
