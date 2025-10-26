import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiTrash2, FiCheckSquare, FiSquare } from 'react-icons/fi';
import { useRefresh } from '../contexts/RefreshContext';

const SaranManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [saran, setSaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchSaran();
  }, [refreshTrigger]);

  const fetchSaran = async () => {
    try {
      const response = await axios.get('http://finalbackend-ochre.vercel.app/api/saran');
      setSaran(response.data);
    } catch (error) {
      toast.error('Failed to fetch saran data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this saran?')) {
      try {
        await axios.delete(`http://finalbackend-ochre.vercel.app/api/saran/${id}`);
        toast.success('Saran deleted successfully');
        fetchSaran();
      } catch (error) {
        toast.error('Failed to delete saran');
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
    if (selectedItems.length === saran.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(saran.map(item => item._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      toast.warning('Please select items to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} selected saran?`)) {
      try {
        const deletePromises = selectedItems.map(id => 
          axios.delete(`http://finalbackend-ochre.vercel.app/api/saran/${id}`)
        );
        
        await Promise.all(deletePromises);
        toast.success(`${selectedItems.length} saran deleted successfully`);
        setSelectedItems([]);
        fetchSaran();
      } catch (error) {
        toast.error('Failed to delete selected saran');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
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
          {selectedItems.length > 0 && (
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted">{selectedItems.length} selected</span>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleBulkDelete}
              >
                <FiTrash2 className="me-1" />
                Delete Selected ({selectedItems.length})
              </button>
            </div>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleSelectAll}
                    style={{ border: 'none', padding: 0 }}
                  >
                    {selectedItems.length === saran.length && saran.length > 0 ? (
                      <FiCheckSquare size={18} />
                    ) : (
                      <FiSquare size={18} />
                    )}
                  </button>
                </th>
                <th>Nama Lengkap</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Kategori</th>
                <th>Kritik & Saran</th>
                <th>Tanggal</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {saran.map((item) => (
                <tr key={item._id}>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => handleSelectItem(item._id)}
                      style={{ border: 'none', padding: 0 }}
                    >
                      {selectedItems.includes(item._id) ? (
                        <FiCheckSquare size={18} />
                      ) : (
                        <FiSquare size={18} />
                      )}
                    </button>
                  </td>
                  <td style={{ fontWeight: '500' }}>{item.namaLengkap}</td>
                  <td>{item.email || '-'}</td>
                  <td>{item.nomorTelepon || '-'}</td>
                  <td>{item.kategori || '-'}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.kritikSaran}
                  </td>
                  <td>{formatDate(item.tanggal)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(item._id)}
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
