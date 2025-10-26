import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiBell, FiSend } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';

const PengumumanManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [pengumuman, setPengumuman] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPengumuman, setEditingPengumuman] = useState(null);
  const [formData, setFormData] = useState({
    judul: '',
    isi: ''
  });
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastData, setBroadcastData] = useState({
    judul: '',
    isi: '',
    broadcastTo: 'all'
  });

  useEffect(() => {
    fetchPengumuman();
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

  const fetchPengumuman = async () => {
    try {
      const response = await axios.get('https://finalbackend-ochre.vercel.app/api/pengumuman');
      // Handle both old format (array) and new format (object with pengumuman property)
      const data = response.data;
      if (Array.isArray(data)) {
        setPengumuman(data);
      } else if (data.pengumuman && Array.isArray(data.pengumuman)) {
        setPengumuman(data.pengumuman);
      } else {
        setPengumuman([]);
      }
    } catch (error) {
      toast.error('Failed to fetch pengumuman data');
      setPengumuman([]);
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
      if (editingPengumuman) {
        await axios.put(`https://finalbackend-ochre.vercel.app/api/pengumuman/${editingPengumuman._id}`, formData);
        toast.success('Pengumuman updated successfully');
      } else {
        await axios.post('https://finalbackend-ochre.vercel.app/api/pengumuman', formData);
        toast.success('Pengumuman created successfully');
      }
      setShowModal(false);
      setEditingPengumuman(null);
      setFormData({ judul: '', isi: '' });
      fetchPengumuman();
    } catch (error) {
      toast.error('Failed to save pengumuman');
    }
  };

  const handleEdit = (pengumuman) => {
    setEditingPengumuman(pengumuman);
    setFormData({
      judul: pengumuman.judul,
      isi: pengumuman.isi
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pengumuman?')) {
      try {
        await axios.delete(`https://finalbackend-ochre.vercel.app/api/pengumuman/${id}`);
        toast.success('Pengumuman deleted successfully');
        fetchPengumuman();
      } catch (error) {
        toast.error('Failed to delete pengumuman');
      }
    }
  };

  const openModal = () => {
    setEditingPengumuman(null);
    setFormData({ judul: '', isi: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPengumuman(null);
    setFormData({ judul: '', isi: '' });
  };

  const openBroadcastModal = () => {
    setBroadcastData({ judul: '', isi: '', broadcastTo: 'all' });
    setShowBroadcastModal(true);
  };

  const closeBroadcastModal = () => {
    setShowBroadcastModal(false);
    setBroadcastData({ judul: '', isi: '', broadcastTo: 'all' });
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://finalbackend-ochre.vercel.app/api/pengumuman', {
        judul: broadcastData.judul,
        isi: broadcastData.isi
      });
      
      toast.success('Broadcast announcement sent successfully!');
      closeBroadcastModal();
      fetchPengumuman();
    } catch (error) {
      toast.error('Failed to send broadcast announcement');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading pengumuman data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pengumuman Management</h1>
        <p className="page-subtitle">Manage temple announcements</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Pengumuman List</h3>
          <div className="d-flex gap-2">
            <button className="btn btn-success" onClick={openBroadcastModal}>
              <FiSend /> Quick Broadcast
            </button>
            <button className="btn btn-primary" onClick={openModal}>
              <FiPlus /> Add Pengumuman
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Judul</th>
                <th>Isi</th>
                <th>Tanggal Publikasi</th>
                <th>Penulis</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pengumuman.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '500' }}>{item.judul}</td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.isi}
                  </td>
                  <td>{formatDate(item.tanggalPublikasi)}</td>
                  <td>{item.penulis?.username || 'Admin'}</td>
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
          <div className="modal-content" style={{ maxWidth: '700px' }} ref={modalRef}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingPengumuman ? 'Edit Pengumuman' : 'Add New Pengumuman'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Judul *</label>
                <input
                  type="text"
                  name="judul"
                  value={formData.judul}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Isi *</label>
                <textarea
                  name="isi"
                  value={formData.isi}
                  onChange={handleChange}
                  className="form-control"
                  rows="8"
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPengumuman ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBroadcastModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }} ref={modalRef}>
            <div className="modal-header">
              <h3 className="modal-title">Quick Broadcast Announcement</h3>
              <button className="close-btn" onClick={closeBroadcastModal}>×</button>
            </div>

            <form onSubmit={handleBroadcastSubmit}>
              <div className="form-group">
                <label className="form-label">Judul *</label>
                <input
                  type="text"
                  name="judul"
                  value={broadcastData.judul}
                  onChange={(e) => setBroadcastData({...broadcastData, judul: e.target.value})}
                  className="form-control"
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Isi *</label>
                <textarea
                  name="isi"
                  value={broadcastData.isi}
                  onChange={(e) => setBroadcastData({...broadcastData, isi: e.target.value})}
                  className="form-control"
                  rows="6"
                  placeholder="Enter announcement content"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Broadcast To</label>
                <select
                  value={broadcastData.broadcastTo}
                  onChange={(e) => setBroadcastData({...broadcastData, broadcastTo: e.target.value})}
                  className="form-control"
                >
                  <option value="all">All Members</option>
                  <option value="registered">Registered Members Only</option>
                  <option value="external">External Members Only</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeBroadcastModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  <FiSend /> Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PengumumanManagement;
