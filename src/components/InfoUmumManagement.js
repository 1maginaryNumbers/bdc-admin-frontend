import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const InfoUmumManagement = () => {
  const [infoUmum, setInfoUmum] = useState({
    namaVihara: '',
    alamat: '',
    telepon: '',
    email: '',
    website: '',
    sejarah: '',
    visi: '',
    misi: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInfoUmum();
  }, []);

  const fetchInfoUmum = async () => {
    try {
      const response = await axios.get('https://finalbackend-ochre.vercel.app/api/info-umum');
      if (response.data) {
        setInfoUmum(response.data);
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Nama Vihara *</label>
              <input
                type="text"
                name="namaVihara"
                value={infoUmum.namaVihara}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

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
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                value={infoUmum.email}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Website</label>
              <input
                type="url"
                name="website"
                value={infoUmum.website}
                onChange={handleChange}
                className="form-control"
                placeholder="https://example.com"
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
