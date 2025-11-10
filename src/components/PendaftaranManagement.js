import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiDownload } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';

const PendaftaranManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [pendaftaran, setPendaftaran] = useState([]);
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPendaftaran, setEditingPendaftaran] = useState(null);
  const [formData, setFormData] = useState({
    namaLengkap: '',
    nomorTelepon: '',
    email: '',
    kegiatan: '',
    tipePerson: 'external'
  });
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedKegiatan, setSelectedKegiatan] = useState('all');
  const [uniqueKegiatan, setUniqueKegiatan] = useState([]);
  const [selectedTanggal, setSelectedTanggal] = useState('');
  const [selectedNama, setSelectedNama] = useState('');
  const [namaSearchInput, setNamaSearchInput] = useState('');
  const [isUmatMember, setIsUmatMember] = useState(false);
  const [checkingUmat, setCheckingUmat] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState(null);

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  useEscapeKey(() => {
    if (showModal) {
      closeModal();
    }
    if (showQRModal) {
      closeQRModal();
    }
  });

  const modalRef = useOutsideClick(() => {
    if (showModal) {
      closeModal();
    }
  });

  const qrModalRef = useOutsideClick(() => {
    if (showQRModal) {
      closeQRModal();
    }
  });

  const fetchData = async (kegiatanFilter = 'all', tanggalFilter = '', namaFilter = '') => {
    try {
      const [pendaftaranRes, kegiatanRes] = await Promise.all([
        axios.get(`https://finalbackend-ochre.vercel.app/api/pendaftaran/filter/${kegiatanFilter}`),
        axios.get('https://finalbackend-ochre.vercel.app/api/kegiatan')
      ]);
      
      let filteredPendaftaran = pendaftaranRes.data.pendaftaran;
      
      if (tanggalFilter) {
        const filterDate = new Date(tanggalFilter).toDateString();
        filteredPendaftaran = filteredPendaftaran.filter(item => {
          const itemDate = new Date(item.tanggalDaftar).toDateString();
          return itemDate === filterDate;
        });
      }
      
      if (namaFilter) {
        filteredPendaftaran = filteredPendaftaran.filter(item => 
          item.namaLengkap?.toLowerCase().includes(namaFilter.toLowerCase())
        );
      }
      
      setPendaftaran(filteredPendaftaran);
      setUniqueKegiatan(pendaftaranRes.data.uniqueKegiatan);
      
      // Handle both old format (array) and new format (object with kegiatan property)
      const kegiatanData = kegiatanRes.data;
      if (Array.isArray(kegiatanData)) {
        setKegiatan(kegiatanData);
      } else if (kegiatanData.kegiatan && Array.isArray(kegiatanData.kegiatan)) {
        setKegiatan(kegiatanData.kegiatan);
      } else {
        setKegiatan([]);
      }
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const checkUmatMember = async (nama) => {
    if (!nama || nama.trim() === '') {
      setIsUmatMember(false);
      return;
    }
    
    setCheckingUmat(true);
    try {
      const response = await axios.get(`https://finalbackend-ochre.vercel.app/api/umat/check/${encodeURIComponent(nama.trim())}`);
      setIsUmatMember(response.data.exists);
      
      if (!response.data.exists && formData.tipePerson === 'internal') {
        setFormData(prev => ({ ...prev, tipePerson: 'external' }));
        toast.warning('Person is not a member of umat. Tipe Person changed to External.');
      }
    } catch (error) {
      console.error('Error checking umat member:', error);
      setIsUmatMember(false);
    } finally {
      setCheckingUmat(false);
    }
  };

  const handleChange = (e) => {
    const newFormData = {
      ...formData,
      [e.target.name]: e.target.value
    };
    
    setFormData(newFormData);
    
    if (e.target.name === 'namaLengkap') {
      checkUmatMember(e.target.value);
    }
    
    if (e.target.name === 'tipePerson' && e.target.value === 'internal' && !isUmatMember) {
      toast.error('Person must be a member of umat to select Internal');
      setFormData(prev => ({ ...prev, tipePerson: 'external' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPendaftaran) {
        await axios.put(`https://finalbackend-ochre.vercel.app/api/pendaftaran/${editingPendaftaran._id}`, formData);
        toast.success('Pendaftaran updated successfully');
      } else {
        await axios.post('https://finalbackend-ochre.vercel.app/api/pendaftaran', formData);
        toast.success('Pendaftaran created successfully');
      }
      setShowModal(false);
      setEditingPendaftaran(null);
      setFormData({ namaLengkap: '', nomorTelepon: '', email: '', kegiatan: '' });
      fetchData(selectedKegiatan, selectedTanggal, selectedNama);
    } catch (error) {
      toast.error('Failed to save pendaftaran');
    }
  };

  const handleEdit = (pendaftaran) => {
    setEditingPendaftaran(pendaftaran);
    setFormData({
      namaLengkap: pendaftaran.namaLengkap || '',
      nomorTelepon: pendaftaran.nomorTelepon || '',
      email: pendaftaran.email || '',
      kegiatan: pendaftaran.kegiatan?._id || '',
      tipePerson: pendaftaran.tipePerson || 'external'
    });
    checkUmatMember(pendaftaran.namaLengkap);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this pendaftaran?')) {
      try {
        await axios.delete(`https://finalbackend-ochre.vercel.app/api/pendaftaran/${id}`);
        toast.success('Pendaftaran deleted successfully');
        fetchData(selectedKegiatan, selectedTanggal, selectedNama);
      } catch (error) {
        toast.error('Failed to delete pendaftaran');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select items to delete');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected items?`)) {
      try {
        await axios.delete('https://finalbackend-ochre.vercel.app/api/pendaftaran/bulk', {
          data: { ids: selectedIds }
        });
        toast.success('Selected pendaftaran deleted successfully');
        setSelectedIds([]);
        fetchData(selectedKegiatan, selectedTanggal, selectedNama);
      } catch (error) {
        toast.error('Failed to delete selected pendaftaran');
      }
    }
  };


  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(pendaftaran.map(item => item._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleKegiatanFilter = (e) => {
    const filterValue = e.target.value;
    setSelectedKegiatan(filterValue);
    setLoading(true);
    fetchData(filterValue, selectedTanggal, selectedNama);
  };

  const handleTanggalFilter = (e) => {
    const filterValue = e.target.value;
    setSelectedTanggal(filterValue);
    setLoading(true);
    fetchData(selectedKegiatan, filterValue, selectedNama);
  };

  const handleNamaInputChange = (e) => {
    setNamaSearchInput(e.target.value);
  };

  const handleNamaSearch = () => {
    setSelectedNama(namaSearchInput);
    setLoading(true);
    fetchData(selectedKegiatan, selectedTanggal, namaSearchInput);
  };

  const openModal = () => {
    setEditingPendaftaran(null);
    setFormData({ namaLengkap: '', nomorTelepon: '', email: '', kegiatan: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPendaftaran(null);
    setFormData({ namaLengkap: '', nomorTelepon: '', email: '', kegiatan: '', tipePerson: 'external' });
    setIsUmatMember(false);
  };

  const openQRModal = (pendaftaran) => {
    setSelectedQRCode(pendaftaran);
    setShowQRModal(true);
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setSelectedQRCode(null);
  };

  const downloadQRCode = (pendaftaran) => {
    if (!pendaftaran.qrCode) {
      toast.error('No QR code available for download');
      return;
    }

    const link = document.createElement('a');
    link.href = pendaftaran.qrCode;
    link.download = `QR_${pendaftaran.namaLengkap.replace(/\s+/g, '_')}_${pendaftaran.namaKegiatan.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded successfully');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  if (loading) {
    return <div className="loading">Loading pendaftaran data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pendaftaran Management</h1>
        <p className="page-subtitle">Manage event registrations</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Pendaftaran List</h3>
          <div className="d-flex gap-2">
            {selectedIds.length > 0 && (
              <button className="btn btn-danger" onClick={handleBulkDelete}>
                <FiTrash2 /> Delete Selected ({selectedIds.length})
              </button>
            )}
            <button className="btn btn-primary" onClick={openModal}>
              <FiPlus /> Add Pendaftaran
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '10px', 
            alignItems: 'center',
            justifyContent: 'space-between' 
          }}>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '10px', 
              alignItems: 'center',
              flex: '1',
              minWidth: '280px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                flex: '1',
                minWidth: '200px'
              }}>
                <label style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Kegiatan:</label>
                <select
                  value={selectedKegiatan}
                  onChange={handleKegiatanFilter}
                  className="form-control"
                  style={{ width: '100%', maxWidth: '250px' }}
                >
                  <option value="all">All Kegiatan</option>
                  {uniqueKegiatan.map((kegiatanName, index) => (
                    <option key={index} value={kegiatanName}>
                      {kegiatanName}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                flex: '1',
                minWidth: '200px'
              }}>
                <label style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Tanggal:</label>
                <input
                  type="date"
                  value={selectedTanggal}
                  onChange={handleTanggalFilter}
                  className="form-control"
                  style={{ width: '100%', maxWidth: '250px' }}
                />
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                flex: '1',
                minWidth: '250px'
              }}>
                <label style={{ marginBottom: 0, whiteSpace: 'nowrap' }}>Nama:</label>
                <input
                  type="text"
                  value={namaSearchInput}
                  onChange={handleNamaInputChange}
                  placeholder="Search by name..."
                  className="form-control"
                  style={{ flex: '1' }}
                />
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleNamaSearch}
                  style={{ padding: '6px 12px' }}
                >
                  Search
                </button>
              </div>
            </div>
            <div className="text-muted" style={{ whiteSpace: 'nowrap' }}>
              Total: {pendaftaran.length} registrations
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === pendaftaran.length && pendaftaran.length > 0}
                  />
                </th>
                <th>Nama Lengkap</th>
                <th>Nomor Telepon</th>
                <th>Email</th>
                <th>Kegiatan</th>
                <th>Tipe Person</th>
                <th>Tanggal Daftar</th>
                <th>QR Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendaftaran.map((item) => (
                <tr key={item._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item._id)}
                      onChange={() => handleSelectItem(item._id)}
                    />
                  </td>
                  <td style={{ fontWeight: '500' }}>{item.namaLengkap}</td>
                  <td>{item.nomorTelepon || '-'}</td>
                  <td>{item.email || '-'}</td>
                  <td>{item.namaKegiatan || '-'}</td>
                  <td>
                    <div className={`tipe-person-indicator ${item.tipePerson === 'internal' ? 'internal' : 'external'}`}>
                      {item.tipePerson === 'internal' ? 'Internal' : 'External'}
                    </div>
                  </td>
                  <td>{formatDate(item.tanggalDaftar)}</td>
                  <td>
                    {item.qrCode ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                          src={item.qrCode}
                          alt="QR Code"
                          style={{
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            borderRadius: '4px'
                          }}
                          onClick={() => openQRModal(item)}
                          title="Click to view larger QR code"
                        />
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => downloadQRCode(item)}
                          title="Download QR code"
                          style={{ padding: '4px 8px' }}
                        >
                          <FiDownload size={12} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>No QR</span>
                    )}
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
          <div className="modal-content" style={{ maxWidth: '600px' }} ref={modalRef}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingPendaftaran ? 'Edit Pendaftaran' : 'Add New Pendaftaran'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap *</label>
                <input
                  type="text"
                  name="namaLengkap"
                  value={formData.namaLengkap}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label className="form-label">Nomor Telepon *</label>
                  <input
                    type="text"
                    name="nomorTelepon"
                    value={formData.nomorTelepon}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Kegiatan *</label>
                <select
                  name="kegiatan"
                  value={formData.kegiatan}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="">Select Kegiatan</option>
                  {kegiatan.map((kegiatan) => (
                    <option key={kegiatan._id} value={kegiatan._id}>
                      {kegiatan.namaKegiatan}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tipe Person *</label>
                <div className="tipe-person-toggle">
                  <button
                    type="button"
                    className={`toggle-btn ${formData.tipePerson === 'external' ? 'active' : 'inactive'}`}
                    onClick={() => handleChange({ target: { name: 'tipePerson', value: 'external' } })}
                    disabled={checkingUmat}
                  >
                    External
                  </button>
                  <button
                    type="button"
                    className={`toggle-btn ${formData.tipePerson === 'internal' ? 'active' : 'inactive'}`}
                    onClick={() => {
                      if (isUmatMember) {
                        handleChange({ target: { name: 'tipePerson', value: 'internal' } });
                      } else {
                        toast.error('Person must be a member of umat to select Internal');
                      }
                    }}
                    disabled={checkingUmat || !isUmatMember}
                    title={!isUmatMember && formData.namaLengkap ? 'Not a member of umat' : ''}
                  >
                    Internal
                  </button>
                </div>
                {checkingUmat && (
                  <small className="text-muted">Checking umat membership...</small>
                )}
                {formData.namaLengkap && !checkingUmat && (
                  <small className={`text-${isUmatMember ? 'success' : 'warning'}`}>
                    {isUmatMember ? '✓ Member of umat' : '⚠ Not a member of umat'}
                  </small>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingPendaftaran ? 'Update' : 'Insert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQRModal && selectedQRCode && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '400px' }} ref={qrModalRef}>
            <div className="modal-header">
              <h3 className="modal-title">QR Code - {selectedQRCode.namaLengkap}</h3>
              <button className="close-btn" onClick={closeQRModal}>×</button>
            </div>
            
            <div style={{ textAlign: 'center', padding: '20px' }}>
              {selectedQRCode.qrCode ? (
                <img
                  src={selectedQRCode.qrCode}
                  alt="QR Code"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
              ) : (
                <p style={{ color: '#999' }}>No QR code available</p>
              )}
              
              <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <p><strong>Name:</strong> {selectedQRCode.namaLengkap}</p>
                <p><strong>Activity:</strong> {selectedQRCode.namaKegiatan}</p>
                <p><strong>Email:</strong> {selectedQRCode.email}</p>
              </div>
            </div>
            
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeQRModal}>
                Close
              </button>
              {selectedQRCode?.qrCode && (
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={() => downloadQRCode(selectedQRCode)}
                >
                  <FiDownload style={{ marginRight: '8px' }} />
                  Download QR Code
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendaftaranManagement;
