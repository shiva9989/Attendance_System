import React, { useState, useEffect } from 'react';
import { supabase } from "./supabase";
import { CheckCircle, XCircle, Clock, UserCircle } from 'lucide-react';

const DutyStatus = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user'));
    setUser(currentUser);
    fetchRequests(currentUser);
  }, []);

  const fetchRequests = async (currentUser) => {
    try {
      let query = supabase
        .from('One_Duty')
        .select('*')
        .order('created_at', { ascending: false });

      // If user is a student, filter by their ID
      if (currentUser?.role === 'student') {
        query = query.eq('Id', currentUser.reg_no);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'pending') return !request.Status;
    if (filter === 'approved') return request.Status;
    return true;
  });

  const getStatusBadge = (status) => {
    if (status) {
      return (
        <span className="flex items-center text-green-600">
          <CheckCircle size={18} className="mr-1" />
          Approved
        </span>
      );
    }
    return (
      <span className="flex items-center text-yellow-600">
        <Clock size={18} className="mr-1" />
        Pending
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            {user?.role === 'admin' ? 'All Duty Requests' : 'My Duty Requests'}
          </h2>
          {user?.role === 'admin' && (
            <p className="text-gray-600 mt-1">
              Viewing all student duty requests
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {filteredRequests.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No duty requests found
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{request.Name}</h3>
                    {getStatusBadge(request.Status)}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <UserCircle size={18} className="mr-2" />
                    Register No: {request.Id}
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-2 rounded">
                    {request.Reason}
                  </p>
                  {request.created_at && (
                    <p className="text-sm text-gray-500">
                      Submitted on: {formatDate(request.created_at)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 bg-blue-50 p-4 rounded-md">
        <h3 className="font-semibold text-blue-800 mb-2">Request Status Guide</h3>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <Clock size={16} className="text-yellow-600 mr-2" />
            <span>Pending: Your request is being reviewed</span>
          </div>
          <div className="flex items-center text-sm">
            <CheckCircle size={16} className="text-green-600 mr-2" />
            <span>Approved: Your request has been approved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DutyStatus;