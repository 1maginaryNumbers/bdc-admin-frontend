import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiSend, FiMail, FiUsers, FiCheck } from 'react-icons/fi';
import useEscapeKey from '../hooks/useEscapeKey';
import useOutsideClick from '../hooks/useOutsideClick';

const BroadcastEmail = () => {
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

  useEffect(() => {
    fetchRecipients();
  }, []);

  useEscapeKey(() => {
    if (showTestModal) {
      setShowTestModal(false);
      setTestEmail('');
    }
  });

  const modalRef = useOutsideClick(() => {
    if (showTestModal) {
      setShowTestModal(false);
      setTestEmail('');
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
      
      if (response.data.successful > 0) {
        const message = response.data.failed > 0
          ? `Email sent to ${response.data.successful} recipient(s), ${response.data.failed} failed`
          : `Email sent successfully to ${response.data.successful} recipient(s)!`;
        toast.success(message);
        
        if (response.data.failed > 0 && response.data.failedEmails) {
          console.warn('Failed emails:', response.data.failedEmails);
        }
      } else {
        toast.error('All emails failed to send. Please check server logs and email configuration.');
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
      console.error('Email send error:', error.response?.data);
      toast.error(errorMessage + (errorDetails ? `: ${errorDetails}` : ''));
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
      console.error('Test email error:', error.response?.data);
      toast.error(errorMessage + (errorDetails ? `: ${errorDetails}` : ''));
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
              className="btn btn-info"
              onClick={() => setShowTestModal(true)}
              style={{ backgroundColor: '#17a2b8', borderColor: '#17a2b8' }}
            >
              <FiMail style={{ marginRight: '8px' }} />
              Test Email
            </button>
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

      {showTestModal && (
        <div className="modal">
          <div className="modal-content" style={{ maxWidth: '500px' }} ref={modalRef}>
            <div className="modal-header">
              <h3 className="modal-title">Test Email Configuration</h3>
              <button className="close-btn" onClick={() => {
                setShowTestModal(false);
                setTestEmail('');
              }}>×</button>
            </div>

            <div style={{ padding: '20px' }}>
              <div className="form-group">
                <label className="form-label">Test Email Address *</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="form-control"
                  placeholder="Enter your email address to test"
                  required
                />
                <small style={{ color: '#6c757d', marginTop: '8px', display: 'block' }}>
                  A test email will be sent to verify your email configuration is working correctly.
                </small>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowTestModal(false);
                    setTestEmail('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-info"
                  onClick={handleTestEmail}
                  disabled={testing}
                  style={{ backgroundColor: '#17a2b8', borderColor: '#17a2b8' }}
                >
                  {testing ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastEmail;

