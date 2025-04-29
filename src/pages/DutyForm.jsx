import React, { useState, useEffect } from 'react';
import { supabase } from "./supabase";
import { authService } from '../Services/authServices';

const DutyForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    reason: ''
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [studentName, setStudentName] = useState('');

  useEffect(() => {
    // Get current user
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      
      // Fetch student name from database based on register number
      fetchStudentName(user.reg_no);
    }
  }, []);

  const fetchStudentName = async (regNo) => {
    try {
      const { data, error } = await supabase
        .from('project') // Replace with your actual table name
        .select('student_name')
        .eq('reg_no', regNo)
        .single();

      if (error) throw error;
      
      if (data) {
        setStudentName(data.student_name);
        // Pre-fill the form with the fetched student name
        setFormData(prev => ({
          ...prev,
          name: data.student_name
        }));
      }
    } catch (err) {
      console.error('Error fetching student name:', err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Please log in to submit a duty form');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error: supabaseError } = await supabase
        .from('One_Duty')
        .insert([
          {
            Id: currentUser.reg_no, // Use register number from logged-in user
            Name: studentName || formData.name, // Use the fetched student name or form input as fallback
            Reason: formData.reason,
            Status: false
          }
        ]);

      if (supabaseError) throw supabaseError;

      setSuccess(true);
      setFormData(prev => ({
        ...prev,
        reason: ''
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md">
          Please log in to submit a duty form.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Submit Duty Form</h2>
        <p className="text-gray-600 mt-1">Register No: {currentUser.reg_no}</p>
        {studentName && <p className="text-gray-600">Student Name: {studentName}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label 
            htmlFor="name" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!!studentName} // Disable if student name was found
          />
        </div>

        <div>
          <label 
            htmlFor="reason" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Reason
          </label>
          <textarea
            id="reason"
            name="reason"
            required
            value={formData.reason}
            onChange={handleChange}
            placeholder="Enter reason for duty leave"
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
            Your duty form has been submitted successfully!
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors
            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </button>
      </form>
    </div>
  );
};

export default DutyForm;