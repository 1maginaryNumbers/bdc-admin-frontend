import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiSettings } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';
import { compressImage, isFileSizeAcceptable, formatFileSize } from '../utils/imageCompression';

const GaleriManagement = () => {
  const { refreshTrigger } = useRefresh();
  const [galeri, setGaleri] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGaleri, setEditingGaleri] = useState(null);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'umum'
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [kategoris, setKategoris] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ nama: '', warna: '#3b82f6' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalImages: 0,
    imagesPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  });

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEscapeKey(() => {
    if (showModal) {
      closeModal();
    }
    if (showImageModal) {
      closeImageModal();
    }
    if (showCategoryModal) {
      closeCategoryModal();
    }
  });

  const modalRef = useOutsideClick(() => {
    if (showModal) {
      closeModal();
    }
  });

  const imageModalRef = useOutsideClick(() => {
    if (showImageModal) {
      closeImageModal();
    }
  });

  const categoryModalRef = useOutsideClick(() => {
    if (showCategoryModal) {
      closeCategoryModal();
    }
  });

  const fetchGaleri = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://finalbackend-ochre.vercel.app/api/galeri?page=${currentPage}&limit=20`);
      // Handle both old format (array) and new format (object with images property)
      const data = response.data;
      if (Array.isArray(data)) {
        setGaleri(data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalImages: data.length,
          imagesPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else if (data.images && Array.isArray(data.images)) {
        setGaleri(data.images);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalImages: data.images.length,
          imagesPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        setGaleri([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalImages: 0,
          imagesPerPage: 20,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      toast.error('Failed to fetch galeri data');
      setGaleri([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalImages: 0,
        imagesPerPage: 20,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  const fetchKategoris = useCallback(async () => {
    try {
      const response = await axios.get('https://finalbackend-ochre.vercel.app/api/kategori-galeri');
      setKategoris(response.data);
    } catch (error) {
      console.error('Error fetching kategoris:', error);
    }
  }, []);

  useEffect(() => {
    fetchGaleri();
    fetchKategoris();
  }, [fetchGaleri, fetchKategoris, refreshTrigger]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (!isFileSizeAcceptable(file, 4)) {
      toast.info(`Image size is ${formatFileSize(file.size)}. Compressing...`);
    }

    try {
      console.log('Starting compression...');
      const compressedFile = await compressImage(file, {
        maxWidth: 1280,
        maxHeight: 1280,
        quality: 0.7,
        maxSizeMB: 1
      });

      console.log('Compression complete:', {
        originalSize: file.size,
        compressedSize: compressedFile.size,
        reduction: ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%'
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
    
    if (isMobile && !editingGaleri) {
      toast.error('Image upload is not available on mobile devices. Please use a desktop browser.');
      return;
    }
    
    if (!selectedFile && !editingGaleri) {
      toast.error('Please select an image file');
      return;
    }

    if (selectedFile && !isFileSizeAcceptable(selectedFile, 4)) {
      toast.error(`File size is too large (${formatFileSize(selectedFile.size)}). Maximum allowed is 4MB.`);
      return;
    }

    setUploading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('judul', formData.judul);
      formDataToSend.append('deskripsi', formData.deskripsi);
      formDataToSend.append('kategori', formData.kategori);
      
      if (selectedFile) {
        formDataToSend.append('images', selectedFile);
      }

      if (editingGaleri) {
        await axios.put(`https://finalbackend-ochre.vercel.app/api/galeri/${editingGaleri._id}`, formDataToSend);
        toast.success('Galeri updated successfully');
      } else {
        await axios.post('https://finalbackend-ochre.vercel.app/api/galeri', formDataToSend);
        toast.success('Galeri created successfully');
      }
      
      setShowModal(false);
      setEditingGaleri(null);
      const defaultKategori = kategoris.length > 0 ? kategoris[0].nama : 'umum';
      setFormData({ judul: '', deskripsi: '', kategori: defaultKategori });
      setSelectedFile(null);
      setCurrentPage(1);
      fetchGaleri();
    } catch (error) {
      console.error('Error saving galeri:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save galeri';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (galeri) => {
    setEditingGaleri(galeri);
    setFormData({
      judul: galeri.judul,
      deskripsi: galeri.deskripsi || '',
      kategori: galeri.kategori
    });
    setSelectedFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this galeri item?')) {
      try {
        await axios.delete(`https://finalbackend-ochre.vercel.app/api/galeri/${id}`);
        toast.success('Galeri deleted successfully');
        setCurrentPage(1);
        fetchGaleri();
      } catch (error) {
        toast.error('Failed to delete galeri');
      }
    }
  };

  const openModal = () => {
    setEditingGaleri(null);
    const defaultKategori = kategoris.length > 0 ? kategoris[0].nama : 'umum';
    setFormData({ judul: '', deskripsi: '', kategori: defaultKategori });
    setSelectedFile(null);
    setShowModal(true);
  };

  const openCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData({ nama: '', warna: '#3b82f6' });
    setShowCategoryModal(true);
  };

  const closeCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryFormData({ nama: '', warna: '#3b82f6' });
  };

  const handleCategoryChange = (e) => {
    setCategoryFormData({
      ...categoryFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(
          `https://finalbackend-ochre.vercel.app/api/kategori-galeri/${editingCategory._id}`,
          categoryFormData
        );
        toast.success('Category updated successfully');
      } else {
        await axios.post(
          'https://finalbackend-ochre.vercel.app/api/kategori-galeri',
          categoryFormData
        );
        toast.success('Category created successfully');
      }
      closeCategoryModal();
      fetchKategoris();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save category';
      toast.error(errorMessage);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryFormData({ nama: category.nama, warna: category.warna || '#3b82f6' });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`https://finalbackend-ochre.vercel.app/api/kategori-galeri/${id}`);
        toast.success('Category deleted successfully');
        fetchKategoris();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingGaleri(null);
    const defaultKategori = kategoris.length > 0 ? kategoris[0].nama : 'umum';
    setFormData({ judul: '', deskripsi: '', kategori: defaultKategori });
    setSelectedFile(null);
  };

  const openImageModal = (item) => {
    setSelectedImage(item);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-center align-items-center mt-3">
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
          >
            Previous
          </button>
          
          {/* Page Numbers */}
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const startPage = Math.max(1, pagination.currentPage - 2);
            const pageNum = startPage + i;
            if (pageNum > pagination.totalPages) return null;
            
            return (
              <button
                key={pageNum}
                className={`btn btn-sm ${pageNum === pagination.currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => handlePageChange(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) {
      try {
        const base64Data = url.split(',')[1];
        if (base64Data && base64Data.length > 100) {
          return url;
        } else {
          return '';
        }
      } catch (e) {
        return '';
      }
    }
    if (url.startsWith('http')) {
      return url;
    }
    const apiUrl = process.env.REACT_APP_API_URL || 'https://finalbackend-ochre.vercel.app';
    if (url.startsWith('/')) {
      return `${apiUrl}${url}`;
    }
    return `${apiUrl}/${url}`;
  };

  if (loading) {
    return <div className="loading">Loading galeri data...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Galeri Management</h1>
        <p className="page-subtitle">Manage temple gallery images</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Galeri List</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn btn-outline-primary" 
              onClick={openCategoryModal}
            >
              <FiSettings /> Manage Categories
            </button>
            <button 
              className="btn btn-primary" 
              onClick={openModal}
              disabled={isMobile}
              style={isMobile ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
            >
              <FiPlus /> Add Image
            </button>
          </div>
        </div>
        {isMobile && (
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#856404'
          }}>
            Image upload is only available on desktop browsers. Please use a PC to upload images to the gallery.
          </div>
        )}

        {/* Top Pagination Controls */}
        {renderPagination()}

        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Judul</th>
                <th>Deskripsi</th>
                <th>Kategori</th>
                <th>Tanggal Upload</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {galeri.map((item) => (
                <tr key={item._id}>
                  <td>
                    <img
                      src={getImageUrl(item.url)}
                      alt={item.judul}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'cover',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      onClick={() => openImageModal(item)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                    <div 
                      style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        display: 'none',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#666'
                      }}
                    >
                      No Image
                    </div>
                  </td>
                  <td style={{ fontWeight: '500' }}>{item.judul}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.deskripsi || '-'}
                  </td>
                  <td>
                    {(() => {
                      const kategori = kategoris.find(k => k.nama === item.kategori);
                      const warna = kategori?.warna || '#6c757d';
                      return (
                        <span 
                          className="btn btn-sm" 
                          style={{ 
                            backgroundColor: warna, 
                            borderColor: warna,
                            color: 'white'
                          }}
                        >
                          {item.kategori}
                        </span>
                      );
                    })()}
                  </td>
                  <td>{formatDate(item.tanggalUpload)}</td>
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

        {/* Bottom Pagination Controls */}
        {renderPagination()}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '600px' }} ref={modalRef}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingGaleri ? 'Edit Galeri' : 'Add New Image'}
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
                <label className="form-label">Deskripsi</label>
                <textarea
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  className="form-control"
                >
                  {kategoris.length > 0 ? (
                    kategoris.map((kat) => (
                      <option key={kat._id} value={kat.nama}>
                        {kat.nama}
                      </option>
                    ))
                  ) : (
                    <option value="umum">Umum</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  {editingGaleri ? 'New Image (optional)' : 'Image *'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-control"
                  required={!editingGaleri}
                  disabled={isMobile}
                />
                {isMobile && (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    backgroundColor: '#fff3cd', 
                    border: '1px solid #ffc107',
                    borderRadius: '4px',
                    fontSize: '14px',
                    color: '#856404'
                  }}>
                    Image upload is not available on mobile devices. Please use a desktop browser to upload images.
                  </div>
                )}
                {selectedFile && (
                  <div style={{ marginTop: '10px' }}>
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                    />
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                      File size: {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                )}
                {editingGaleri && !selectedFile && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      Current image: {editingGaleri.judul}
                    </p>
                    <img
                      src={getImageUrl(editingGaleri.url)}
                      alt="Current"
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  {uploading ? 'Uploading...' : (editingGaleri ? 'Update' : 'Upload')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImageModal && selectedImage && (
        <div className="modal" style={{ zIndex: 1001 }}>
          <div className="modal-content" style={{ 
            maxWidth: '90vw', 
            maxHeight: '90vh', 
            width: 'auto', 
            height: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }} ref={imageModalRef}>
            <div className="modal-header" style={{ width: '100%', marginBottom: '20px' }}>
              <h3 className="modal-title">{selectedImage.judul}</h3>
              <button className="close-btn" onClick={closeImageModal}>×</button>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              flex: 1,
              width: '100%'
            }}>
              <img
                src={getImageUrl(selectedImage.url)}
                alt={selectedImage.judul}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBGb3VuZDwvdGV4dD48L3N2Zz4=';
                }}
              />
            </div>
            
            <div style={{ 
              width: '100%', 
              marginTop: '20px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px'
            }}>
              <p><strong>Deskripsi:</strong> {selectedImage.deskripsi || 'Tidak ada deskripsi'}</p>
              <p><strong>Kategori:</strong> {selectedImage.kategori}</p>
              <p><strong>Tanggal Upload:</strong> {formatDate(selectedImage.tanggalUpload)}</p>
            </div>
            
            <div className="modal-footer" style={{ width: '100%', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" onClick={closeImageModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="modal" style={{ zIndex: 1002 }}>
          <div className="modal-content" style={{ maxWidth: '600px' }} ref={categoryModalRef}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button className="close-btn" onClick={closeCategoryModal}>×</button>
            </div>
            <form onSubmit={handleCategorySubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    name="nama"
                    value={categoryFormData.nama}
                    onChange={handleCategoryChange}
                    className="form-control"
                    required
                    placeholder="Enter category name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="color"
                      name="warna"
                      value={categoryFormData.warna}
                      onChange={handleCategoryChange}
                      style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      name="warna"
                      value={categoryFormData.warna}
                      onChange={handleCategoryChange}
                      className="form-control"
                      style={{ flex: 1 }}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeCategoryModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Update' : 'Create'} Category
                </button>
              </div>
            </form>
            <div style={{ padding: '20px', borderTop: '1px solid #dee2e6' }}>
              <h4 style={{ marginBottom: '15px' }}>Existing Categories</h4>
              {kategoris.length === 0 ? (
                <p style={{ color: '#6c757d' }}>No categories yet. Create your first category above.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {kategoris.map((kat) => (
                    <div
                      key={kat._id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        border: '1px solid #dee2e6'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '30px',
                            height: '30px',
                            backgroundColor: kat.warna || '#3b82f6',
                            borderRadius: '4px',
                            border: '2px solid #fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                        />
                        <span style={{ fontWeight: '500' }}>{kat.nama}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEditCategory(kat)}
                        >
                          <FiEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteCategory(kat._id)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriManagement;
