import React, { useState, useEffect } from 'react';
import { supabase } from "./supabase";
import { Check, X } from 'lucide-react';

const DutyApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch pending requests
  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('One_Duty')
        .select('id, Id, Name, Reason, Status')
        .eq('Status', false)
        .order('Id', { ascending: false });

      if (error) throw error;
      
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle approval
  const handleApprove = async (Id) => {
    try {
      const { error } = await supabase
        .from('One_Duty')
        .update({ Status: true })
        .eq('Id', Id);

      if (error) throw error;
      
      // Refresh the list
      fetchRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle rejection
  const handleReject = async (id) => {
    console.log(id);
    try {
      const { error } = await supabase
        .from('One_Duty')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh the list
      fetchRequests();
    } catch (err) {
      setError(err.message);
    }
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
      <h2 className="text-2xl font-bold mb-6">Pending Duty Requests</h2>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No pending requests to approve
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div 
              key={request.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{request.Name}</h3>
                  <p className="text-gray-600 mt-1">Register No: {request.Id}</p>
                  <p className="text-gray-700 mt-2">{request.Reason}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request.Id)}
                    className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors"
                    title="Approve"
                  >
                  <span className="flex items-center gap-1">
      Accept <Check size={20} />
    </span>
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                    title="Reject"
                  >
                   <span className="flex items-center gap-1">
      Reject <X size={20} />
    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DutyApproval;