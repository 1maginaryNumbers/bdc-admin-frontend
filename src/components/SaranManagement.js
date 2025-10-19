import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { useRefresh } from '../contexts/RefreshContext';

const SaranManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [saran, setSaran] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaran();
  }, [refreshTrigger]);

  const fetchSaran = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/saran');
      setSaran(response.data);
    } catch (error) {
      toast.error('Failed to fetch saran data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/saran/${id}/status`, { status });
      toast.success('Saran status updated successfully');
      fetchSaran();
    } catch (error) {
      toast.error('Failed to update saran status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this saran?')) {
      try {
        await axios.delete(`http://localhost:5000/api/saran/${id}`);
        toast.success('Saran deleted successfully');
        fetchSaran();
      } catch (error) {
        toast.error('Failed to delete saran');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { text: 'Pending', class: 'btn-secondary' },
      'read': { text: 'Read', class: 'btn-primary' },
      'replied': { text: 'Replied', class: 'btn-success' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'btn-secondary' };
    return <span className={`btn btn-sm ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return <div className="loading">Loading saran data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Saran Management</h1>
        <p className="page-subtitle">Manage suggestions and feedback</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Saran List</h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Pesan</th>
                <th>Status</th>
                <th>Tanggal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {saran.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '500' }}>{item.nama}</td>
                  <td>{item.email || '-'}</td>
                  <td>{item.subject || '-'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.pesan}
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>{formatDate(item.tanggal)}</td>
                  <td>
                    {item.status === 'pending' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleUpdateStatus(item._id, 'read')}
                      >
                        Mark as Read
                      </button>
                    )}
                    {item.status === 'read' && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleUpdateStatus(item._id, 'replied')}
                      >
                        Mark as Replied
                      </button>
                    )}
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
    </div>
  );
};

export default SaranManagement;
