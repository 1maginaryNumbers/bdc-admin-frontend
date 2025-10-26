import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiCamera, FiCheck, FiX, FiUpload, FiImage } from 'react-icons/fi';
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

  useEffect(() => {
    fetchKegiatan();
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

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
      // Request camera access with preferred settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        qrScannerRef.current = new QrScanner(
          videoRef.current,
          (result) => handleScanResult(result.data),
          {
            highlightScanRegion: true,
            highlightCodeOutline: true,
            maxScansPerSecond: 5,
            returnDetailedScanResult: false
          }
        );
        
        await qrScannerRef.current.start();
        setIsScanning(true);
        setLastScanResult(null);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      if (error.name === 'NotAllowedError') {
        toast.error('Camera access denied. Please enable camera permissions in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found. Please connect a camera device.');
      } else {
        toast.error('Failed to access camera. Please check permissions and try again.');
      }
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  };

  const handleScanResult = async (qrData) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await axios.post('https://finalbackend-ochre.vercel.app/api/absensi/scan', {
        qrCodeData: qrData,
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
      const errorMessage = error.response?.data?.message || 'Failed to process QR code';
      setLastScanResult({
        success: false,
        message: errorMessage,
        pendaftaran: error.response?.data?.pendaftaran || null
      });
      
      if (error.response?.status === 409) {
        toast.warning(errorMessage);
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
          !isScanning ? (
            <div className="text-center">
              <button
                className="btn btn-primary btn-lg"
                onClick={startScanning}
                disabled={!selectedKegiatan || loading}
              >
                <FiCamera style={{ marginRight: '8px' }} />
                Start Scanning
              </button>
              <p className="text-muted mt-3" style={{ fontSize: '14px' }}>
                Make sure to allow camera access when prompted
              </p>
            </div>
          ) : (
          <div className="text-center">
            <div style={{ 
              position: 'relative', 
              maxWidth: '100%',
              width: '100%',
              maxWidth: '400px',
              margin: '0 auto',
              border: '2px solid #007bff',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: 'auto',
                  minHeight: '300px',
                  maxHeight: '600px',
                  objectFit: 'cover'
                }}
                playsInline
              />
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                Scanning...
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
          </div>
          )
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
