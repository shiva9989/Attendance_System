import React, { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { authService } from "../Services/authServices";

const AttendancePage = () => {
  const [data, setData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [regNo, setRegNo] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (user && user.role === 'student') {
      setRegNo(user.reg_no.toString());
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [projectData, timeData] = await Promise.all([
          supabase.from("project").select("*"),
          supabase.from("daily_attendance").select("*")
        ]);

        if (projectData.error) throw new Error(projectData.error.message);
        if (timeData.error) throw new Error(timeData.error.message);

        setData(projectData.data);
        setTimeData(timeData.data);

        if (currentUser?.role === 'student' && currentUser.reg_no) {
          const student = projectData.data.find(
            (s) => s.reg_no === parseInt(currentUser.reg_no, 10)
          );
          setSelectedStudent(student || null);
        }
      } catch (err) {
        setError("Failed to fetch attendance data. Please try again later.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const handleSearch = () => {
    setError("");
    
    if (currentUser?.role === 'student' && parseInt(regNo, 10) !== currentUser.reg_no) {
      setError("You can only view your own attendance records");
      return;
    }

    const regNoNumber = parseInt(regNo, 10);
    if (isNaN(regNoNumber)) {
      setError("Please enter a valid registration number");
      return;
    }

    const student = data.find((student) => student.reg_no === regNoNumber);
    setSelectedStudent(student || null);
    
    if (!student) {
      setError("No student found with this registration number");
    }
  };

  const getStudentTimeDetails = () => {
    if (!selectedStudent) return null;
    return timeData.filter(
      record => 
        record.reg_no === selectedStudent.reg_no.toString() && 
        record.date === selectedDate
    );
  };

  const calculateTotalTime = (timeDetails) => {
    if (!timeDetails || timeDetails.length === 0) return 0;
    
    return timeDetails.reduce((total, record) => {
      if (record.total_time) return total + record.total_time;
      
      if (record.time_started && record.time_ended) {
        const start = new Date(`1970-01-01T${record.time_started}`);
        const end = new Date(`1970-01-01T${record.time_ended}`);
        const diffMinutes = Math.round((end - start) / (1000 * 60));
        return total + diffMinutes;
      }
      return total;
    }, 0);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Helper function to calculate total minutes between two time strings
  const calculateTotalMinutes = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    return Math.round((end - start) / (1000 * 60));
  };

  // Function to record attendance and increment the present count if it's a new date
  const recordAttendance = async (regNo, date, timeStarted, timeEnded) => {
    setLoading(true);
    setError("");
    
    try {
      // Check if this is a new date for this student
      const { data: existingRecords, error: checkError } = await supabase
        .from("daily_attendance")
        .select("*")
        .eq("reg_no", regNo.toString())
        .eq("date", date);
      
      if (checkError) throw new Error(checkError.message);
      
      const isNewDate = existingRecords.length === 0;
      
      // Insert the new attendance record
      const { error: insertError } = await supabase
        .from("daily_attendance")
        .insert({
          reg_no: regNo.toString(),
          date,
          time_started: timeStarted,
          time_ended: timeEnded,
          total_time: calculateTotalMinutes(timeStarted, timeEnded)
        });
      
      if (insertError) throw new Error(insertError.message);
      
      // If this is a new date, increment the present count in project table
      if (isNewDate) {
        // Get the current present value
        const { data: projectData, error: fetchError } = await supabase
          .from("project")
          .select("present")
          .eq("reg_no", parseInt(regNo, 10))
          .single();
        
        if (fetchError) throw new Error(fetchError.message);
        
        // Increment the present value
        const { error: updateError } = await supabase
          .from("project")
          .update({ present: (projectData.present || 0) + 1 })
          .eq("reg_no", parseInt(regNo, 10));
        
        if (updateError) throw new Error(updateError.message);
        
        // Update the local state
        setData(prevData => 
          prevData.map(student => 
            student.reg_no === parseInt(regNo, 10) 
              ? { ...student, present: (student.present || 0) + 1 } 
              : student
          )
        );
      }
      
      // Refresh time data
      const { data: refreshedTimeData, error: refreshError } = await supabase
        .from("daily_attendance")
        .select("*");
      
      if (refreshError) throw new Error(refreshError.message);
      setTimeData(refreshedTimeData);
      
      // Show success message
      setError("");
      alert("Attendance recorded successfully!");
      
    } catch (err) {
      setError("Failed to record attendance: " + err.message);
      console.error("Error recording attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Please log in to view attendance records.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Student Attendance & Time Tracking
        {currentUser.role === 'admin' && 
          <span className="text-sm text-blue-600 ml-2">(Admin Access)</span>
        }
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {currentUser.role === 'admin' ? 'Search Student' : 'Your Attendance'}
              </h2>
              {currentUser.role === 'student' && (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            </div>
            
            <input
              type="number"
              placeholder="Enter Registration Number"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              disabled={currentUser.role === 'student'}
              className="w-full px-4 py-2 border rounded-md mb-4 disabled:bg-gray-100"
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-md mb-4"
            />
            {currentUser.role === 'admin' && (
              <button 
                onClick={handleSearch}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : selectedStudent ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-medium text-gray-900">
                    {selectedStudent.name_student}
                  </h3>
                  <p className="text-gray-600">Reg No: {selectedStudent.reg_no}</p>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">{selectedDate}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Overall Attendance</h4>
                  <div className="relative w-48 h-48 mx-auto">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedStudent.present || 0}
                        <span className="text-sm font-normal ml-1">days</span>
                      </div>
                    </div>
                    <svg className="transform -rotate 90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="3"
                      />
                      <path
                        d="M18 2.0845
                          a 15.9155 15.9155 0 0 1 0 31.831
                          a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="3"
                        strokeDasharray={`${selectedStudent.present || 0}, 100`}
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Daily Time Details</h4>
                  {getStudentTimeDetails()?.length > 0 ? (
                    <div className="space-y-4">
                      {getStudentTimeDetails().map((record, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Start Time:</span>
                            <span className="font-medium">{record.time_started}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">End Time:</span>
                            <span className="font-medium">{record.time_ended}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Time:</span>
                            <span className="font-medium">{formatTime(record.total_time)}</span>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex justify-between">
                          <span className="font-medium text-blue-800">Total Daily Time:</span>
                          <span className="font-medium text-blue-800">
                            {formatTime(calculateTotalTime(getStudentTimeDetails()))}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-600">
                      No time records found for this date
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : regNo && (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600">No student found. Try again.</p>
            </div>
          )}
        </div>
      </div>

      {/* New section for recording attendance (admin only) */}
      {currentUser?.role === 'admin' && selectedStudent && (
        <div className="w-full mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Record Attendance</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="time"
              placeholder="Start Time"
              id="timeStarted"
              className="w-full px-4 py-2 border rounded-md"
            />
            <input
              type="time"
              placeholder="End Time"
              id="timeEnded"
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          
          <button 
            onClick={() => {
              const startTime = document.getElementById('timeStarted').value;
              const endTime = document.getElementById('timeEnded').value;
              
              if (!startTime || !endTime) {
                setError("Please enter both start and end times");
                return;
              }
              
              recordAttendance(
                selectedStudent.reg_no,
                selectedDate,
                startTime,
                endTime
              );
            }}
            disabled={loading}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Record Attendance
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;