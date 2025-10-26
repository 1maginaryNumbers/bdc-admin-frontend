import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiCheckSquare, FiDownload, FiBarChart } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';

const AbsensiManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [absensi, setAbsensi] = useState([]);
  const [kegiatan, setKegiatan] = useState([]);
  const [pendaftaran, setPendaftaran] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAbsensi, setEditingAbsensi] = useState(null);
  const [formData, setFormData] = useState({
    kegiatan: '',
    pendaftaran: '',
    status: 'hadir',
    tipePerson: 'external'
  });
  const [selectedKegiatan, setSelectedKegiatan] = useState('all');
  const [uniqueKegiatan, setUniqueKegiatan] = useState([]);
  const [selectedTanggal, setSelectedTanggal] = useState('');
  const [selectedNama, setSelectedNama] = useState('');
  const [namaSearchInput, setNamaSearchInput] = useState('');
  const [isUmatMember, setIsUmatMember] = useState(false);
  const [checkingUmat, setCheckingUmat] = useState(false);

  useEffect(() => {
    fetchData();
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

  const fetchData = async (kegiatanFilter = 'all', tanggalFilter = '', namaFilter = '') => {
    try {
      const [absensiRes, kegiatanRes, pendaftaranRes] = await Promise.all([
        axios.get('https://finalbackend-ochre.vercel.app/api/absensi'),
        axios.get('https://finalbackend-ochre.vercel.app/api/kegiatan'),
        axios.get('https://finalbackend-ochre.vercel.app/api/pendaftaran')
      ]);
      
      let filteredAbsensi = absensiRes.data;
      
      // Handle both old format (array) and new format (object with absensi property)
      if (Array.isArray(filteredAbsensi)) {
        // Already an array, use as is
      } else if (filteredAbsensi.absensi && Array.isArray(filteredAbsensi.absensi)) {
        filteredAbsensi = filteredAbsensi.absensi;
      } else {
        filteredAbsensi = [];
      }
      
      if (kegiatanFilter !== 'all') {
        filteredAbsensi = filteredAbsensi.filter(item => 
          item.kegiatan?.namaKegiatan === kegiatanFilter
        );
      }
      
      if (tanggalFilter) {
        const filterDate = new Date(tanggalFilter).toDateString();
        filteredAbsensi = filteredAbsensi.filter(item => {
          const itemDate = new Date(item.tanggal).toDateString();
          return itemDate === filterDate;
        });
      }
      
      if (namaFilter) {
        filteredAbsensi = filteredAbsensi.filter(item => 
          item.pendaftaran?.namaLengkap?.toLowerCase().includes(namaFilter.toLowerCase())
        );
      }
      
      setAbsensi(filteredAbsensi);
      
      // Handle both old format (array) and new format (object with kegiatan property)
      const kegiatanData = kegiatanRes.data;
      if (Array.isArray(kegiatanData)) {
        setKegiatan(kegiatanData);
      } else if (kegiatanData.kegiatan && Array.isArray(kegiatanData.kegiatan)) {
        setKegiatan(kegiatanData.kegiatan);
      } else {
        setKegiatan([]);
      }
      
      // Handle both old format (array) and new format (object with pendaftaran property)
      const pendaftaranData = pendaftaranRes.data;
      if (Array.isArray(pendaftaranData)) {
        setPendaftaran(pendaftaranData);
      } else if (pendaftaranData.pendaftaran && Array.isArray(pendaftaranData.pendaftaran)) {
        setPendaftaran(pendaftaranData.pendaftaran);
      } else {
        setPendaftaran([]);
      }
      
      // Use the processed absensi data for unique kegiatan
      const uniqueKegiatanFromAbsensi = [...new Set(filteredAbsensi.map(item => item.kegiatan?.namaKegiatan).filter(Boolean))];
      setUniqueKegiatan(uniqueKegiatanFromAbsensi);
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
    const { name, value } = e.target;
    
    if (name === 'kegiatan') {
      setFormData({
        ...formData,
        [name]: value,
        pendaftaran: ''
      });
    } else if (name === 'pendaftaran') {
      const selectedPendaftaran = pendaftaran.find(p => p._id === value);
      setFormData({
        ...formData,
        [name]: value,
        tipePerson: selectedPendaftaran?.tipePerson || 'external'
      });
      
      if (selectedPendaftaran) {
        checkUmatMember(selectedPendaftaran.namaLengkap);
      }
    } else if (name === 'tipePerson' && value === 'internal' && !isUmatMember) {
      toast.error('Person must be a member of umat to select Internal');
      setFormData(prev => ({ ...prev, tipePerson: 'external' }));
      return;
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
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

  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'hadir' ? 'tidak_hadir' : 'hadir';
      await axios.put(`https://finalbackend-ochre.vercel.app/api/absensi/${id}`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchData(selectedKegiatan, selectedTanggal, selectedNama);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAbsensi) {
        await axios.put(`https://finalbackend-ochre.vercel.app/api/absensi/${editingAbsensi._id}`, formData);
        toast.success('Absensi updated successfully');
      } else {
        await axios.post('https://finalbackend-ochre.vercel.app/api/absensi', formData);
        toast.success('Absensi created successfully');
      }
      setShowModal(false);
      setEditingAbsensi(null);
      setFormData({
        kegiatan: '',
        pendaftaran: '',
        status: 'hadir'
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to save absensi');
    }
  };

  const handleEdit = (absensi) => {
    setEditingAbsensi(absensi);
    setFormData({
      kegiatan: absensi.kegiatan?._id || '',
      pendaftaran: absensi.pendaftaran?._id || '',
      status: absensi.status || 'hadir',
      tipePerson: absensi.tipePerson || absensi.pendaftaran?.tipePerson || 'external'
    });
    
    if (absensi.pendaftaran?.namaLengkap) {
      checkUmatMember(absensi.pendaftaran.namaLengkap);
    }
    
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this absensi?')) {
      try {
        await axios.delete(`https://finalbackend-ochre.vercel.app/api/absensi/${id}`);
        toast.success('Absensi deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete absensi');
      }
    }
  };

  const openModal = () => {
    setEditingAbsensi(null);
    setFormData({
      kegiatan: '',
      pendaftaran: '',
      status: 'hadir'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAbsensi(null);
    setFormData({
      kegiatan: '',
      pendaftaran: '',
      status: 'hadir',
      tipePerson: 'external'
    });
    setIsUmatMember(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const exportToCSV = () => {
    const csvHeader = 'Nama Lengkap,Kegiatan,Status,Tanggal Absensi,Tipe Person\n';
    const csvData = absensi.map(item => {
      const nama = item.pendaftaran?.namaLengkap || 'Unknown';
      const kegiatan = item.kegiatan?.namaKegiatan || 'Unknown';
      const status = item.status || 'Unknown';
      const tanggal = item.tanggalAbsensi ? formatDate(item.tanggalAbsensi) : 'Unknown';
      const tipePerson = item.tipePerson || 'external';
      
      return `"${nama}","${kegiatan}","${status}","${tanggal}","${tipePerson}"`;
    }).join('\n');
    
    const csvContent = csvHeader + csvData;
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Attendance report exported successfully!');
  };

  const generateSummaryReport = () => {
    const summary = {
      totalAttendance: absensi.length,
      presentCount: absensi.filter(a => a.status === 'hadir').length,
      absentCount: absensi.filter(a => a.status === 'tidak_hadir').length,
      activitiesCount: [...new Set(absensi.map(a => a.kegiatan?.namaKegiatan).filter(Boolean))].length,
      attendanceRate: absensi.length > 0 ? ((absensi.filter(a => a.status === 'hadir').length / absensi.length) * 100).toFixed(2) : 0
    };

    const reportText = `
ATTENDANCE SUMMARY REPORT
Generated: ${new Date().toLocaleDateString('id-ID')}

Total Records: ${summary.totalAttendance}
Present: ${summary.presentCount}
Absent: ${summary.absentCount}
Activities Covered: ${summary.activitiesCount}
Attendance Rate: ${summary.attendanceRate}%

DETAILED BREAKDOWN BY ACTIVITY:
${[...new Set(absensi.map(a => a.kegiatan?.namaKegiatan).filter(Boolean))].map(activityName => {
  const activityAbsensi = absensi.filter(a => a.kegiatan?.namaKegiatan === activityName);
  const present = activityAbsensi.filter(a => a.status === 'hadir').length;
  const total = activityAbsensi.length;
  const rate = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
  return `${activityName}: ${present}/${total} (${rate}%)`;
}).join('\n')}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_summary_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    toast.success('Summary report generated successfully!');
  };

  if (loading) {
    return <div className="loading">Loading absensi data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Absensi Management</h1>
        <p className="page-subtitle">Manage attendance records</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Absensi List</h3>
          <div className="d-flex gap-2">
            <button className="btn btn-success" onClick={exportToCSV}>
              <FiDownload /> Export CSV
            </button>
            <button className="btn btn-info" onClick={generateSummaryReport}>
              <FiBarChart /> Summary Report
            </button>
            <button className="btn btn-primary" onClick={openModal}>
              <FiPlus /> Add Absensi
            </button>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <label className="form-label mb-0">Kegiatan:</label>
              <select
                value={selectedKegiatan}
                onChange={handleKegiatanFilter}
                className="form-control"
                style={{ width: 'auto', minWidth: '180px' }}
              >
                <option value="all">All Kegiatan</option>
                {uniqueKegiatan.map((kegiatanName, index) => (
                  <option key={index} value={kegiatanName}>
                    {kegiatanName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <label className="form-label mb-0">Tanggal:</label>
              <input
                type="date"
                value={selectedTanggal}
                onChange={handleTanggalFilter}
                className="form-control"
                style={{ width: 'auto', minWidth: '150px' }}
              />
            </div>
            
            <div className="d-flex align-items-center gap-2">
              <label className="form-label mb-0">Nama:</label>
              <input
                type="text"
                value={namaSearchInput}
                onChange={handleNamaInputChange}
                placeholder="Search by name..."
                className="form-control"
                style={{ width: 'auto', minWidth: '150px' }}
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
          <div className="text-muted">
            Total: {absensi.length} attendance records
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Kegiatan</th>
                <th>Tipe Person</th>
                <th>Tanggal</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {absensi.map((item) => (
                <tr key={item._id}>
                  <td style={{ fontWeight: '500' }}>{item.pendaftaran?.namaLengkap || '-'}</td>
                  <td>{item.kegiatan?.namaKegiatan || '-'}</td>
                  <td>
                    <div className={`tipe-person-indicator ${(item.tipePerson || item.pendaftaran?.tipePerson) === 'internal' ? 'internal' : 'external'}`}>
                      {(item.tipePerson || item.pendaftaran?.tipePerson) === 'internal' ? 'Internal' : 'External'}
                    </div>
                  </td>
                  <td>{formatDate(item.tanggal)}</td>
                  <td>
                    <div 
                      className={`status-switch ${item.status === 'hadir' ? 'active' : 'inactive'}`}
                      onClick={() => handleStatusToggle(item._id, item.status)}
                      title={`Switch to ${item.status === 'hadir' ? 'tidak_hadir' : 'hadir'}`}
                      style={{
                        width: '60px',
                        height: '24px',
                        borderRadius: '12px',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        backgroundColor: item.status === 'hadir' ? '#28a745' : '#dc3545',
                        border: '2px solid transparent',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: 'white',
                          position: 'absolute',
                          top: '0px',
                          left: item.status === 'hadir' ? '36px' : '0px',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          color: item.status === 'hadir' ? '#28a745' : '#dc3545'
                        }}
                      >
                        {item.status === 'hadir' ? '✓' : '✗'}
                      </div>
                    </div>
                  </td>
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

      {showModal && (
        <div className="modal">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingAbsensi ? 'Edit Absensi' : 'Add New Absensi'}
              </h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
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
                <label className="form-label">Pendaftaran *</label>
                <select
                  name="pendaftaran"
                  value={formData.pendaftaran}
                  onChange={handleChange}
                  className="form-control"
                  required
                  disabled={!formData.kegiatan}
                >
                  <option value="">
                    {!formData.kegiatan ? "Select Kegiatan first" : "Select Pendaftaran"}
                  </option>
                  {pendaftaran
                    .filter(p => !formData.kegiatan || p.kegiatan === formData.kegiatan)
                    .map((pendaftaran) => (
                      <option key={pendaftaran._id} value={pendaftaran._id}>
                        {pendaftaran.namaLengkap} - {pendaftaran.namaKegiatan}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="hadir">Hadir</option>
                  <option value="tidak_hadir">Tidak Hadir</option>
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
                    title={!isUmatMember && formData.pendaftaran ? 'Not a member of umat' : ''}
                  >
                    Internal
                  </button>
                </div>
                {checkingUmat && (
                  <small className="text-muted">Checking umat membership...</small>
                )}
                {formData.pendaftaran && !checkingUmat && (
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
                  {editingAbsensi ? 'Update' : 'Insert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AbsensiManagement;
