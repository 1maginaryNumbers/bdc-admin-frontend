import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiCamera, FiCheck, FiX, FiImage } from 'react-icons/fi';
import QrScanner from 'qr-scanner';

const QRScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedKegiatan, setSelectedKegiatan] = useState('');
  const [kegiatan, setKegiatan] = useState([]);
  const [lastScanResult, setLastScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scanMode, setScanMode] = useState('camera');
  const [uploadedImage, setUploadedImage] = useState(null);
  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const handleScanResultRef = useRef(null);

  useEffect(() => {
    fetchKegiatan();
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (handleScanResult) {
      handleScanResultRef.current = handleScanResult;
    }
  });

  useEffect(() => {
    if (isScanning && videoRef.current && scanMode === 'camera') {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
        qrScannerRef.current = null;
      }
      
      console.log('Creating QR scanner...');
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR detected:', result.data);
          if (handleScanResultRef.current) {
            handleScanResultRef.current(result.data);
          }
        },
        {
          onDecodeError: (error) => {
            console.log('QR decode error:', error);
          },
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredFacingMode: 'environment'
        }
      );
      
      qrScannerRef.current = qrScanner;
      
      console.log('Starting QR scanner...');
      qrScanner.start()
        .then(() => {
          console.log('QR scanner started successfully');
        })
        .catch((err) => {
          console.error('QR scanner start error:', err);
          toast.error('Failed to start QR scanner. Please check camera permissions.');
        });
      
      return () => {
        if (qrScannerRef.current) {
          qrScannerRef.current.stop();
        }
      };
    }
  }, [isScanning, scanMode]);

  const fetchKegiatan = async () => {
    try {
      const response = await axios.get('https://finalbackend-ochre.vercel.app/api/kegiatan');
      // Handle both old format (array) and new format (object with kegiatan property)
      const data = response.data;
      if (Array.isArray(data)) {
        setKegiatan(data);
      } else if (data.kegiatan && Array.isArray(data.kegiatan)) {
        setKegiatan(data.kegiatan);
      } else {
        setKegiatan([]);
      }
    } catch (error) {
      toast.error('Failed to fetch kegiatan data');
      setKegiatan([]);
    }
  };

  const startScanning = async () => {
    if (!selectedKegiatan) {
      toast.error('Please select a kegiatan first');
      return;
    }

    try {
      setIsScanning(true);
      setLastScanResult(null);
      console.log('Scanning started...');
    } catch (error) {
      console.error('Error starting scanning:', error);
      setIsScanning(false);
      toast.error('Failed to start scanning');
    }
  };

  const stopScanning = () => {
    console.log('Stopping scanning...');
    
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    
    setIsScanning(false);
    toast.info('Scanning stopped');
  };

  const handleScanResult = async (qrData) => {
    if (loading) return;
    
    setLoading(true);
    try {
      // Trim and validate QR code data
      const trimmedQrData = qrData.trim();
      
      if (!trimmedQrData) {
        throw new Error('QR Code data is empty');
      }
      
      const response = await axios.post('https://finalbackend-ochre.vercel.app/api/absensi/scan', {
        qrCodeData: trimmedQrData,
        kegiatanId: selectedKegiatan
      });

      setLastScanResult({
        success: true,
        message: response.data.message,
        pendaftaran: response.data.pendaftaran,
        absensi: response.data.absensi
      });
      
      toast.success(response.data.message);
      stopScanning();
    } catch (error) {
      console.error('Error scanning QR code:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Gagal memproses QR Code. Pastikan QR Code yang dipindai adalah QR Code absensi yang benar.';
      setLastScanResult({
        success: false,
        message: errorMessage,
        pendaftaran: error.response?.data?.pendaftaran || null
      });
      
      if (error.response?.status === 409) {
        toast.warning(errorMessage);
      } else if (error.response?.status === 400) {
        toast.error(errorMessage);
      } else if (error.response?.status === 404) {
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setLastScanResult(null);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!selectedKegiatan) {
      toast.error('Please select a kegiatan first');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target.result);
      scanImageForQR(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const scanImageForQR = async (imageData) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const result = await QrScanner.scanImage(imageData);
      if (result) {
        await handleScanResult(result);
      } else {
        toast.error('No QR code found in the image');
        setUploadedImage(null);
      }
    } catch (error) {
      console.error('Error scanning image:', error);
      toast.error('Failed to scan QR code from image');
      setUploadedImage(null);
    } finally {
      setLoading(false);
    }
  };

  const resetImageUpload = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">QR Code Scanner</h1>
        <p className="page-subtitle">Scan QR codes to mark attendance</p>
      </div>

      <div className="content-card">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Scanner</h3>
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Select Kegiatan *</label>
          <select
            value={selectedKegiatan}
            onChange={(e) => setSelectedKegiatan(e.target.value)}
            className="form-control"
            disabled={isScanning || loading}
          >
            <option value="">Choose Kegiatan</option>
            {kegiatan.map((kegiatan) => (
              <option key={kegiatan._id} value={kegiatan._id}>
                {kegiatan.namaKegiatan}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Scan Mode</label>
          <div className="d-flex gap-2">
            <button
              className={`btn ${scanMode === 'camera' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setScanMode('camera');
                resetImageUpload();
                if (isScanning) stopScanning();
              }}
              disabled={loading}
            >
              <FiCamera style={{ marginRight: '8px' }} />
              Camera
            </button>
            <button
              className={`btn ${scanMode === 'image' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => {
                setScanMode('image');
                if (isScanning) stopScanning();
              }}
              disabled={loading}
            >
              <FiImage style={{ marginRight: '8px' }} />
              Upload Image
            </button>
          </div>
        </div>

        {scanMode === 'camera' ? (
          <div className="text-center">
            <button
              className="btn btn-primary btn-lg"
              onClick={startScanning}
              disabled={!selectedKegiatan || loading || isScanning}
            >
              <FiCamera style={{ marginRight: '8px' }} />
              {isScanning ? 'Scanning...' : 'Start Scanning'}
            </button>
            <p className="text-muted mt-3" style={{ fontSize: '14px' }}>
              Make sure to allow camera access when prompted
            </p>
            
            {isScanning && (
              <>
                <div style={{ marginTop: '20px' }}>
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '500px',
                    margin: '0 auto',
                    backgroundColor: '#000',
                    minHeight: '400px'
                  }}>
                    <video
                      ref={videoRef}
                      style={{
                        width: '100%',
                        maxWidth: '500px',
                        height: 'auto',
                        minHeight: '400px',
                        backgroundColor: '#000'
                      }}
                      playsInline
                      muted
                      autoPlay
                      onLoadedMetadata={(e) => {
                        console.log('Video metadata loaded in JSX');
                        console.log('Video dimensions:', e.target.videoWidth, 'x', e.target.videoHeight);
                      }}
                      onPlay={() => console.log('Video playing in JSX')}
                      onError={(e) => console.error('Video error:', e)}
                    />
                  
                    {/* QR Code scanning box with corner markers */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '250px',
                      height: '250px',
                      border: '2px solid rgba(255, 255, 255, 0.5)',
                      backgroundColor: 'transparent',
                      borderRadius: '12px',
                      pointerEvents: 'none'
                    }}>
                      {/* Top-left corner */}
                      <div style={{
                        position: 'absolute',
                        top: '-2px',
                        left: '-2px',
                        width: '40px',
                        height: '40px',
                        borderTop: '4px solid #fff',
                        borderLeft: '4px solid #fff',
                        borderRadius: '8px 0 0 0'
                      }} />
                      
                      {/* Top-right corner */}
                      <div style={{
                        position: 'absolute',
                        top: '-2px',
                        right: '-2px',
                        width: '40px',
                        height: '40px',
                        borderTop: '4px solid #fff',
                        borderRight: '4px solid #fff',
                        borderRadius: '0 8px 0 0'
                      }} />
                      
                      {/* Bottom-left corner */}
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: '-2px',
                        width: '40px',
                        height: '40px',
                        borderBottom: '4px solid #fff',
                        borderLeft: '4px solid #fff',
                        borderRadius: '0 0 0 8px'
                      }} />
                      
                      {/* Bottom-right corner */}
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '40px',
                        height: '40px',
                        borderBottom: '4px solid #fff',
                        borderRight: '4px solid #fff',
                        borderRadius: '0 0 8px 0'
                      }} />
                    </div>

                    {/* Instruction text at the bottom */}
                    <div style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      color: '#fff',
                      fontSize: '16px',
                      fontWeight: '500',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      pointerEvents: 'none'
                    }}>
                      Scan QR code
                    </div>
                  </div>
                </div>
                
                <button
                  className="btn btn-danger mt-3"
                  onClick={stopScanning}
                  style={{ padding: '12px 24px', fontSize: '16px' }}
                >
                  <FiX style={{ marginRight: '8px' }} />
                  Stop Scanning
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div className="form-group">
              <label className="form-label">Upload QR Code Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="form-control"
                disabled={loading}
                style={{ marginBottom: '15px' }}
              />
              <small className="text-muted">
                Supported formats: JPG, PNG, GIF, WebP
              </small>
            </div>
            
            {uploadedImage && (
              <div className="mt-3">
                <img
                  src={uploadedImage}
                  alt="Uploaded QR Code"
                  style={{
                    maxWidth: '300px',
                    maxHeight: '300px',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '15px'
                  }}
                />
                <div>
                  <button
                    className="btn btn-secondary"
                    onClick={resetImageUpload}
                    disabled={loading}
                  >
                    <FiX style={{ marginRight: '8px' }} />
                    Remove Image
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {lastScanResult && (
          <div className="mt-4">
            <div className={`alert ${lastScanResult.success ? 'alert-success' : 'alert-danger'}`}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h5>
                    {lastScanResult.success ? (
                      <FiCheck style={{ marginRight: '8px', color: '#28a745' }} />
                    ) : (
                      <FiX style={{ marginRight: '8px', color: '#dc3545' }} />
                    )}
                    {lastScanResult.success ? 'Success' : 'Error'}
                  </h5>
                  <p className="mb-2">{lastScanResult.message}</p>
                  
                  {lastScanResult.pendaftaran && (
                    <div style={{ fontSize: '14px', marginTop: '10px' }}>
                      <p><strong>Name:</strong> {lastScanResult.pendaftaran.namaLengkap}</p>
                      <p><strong>Email:</strong> {lastScanResult.pendaftaran.email}</p>
                      <p><strong>Activity:</strong> {lastScanResult.pendaftaran.namaKegiatan}</p>
                      <p><strong>Type:</strong> {lastScanResult.pendaftaran.tipePerson}</p>
                    </div>
                  )}
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={clearResult}
                >
                  <FiX />
                </button>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center mt-3">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Processing...</span>
            </div>
            <p className="mt-2">Processing QR code...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScan;
