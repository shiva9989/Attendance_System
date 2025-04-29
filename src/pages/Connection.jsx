import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

const Connection = () => {
  const [dbStatus, setDbStatus] = useState(null);

  useEffect(() => {
    // Try a simple query to check if Supabase is connected
    const checkDbConnection = async () => {
      try {
        const { data, error } = await supabase
          .from("project")
          .select("*")
          .limit(1);

        if (error) {
          throw new Error(error.message);
        }

        setDbStatus("connected"); // Connection is successful
      } catch (error) {
        setDbStatus("failed"); // Failed to connect
        console.error("Error connecting to Supabase:", error.message);
      }
    };

    checkDbConnection();
  }, []);

  return (
    <div>
      {dbStatus === null ? (
        <p>Checking database connection...</p>
      ) : dbStatus === "connected" ? (
        <p style={{ color: "green" }}>Database connected successfully!</p>
      ) : (
        <p style={{ color: "red" }}>Failed to connect to the database.</p>
      )}
    </div>
  );
};

export default Connection;
