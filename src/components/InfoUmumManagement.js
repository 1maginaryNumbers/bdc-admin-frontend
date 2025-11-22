import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiCalendar } from 'react-icons/fi';

const InfoUmumManagement = () => {
  const [infoUmum, setInfoUmum] = useState({
    judul: '',
    alamat: '',
    telepon: '',
    email: '',
    sejarah: '',
    visi: '',
    misi: '',
    jamOperasional: [],
    tanggalKhusus: []
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
        // Convert old format (single day string) to new format (array of days)
        const jamOperasional = (data.jamOperasional || []).map(jam => ({
          ...jam,
          hari: Array.isArray(jam.hari) ? jam.hari : [jam.hari].filter(Boolean)
        }));
        
        setInfoUmum({
          judul: data.judul || '',
          alamat: data.alamat || '',
          telepon: data.telepon || '',
          email: data.email || '',
          sejarah: data.sejarah || '',
          visi: data.visi || '',
          misi: data.misi || '',
          jamOperasional: jamOperasional,
          tanggalKhusus: data.tanggalKhusus && Array.isArray(data.tanggalKhusus) ? data.tanggalKhusus : []
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
        { hari: ['senin'], jamBuka: '08:00', jamTutup: '17:00', tutup: false }
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
    if (field === 'hari') {
      // Handle multi-select for days
      const currentDays = newJamOperasional[index].hari || [];
      if (currentDays.includes(value)) {
        newJamOperasional[index].hari = currentDays.filter(d => d !== value);
      } else {
        newJamOperasional[index].hari = [...currentDays, value];
      }
    } else {
      newJamOperasional[index][field] = value;
    }
    setInfoUmum({
      ...infoUmum,
      jamOperasional: newJamOperasional
    });
  };

  const handleAddTanggalKhusus = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    setInfoUmum({
      ...infoUmum,
      tanggalKhusus: [
        ...infoUmum.tanggalKhusus,
        { tanggal: dateString, keterangan: '', tutup: true }
      ]
    });
  };

  const handleRemoveTanggalKhusus = (index) => {
    const newTanggalKhusus = infoUmum.tanggalKhusus.filter((_, i) => i !== index);
    setInfoUmum({
      ...infoUmum,
      tanggalKhusus: newTanggalKhusus
    });
  };

  const handleTanggalKhususChange = (index, field, value) => {
    const newTanggalKhusus = [...infoUmum.tanggalKhusus];
    newTanggalKhusus[index][field] = value;
    setInfoUmum({
      ...infoUmum,
      tanggalKhusus: newTanggalKhusus
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

          {/* Jam Operasional Section */}
          <div className="form-group" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e9ecef' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <label className="form-label" style={{ marginBottom: 0, fontSize: '18px', fontWeight: 'bold' }}>
                Jam Operasional
              </label>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {infoUmum.jamOperasional.map((jam, index) => (
                  <div key={index} style={{ 
                    border: '1px solid #dee2e6', 
                    borderRadius: '8px', 
                    padding: '20px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#495057' }}>
                        Schedule {index + 1}
                      </h4>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveJamOperasional(index)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    
                    <div style={{ marginBottom: '15px' }}>
                      <label className="form-label" style={{ fontSize: '13px', marginBottom: '8px', display: 'block', fontWeight: '600' }}>
                        Pilih Hari (Select Days) *
                      </label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {daysOfWeek.map(day => {
                          const isSelected = (jam.hari || []).includes(day.value);
                          return (
                            <button
                              key={day.value}
                              type="button"
                              onClick={() => handleJamOperasionalChange(index, 'hari', day.value)}
                              style={{
                                padding: '8px 16px',
                                borderRadius: '6px',
                                border: `2px solid ${isSelected ? '#007bff' : '#dee2e6'}`,
                                backgroundColor: isSelected ? '#007bff' : '#fff',
                                color: isSelected ? '#fff' : '#495057',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: isSelected ? '600' : '400',
                                transition: 'all 0.2s'
                              }}
                            >
                              {day.label}
                            </button>
                          );
                        })}
                      </div>
                      {(jam.hari || []).length === 0 && (
                        <p style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px' }}>
                          Please select at least one day
                        </p>
                      )}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '13px', marginBottom: '5px', display: 'block', fontWeight: '600' }}>
                          Jam Buka (Opening Time)
                        </label>
                        <input
                          type="time"
                          value={jam.jamBuka}
                          onChange={(e) => handleJamOperasionalChange(index, 'jamBuka', e.target.value)}
                          className="form-control"
                          disabled={jam.tutup}
                        />
                      </div>
                      
                      <div>
                        <label className="form-label" style={{ fontSize: '13px', marginBottom: '5px', display: 'block', fontWeight: '600' }}>
                          Jam Tutup (Closing Time)
                        </label>
                        <input
                          type="time"
                          value={jam.jamTutup}
                          onChange={(e) => handleJamOperasionalChange(index, 'jamTutup', e.target.value)}
                          className="form-control"
                          disabled={jam.tutup}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={jam.tutup}
                          onChange={(e) => handleJamOperasionalChange(index, 'tutup', e.target.checked)}
                        />
                        <span style={{ fontSize: '14px', color: '#495057' }}>
                          Tutup (Closed on selected days)
                        </span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tanggal Khusus Section */}
          <div className="form-group" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e9ecef' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <label className="form-label" style={{ marginBottom: 0, fontSize: '18px', fontWeight: 'bold' }}>
                <FiCalendar style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Tanggal Khusus (Exceptional Dates)
              </label>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleAddTanggalKhusus}
              >
                <FiPlus style={{ marginRight: '5px' }} />
                Add Date
              </button>
            </div>
            
            <p style={{ color: '#6c757d', fontSize: '13px', marginBottom: '15px', fontStyle: 'italic' }}>
              Add special dates when the temple is closed (e.g., national holidays, special events)
            </p>
            
            {infoUmum.tanggalKhusus.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                No exceptional dates set. Click "Add Date" to add one.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {infoUmum.tanggalKhusus.map((tanggal, index) => (
                  <div key={index} style={{ 
                    border: '1px solid #dee2e6', 
                    borderRadius: '8px', 
                    padding: '20px',
                    backgroundColor: '#fff3cd'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#856404' }}>
                        Exceptional Date {index + 1}
                      </h4>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleRemoveTanggalKhusus(index)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                      <div>
                        <label className="form-label" style={{ fontSize: '13px', marginBottom: '5px', display: 'block', fontWeight: '600' }}>
                          Tanggal (Date) *
                        </label>
                        <input
                          type="date"
                          value={tanggal.tanggal}
                          onChange={(e) => handleTanggalKhususChange(index, 'tanggal', e.target.value)}
                          className="form-control"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="form-label" style={{ fontSize: '13px', marginBottom: '5px', display: 'block', fontWeight: '600' }}>
                          Keterangan (Description)
                        </label>
                        <input
                          type="text"
                          value={tanggal.keterangan || ''}
                          onChange={(e) => handleTanggalKhususChange(index, 'keterangan', e.target.value)}
                          className="form-control"
                          placeholder="e.g., Hari Raya Nyepi, Tahun Baru, etc."
                        />
                      </div>
                    </div>
                    
                    <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
                      <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
                        <strong>Status:</strong> Temple will be closed on this date
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="text-right" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #e9ecef' }}>
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
