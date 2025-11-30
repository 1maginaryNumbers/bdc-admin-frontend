import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiClock, FiUser, FiActivity, FiDatabase, FiTrash2, FiDownload, FiGlobe } from 'react-icons/fi';
import { useRefresh } from '../contexts/RefreshContext';

const ActivityLog = () => {
  const { refreshTrigger } = useRefresh();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    logsPerPage: 40,
    hasNextPage: false,
    hasPrevPage: false
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 40
      });

      const response = await axios.get(`https://finalbackend-ochre.vercel.app/api/activitylog?${params}`);
      const data = response.data;
      
      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalLogs: data.logs.length,
          logsPerPage: 40,
          hasNextPage: false,
          hasPrevPage: false
        });
      } else {
        setLogs([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalLogs: 0,
          logsPerPage: 40,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      toast.error('Failed to fetch activity logs');
      setLogs([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalLogs: 0,
        logsPerPage: 40,
        hasNextPage: false,
        hasPrevPage: false
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, refreshTrigger]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };


  const handleExport = async (format) => {
    try {
      const params = new URLSearchParams({
        format: format
      });

      const response = await axios.get(`https://finalbackend-ochre.vercel.app/api/activitylog/export?${params}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity_logs_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Activity logs exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export activity logs');
    }
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    return (
      <div className="d-flex align-items-center mt-3" style={{ justifyContent: 'flex-start' }}>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            style={{
              padding: '6px 12px',
              minWidth: '70px',
              textAlign: 'center'
            }}
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const startPage = Math.max(1, pagination.currentPage - 2);
            const pageNum = startPage + i;
            if (pageNum > pagination.totalPages) return null;
            
            return (
              <button
                key={pageNum}
                className={`btn btn-sm ${pageNum === pagination.currentPage ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => handlePageChange(pageNum)}
                style={{
                  padding: '6px 12px',
                  minWidth: '40px',
                  width: '40px',
                  textAlign: 'center'
                }}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            style={{
              padding: '6px 12px',
              minWidth: '70px',
              textAlign: 'center'
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'CREATE':
        return <FiActivity style={{ color: '#27ae60' }} />;
      case 'UPDATE':
        return <FiActivity style={{ color: '#f39c12' }} />;
      case 'DELETE':
        return <FiTrash2 style={{ color: '#e74c3c' }} />;
      case 'LOGIN':
        return <FiUser style={{ color: '#3498db' }} />;
      case 'LOGOUT':
        return <FiUser style={{ color: '#95a5a6' }} />;
      default:
        return <FiActivity style={{ color: '#34495e' }} />;
    }
  };

  const getActionBadge = (actionType) => {
    const badges = {
      'CREATE': { text: 'Created', class: 'btn-success' },
      'UPDATE': { text: 'Updated', class: 'btn-warning' },
      'DELETE': { text: 'Deleted', class: 'btn-danger' },
      'LOGIN': { text: 'Login', class: 'btn-info' },
      'LOGOUT': { text: 'Logout', class: 'btn-secondary' },
      'VIEW': { text: 'Viewed', class: 'btn-outline-primary' },
      'EXPORT': { text: 'Exported', class: 'btn-outline-success' },
      'IMPORT': { text: 'Imported', class: 'btn-outline-info' }
    };
    
    const badge = badges[actionType] || { text: actionType, class: 'btn-secondary' };
    return <span className={`btn btn-sm ${badge.class}`}>{badge.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading activity logs...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Activity Log</h1>
        <p className="page-subtitle">Track all system activities and changes</p>
      </div>

      <div className="content-card">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleExport('csv')}
            >
              <FiDownload /> Export CSV
            </button>
          </div>
          {renderPagination()}
        </div>

        <div className="table-wrapper" style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Description</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiClock style={{ color: '#666', fontSize: '14px' }} />
                      <span style={{ fontSize: '13px' }}>
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiUser style={{ color: '#666', fontSize: '14px' }} />
                      <span style={{ fontWeight: '500' }}>{log.user}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getActionIcon(log.actionType)}
                      {getActionBadge(log.actionType)}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiDatabase style={{ color: '#666', fontSize: '14px' }} />
                      <span>{log.entityType}</span>
                      {log.entityName && (
                        <span style={{ color: '#666', fontSize: '12px' }}>
                          ({log.entityName})
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px', wordWrap: 'break-word' }}>
                    {log.description}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FiGlobe style={{ color: '#666', fontSize: '14px' }} />
                      <span style={{ fontSize: '13px', fontFamily: 'monospace' }}>
                        {log.ipAddress || 'Unknown'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination */}
        {renderPagination()}

        {logs.length === 0 && !loading && (
          <div className="text-center py-4">
            <p style={{ color: '#666' }}>No activity logs found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
