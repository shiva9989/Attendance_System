import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

const StudentName = () => {
  const [dbStatus, setDbStatus] = useState(null);
  const [data, setData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkTableAndFetchData = async () => {
      try {
        // Fetch data from the project table
        const { data: projectData, error } = await supabase
          .from("project")
          .select("*");

        if (error) {
          setDbStatus("failed");
          setErrorMessage(`Error fetching data: ${error.message}`);
          return;
        }

        // Ensure unique keys by adding an index
        const dataWithUniqueKeys = projectData.map((item, index) => ({
          ...item,
          uniqueKey: `${item.reg_no}-${index}`
        }));

        setData(dataWithUniqueKeys);
        setDbStatus("connected");
      } catch (error) {
        setDbStatus("failed");
        setErrorMessage(error.message);
        console.error("Error:", error.message);
      }
    };

    checkTableAndFetchData();
  }, []);

  // Function to get badge color based on attendance
  const getBadgeColor = (present) => {
    if (present >= 80) return "bg-green-500 text-white";
    if (present >= 50) return "bg-yellow-500 text-white";
    return "bg-red-500 text-white";
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 shadow-lg rounded-lg overflow-hidden">
      <div className="bg-gray-100 p-4 border-b">
        <h2 className="text-2xl font-bold text-gray-800">
          Student Attendance Details
        </h2>
      </div>

      {dbStatus === null ? (
        <div className="p-4 text-center text-gray-500">
          Checking database connection...
        </div>
      ) : dbStatus === "connected" ? (
        <>
          {data.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No data available in the 'project' table.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Reg No</th>
                    <th className="px-4 py-3 text-left font-bold text-gray-700">Student Name</th>
                    <th className="px-4 py-3 text-right font-bold text-gray-700">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr 
                      key={item.uniqueKey} 
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-700 font-medium">
                        {item.reg_no}
                      </td>
                      <td className="px-4 py-3 text-gray-800">
                        {item.student_name}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span 
                          className={`px-3 py-1 rounded-full text-sm font-semibold 
                            ${getBadgeColor(item.present)}`}
                        >
                          {item.present}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="p-4 text-center">
          <p className="text-red-500 font-semibold mb-2">
            Failed to connect to the database
          </p>
          <p className="text-gray-600">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};

export default StudentName;