import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const InfoUmumManagement = () => {
  const [infoUmum, setInfoUmum] = useState({
    judul: '',
    alamat: '',
    telepon: '',
    email: '',
    sejarah: '',
    visi: '',
    misi: '',
    jamOperasional: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const daysOfWeek = [
    { value: 'senin', label: 'Senin' },
    { value: 'selasa', label: 'Selasa' },
    { value: 'rabu', label: 'Rabu' },
    { value: 'kamis', label: 'Kamis' },
    { value: 'jumat', label: 'Jumat' },
    { value: 'sabtu', label: 'Sabtu' },
    { value: 'minggu', label: 'Minggu' }
  ];

  useEffect(() => {
    fetchInfoUmum();
  }, []);

  const fetchInfoUmum = async () => {
    try {
      const response = await axios.get('https://finalbackend-ochre.vercel.app/api/info-umum');
      if (response.data) {
        const data = response.data;
        setInfoUmum({
          judul: data.judul || '',
          alamat: data.alamat || '',
          telepon: data.telepon || '',
          email: data.email || '',
          sejarah: data.sejarah || '',
          visi: data.visi || '',
          misi: data.misi || '',
          jamOperasional: data.jamOperasional && Array.isArray(data.jamOperasional) ? data.jamOperasional : []
        });
      }
    } catch (error) {
      toast.error('Failed to fetch info umum data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setInfoUmum({
      ...infoUmum,
      [e.target.name]: e.target.value
    });
  };

  const handleAddJamOperasional = () => {
    setInfoUmum({
      ...infoUmum,
      jamOperasional: [
        ...infoUmum.jamOperasional,
        { hari: 'senin', jamBuka: '08:00', jamTutup: '17:00', tutup: false }
      ]
    });
  };

  const handleRemoveJamOperasional = (index) => {
    const newJamOperasional = infoUmum.jamOperasional.filter((_, i) => i !== index);
    setInfoUmum({
      ...infoUmum,
      jamOperasional: newJamOperasional
    });
  };

  const handleJamOperasionalChange = (index, field, value) => {
    const newJamOperasional = [...infoUmum.jamOperasional];
    if (field === 'tutup') {
      newJamOperasional[index][field] = value;
    } else {
      newJamOperasional[index][field] = value;
    }
    setInfoUmum({
      ...infoUmum,
      jamOperasional: newJamOperasional
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('https://finalbackend-ochre.vercel.app/api/info-umum', infoUmum);
      toast.success('Info umum updated successfully');
    } catch (error) {
      toast.error('Failed to update info umum');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading info umum data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Info Umum Management</h1>
        <p className="page-subtitle">Manage general temple information</p>
      </div>

      <div className="content-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Judul *</label>
            <input
              type="text"
              name="judul"
              value={infoUmum.judul}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Alamat</label>
            <textarea
              name="alamat"
              value={infoUmum.alamat}
              onChange={handleChange}
              className="form-control"
              rows="3"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Telepon</label>
              <input
                type="text"
                name="telepon"
                value={infoUmum.telepon}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={infoUmum.email}
                onChange={handleChange}
                className="form-control"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Sejarah</label>
            <textarea
              name="sejarah"
              value={infoUmum.sejarah}
              onChange={handleChange}
              className="form-control"
              rows="5"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Visi</label>
            <textarea
              name="visi"
              value={infoUmum.visi}
              onChange={handleChange}
              className="form-control"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Misi</label>
            <textarea
              name="misi"
              value={infoUmum.misi}
              onChange={handleChange}
              className="form-control"
              rows="3"
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Jam Operasional</label>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleAddJamOperasional}
              >
                <FiPlus style={{ marginRight: '5px' }} />
                Add Schedule
              </button>
            </div>
            
            {infoUmum.jamOperasional.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                No operating hours set. Click "Add Schedule" to add one.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {infoUmum.jamOperasional.map((jam, index) => (
                  <div key={index} style={{ 
                    border: '1px solid #dee2e6', 
                    borderRadius: '4px', 
                    padding: '15px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>Schedule {index + 1}</h4>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveJamOperasional(index)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', alignItems: 'end' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '12px', marginBottom: '5px' }}>Hari</label>
                        <select
                          value={jam.hari}
                          onChange={(e) => handleJamOperasionalChange(index, 'hari', e.target.value)}
                          className="form-control"
                        >
                          {daysOfWeek.map(day => (
                            <option key={day.value} value={day.value}>{day.label}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="form-label" style={{ fontSize: '12px', marginBottom: '5px' }}>Jam Buka</label>
                        <input
                          type="time"
                          value={jam.jamBuka}
                          onChange={(e) => handleJamOperasionalChange(index, 'jamBuka', e.target.value)}
                          className="form-control"
                          disabled={jam.tutup}
                        />
                      </div>
                      
                      <div>
                        <label className="form-label" style={{ fontSize: '12px', marginBottom: '5px' }}>Jam Tutup</label>
                        <input
                          type="time"
                          value={jam.jamTutup}
                          onChange={(e) => handleJamOperasionalChange(index, 'jamTutup', e.target.value)}
                          className="form-control"
                          disabled={jam.tutup}
                        />
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={jam.tutup}
                          onChange={(e) => handleJamOperasionalChange(index, 'tutup', e.target.checked)}
                        />
                        <span style={{ fontSize: '14px' }}>Tutup (Closed on this day)</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InfoUmumManagement;
