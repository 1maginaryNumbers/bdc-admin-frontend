import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiSend, FiMail, FiUsers, FiCheck } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';
import { useRefresh } from '../contexts/RefreshContext';

const BroadcastEmail = () => {
  const { refreshTrigger } = useRefresh();
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    recipientType: 'all',
    selectedRecipients: []
  });
  const [showPreview, setShowPreview] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  useEffect(() => {
    fetchRecipients();
  }, [refreshTrigger]);

  useEscapeKey(() => {
    if (showTestModal) {
      setShowTestModal(false);
      setTestEmail('');
    }
    if (showResultModal) {
      setShowResultModal(false);
      setBroadcastResult(null);
    }
  });

  const modalRef = useOutsideClick(() => {
    if (showTestModal) {
      setShowTestModal(false);
      setTestEmail('');
    }
    if (showResultModal) {
      setShowResultModal(false);
      setBroadcastResult(null);
    }
  });

  const resultModalRef = useOutsideClick(() => {
    if (showResultModal) {
      setShowResultModal(false);
      setBroadcastResult(null);
    }
  });

  const fetchRecipients = async () => {
    try {
      const response = await axios.get('https://finalbackend-ochre.vercel.app/api/umat/broadcast/recipients');
      setRecipients(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch recipients');
      setRecipients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      selectedRecipients: name === 'recipientType' && value !== 'selected' ? [] : formData.selectedRecipients
    });
  };

  const handleRecipientToggle = (recipientId) => {
    const selected = formData.selectedRecipients;
    if (selected.includes(recipientId)) {
      setFormData({
        ...formData,
        selectedRecipients: selected.filter(id => id !== recipientId)
      });
    } else {
      setFormData({
        ...formData,
        selectedRecipients: [...selected, recipientId]
      });
    }
  };

  const handleSelectAll = () => {
    if (formData.selectedRecipients.length === recipients.length) {
      setFormData({
        ...formData,
        selectedRecipients: []
      });
    } else {
      setFormData({
        ...formData,
        selectedRecipients: recipients.map(r => r._id)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      toast.error('Subject and message are required');
      return;
    }

    if (formData.recipientType === 'selected' && formData.selectedRecipients.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    setSending(true);
    try {
      const payload = {
        subject: formData.subject,
        message: formData.message,
        recipients: formData.recipientType === 'selected' ? formData.selectedRecipients : []
      };

      const response = await axios.post('https://finalbackend-ochre.vercel.app/api/umat/broadcast', payload);
      
      setBroadcastResult(response.data);
      
      if (response.data.successful > 0) {
        const message = response.data.failed > 0
          ? `Email sent to ${response.data.successful} recipient(s), ${response.data.failed} failed`
          : `Email sent successfully to ${response.data.successful} recipient(s)!`;
        toast.success(message);
        
        if (response.data.failed > 0 && response.data.failedEmails) {
          setShowResultModal(true);
        }
      } else {
        toast.error('All emails failed to send. Please check server logs and email configuration.');
        if (response.data.failedEmails && response.data.failedEmails.length > 0) {
          setShowResultModal(true);
        }
      }
      
      setFormData({
        subject: '',
        message: '',
        recipientType: 'all',
        selectedRecipients: []
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send email';
      const errorDetails = error.response?.data?.error;
      const errorCode = error.response?.data?.code;
      console.error('Email send error:', error.response?.data);
      
      let displayMessage = errorMessage;
      if (errorCode === 'EAUTH') {
        displayMessage += ' Check your email username and password in .env file.';
      } else if (errorCode === 'ECONNECTION' || errorCode === 'ETIMEDOUT') {
        displayMessage += ' Check your email host and port settings.';
      }
      
      toast.error(displayMessage, { autoClose: 6000 });
    } finally {
      setSending(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail || !testEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setTesting(true);
    try {
      const response = await axios.post('https://finalbackend-ochre.vercel.app/api/umat/broadcast/test', {
        testEmail
      });
      
      toast.success(`Test email sent successfully to ${testEmail}! Please check your inbox.`);
      setTestEmail('');
      setShowTestModal(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send test email';
      const errorDetails = error.response?.data?.error;
      const errorCode = error.response?.data?.code;
      console.error('Test email error:', error.response?.data);
      
      let displayMessage = errorMessage;
      if (errorCode === 'EAUTH') {
        displayMessage += ' Check your email username and password in .env file.';
      } else if (errorCode === 'ECONNECTION' || errorCode === 'ETIMEDOUT') {
        displayMessage += ' Check your email host and port settings.';
      }
      
      toast.error(displayMessage, { autoClose: 6000 });
    } finally {
      setTesting(false);
    }
  };

  const getRecipientCount = () => {
    if (formData.recipientType === 'all') {
      return recipients.length;
    } else if (formData.recipientType === 'selected') {
      return formData.selectedRecipients.length;
    }
    return 0;
  };

  if (loading) {
    return <div className="loading">Loading recipients...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Broadcast Email</h1>
        <p className="page-subtitle">Send announcements and messages via email</p>
      </div>

      <div className="content-card">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          borderLeft: '4px solid #3498db'
        }}>
          <FiMail style={{ fontSize: '24px', color: '#3498db' }} />
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#212529' }}>
              Total Recipients Available
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6c757d' }}>
              {recipients.length} member(s) with email addresses
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Recipient Type *</label>
            <select
              name="recipientType"
              value={formData.recipientType}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="all">All Members ({recipients.length})</option>
              <option value="selected">Selected Members</option>
            </select>
          </div>

          {formData.recipientType === 'selected' && (
            <div className="form-group">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <label className="form-label">Select Recipients *</label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {formData.selectedRecipients.length === recipients.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '8px'
              }}>
                {recipients.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6c757d', padding: '20px' }}>
                    No recipients available
                  </p>
                ) : (
                  recipients.map((recipient) => (
                    <div
                      key={recipient._id}
                      onClick={() => handleRecipientToggle(recipient._id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        backgroundColor: formData.selectedRecipients.includes(recipient._id) ? '#e3f2fd' : 'transparent',
                        marginBottom: '4px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!formData.selectedRecipients.includes(recipient._id)) {
                          e.currentTarget.style.backgroundColor = '#f8f9fa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!formData.selectedRecipients.includes(recipient._id)) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid #3498db',
                        borderRadius: '4px',
                        marginRight: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: formData.selectedRecipients.includes(recipient._id) ? '#3498db' : 'transparent',
                        flexShrink: 0
                      }}>
                        {formData.selectedRecipients.includes(recipient._id) && (
                          <FiCheck style={{ color: 'white', fontSize: '14px' }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', color: '#212529' }}>
                          {recipient.nama}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          {recipient.email}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {formData.selectedRecipients.length > 0 && (
                <p style={{ marginTop: '8px', fontSize: '12px', color: '#6c757d' }}>
                  {formData.selectedRecipients.length} recipient(s) selected
                </p>
              )}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="form-control"
              placeholder="Enter email subject"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="form-control"
              rows="12"
              placeholder="Enter your message here..."
              required
            />
          </div>

          <div style={{
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            marginBottom: '20px',
            borderLeft: '4px solid #28a745'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiUsers style={{ color: '#28a745' }} />
              <span style={{ fontWeight: '500', color: '#212529' }}>
                This email will be sent to {getRecipientCount()} recipient(s)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFormData({
                  subject: '',
                  message: '',
                  recipientType: 'all',
                  selectedRecipients: []
                });
              }}
            >
              Clear
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={sending}
            >
              {sending ? (
                <>
                  <span style={{ marginRight: '8px' }}>Sending...</span>
                </>
              ) : (
                <>
                  <FiSend style={{ marginRight: '8px' }} />
                  Send Email
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {showResultModal && broadcastResult && (
        <div className="modal" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content" ref={resultModalRef} style={{ maxWidth: '700px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">Broadcast Email Result</h3>
              <button className="close-btn" onClick={() => {
                setShowResultModal(false);
                setBroadcastResult(null);
              }}>×</button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                  <div style={{ flex: 1, padding: '15px', backgroundColor: '#d4edda', borderRadius: '8px', borderLeft: '4px solid #28a745' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                      {broadcastResult.successful || 0}
                    </div>
                    <div style={{ fontSize: '14px', color: '#155724' }}>Successfully Sent</div>
                  </div>
                  <div style={{ flex: 1, padding: '15px', backgroundColor: '#f8d7da', borderRadius: '8px', borderLeft: '4px solid #dc3545' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                      {broadcastResult.failed || 0}
                    </div>
                    <div style={{ fontSize: '14px', color: '#721c24' }}>Failed</div>
                  </div>
                  <div style={{ flex: 1, padding: '15px', backgroundColor: '#d1ecf1', borderRadius: '8px', borderLeft: '4px solid #17a2b8' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                      {broadcastResult.totalRecipients || 0}
                    </div>
                    <div style={{ fontSize: '14px', color: '#0c5460' }}>Total Recipients</div>
                  </div>
                </div>
              </div>

              {broadcastResult.successfulEmails && broadcastResult.successfulEmails.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#28a745', fontSize: '16px', fontWeight: '600' }}>
                    Successfully Sent ({broadcastResult.successfulEmails.length})
                  </h4>
                  <div style={{ 
                    maxHeight: '150px', 
                    overflowY: 'auto', 
                    border: '1px solid #dee2e6', 
                    borderRadius: '4px', 
                    padding: '10px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    {broadcastResult.successfulEmails.map((email, index) => (
                      <div key={index} style={{ padding: '5px 0', fontSize: '14px', color: '#155724' }}>
                        ✓ {email}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {broadcastResult.failedEmails && broadcastResult.failedEmails.length > 0 && (
                <div>
                  <h4 style={{ marginBottom: '10px', color: '#dc3545', fontSize: '16px', fontWeight: '600' }}>
                    Failed to Send ({broadcastResult.failedEmails.length})
                  </h4>
                  <div style={{ 
                    maxHeight: '250px', 
                    overflowY: 'auto', 
                    border: '1px solid #dc3545', 
                    borderRadius: '4px', 
                    padding: '10px',
                    backgroundColor: '#fff'
                  }}>
                    {broadcastResult.failedEmails.map((item, index) => (
                      <div key={index} style={{ 
                        padding: '10px', 
                        marginBottom: '8px', 
                        backgroundColor: '#f8d7da', 
                        borderRadius: '4px',
                        borderLeft: '3px solid #dc3545'
                      }}>
                        <div style={{ fontWeight: '500', color: '#721c24', marginBottom: '4px' }}>
                          ✗ {item.email}
                        </div>
                        <div style={{ fontSize: '12px', color: '#856404' }}>
                          Error: {item.error || 'Unknown error'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setShowResultModal(false);
                  setBroadcastResult(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BroadcastEmail;

