import React, { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "./supabase";
import * as faceapi from "face-api.js";
import { authService } from '../Services/authServices';

const WebcamComponent = () => {
  // State management
  const videoRef = useRef(null);
  const [status, setStatus] = useState("Starting...");
  const [matchedPerson, setMatchedPerson] = useState("");
  const [labeledDescriptors, setLabeledDescriptors] = useState(null);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Refs for tracking
  const detectionRef = useRef(null);
  const activeSessionsRef = useRef({});
  const faceMatcherRef = useRef(null);
  const lastMatchTimeRef = useRef(null);
  const isDetectingRef = useRef(false);
  const sessionStartTimeRef = useRef(null);

  // Constants
  const CONFIDENCE_THRESHOLD = 0.4;
  const MODEL_URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights";

  // Utility functions
  const formatTime = (date) => date.toTimeString().split(" ")[0];

  const getTimeDifferenceInMinutes = (startTime, endTime) => {
    return Math.round((endTime - startTime) / (1000 * 60));
  };

  // Check if attendance date is new
  const isNewAttendanceDate = async (regNo, date) => {
    try {
      const { data, error } = await supabase
        .from("daily_attendance")
        .select("date")
        .eq("reg_no", regNo)
        .order("date", { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      // If no previous records or the last record has a different date
      return !data || data.length === 0 || data[0].date !== date;
    } catch (err) {
      console.error("Error checking attendance date:", err);
      return false;
    }
  };

  // Update presence count in project table
  const updatePresenceCount = async (regNo) => {
    try {
      // First, get the current presence count
      const { data, error: fetchError } = await supabase
        .from("project")
        .select("present")
        .eq("reg_no", regNo)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Update the presence count by incrementing it
      const { error: updateError } = await supabase
        .from("project")
        .update({ present: (data.present || 0) + 1 })
        .eq("reg_no", regNo);
      
      if (updateError) throw updateError;
      
      console.log("Updated presence count for:", regNo);
    } catch (err) {
      console.error("Error updating presence count:", err);
    }
  };

  // Session management
  const recordSession = async (regNo, startTime, endTime) => {
    if (!startTime || !endTime) return false;

    const today = endTime.toISOString().split("T")[0];
    const attendanceRecord = {
      reg_no: regNo,
      date: today,
      time_started: formatTime(startTime),
      time_ended: formatTime(endTime),
      total_time: getTimeDifferenceInMinutes(startTime, endTime)
    };

    try {
      // Check if this is a new date for attendance
      const isNewDate = await isNewAttendanceDate(regNo, today);
      
      // Insert the attendance record
      const { error: attendanceError } = await supabase
        .from("daily_attendance")
        .insert([attendanceRecord]);

      if (attendanceError) throw attendanceError;
      
      console.log("Session recorded:", attendanceRecord);
      
      // If it's a new date, update the project table (increment present count)
      if (isNewDate) {
        await updatePresenceCount(regNo);
      }
      
      return true;
    } catch (err) {
      console.error("Error recording session:", err);
      setError("Failed to record session");
      return false;
    }
  };
  
  const forceCompleteActiveSessions = useCallback(async () => {
    if (!sessionStartTimeRef.current || !currentUser) return;

    const now = new Date();
    await recordSession(currentUser.reg_no, sessionStartTimeRef.current, now);
    sessionStartTimeRef.current = null;
    activeSessionsRef.current = {};
  }, [currentUser]);

  const trackFaceDetection = useCallback((regNo) => {
    const now = new Date();
    lastMatchTimeRef.current = now;
    
    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = now;
    }
  }, []);

  // Face detection setup
  const loadModels = async () => {
    setStatus("Loading face detection models...");
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
    } catch (err) {
      throw new Error(`Failed to load models: ${err.message}`);
    }
  };

  const setupWebcam = async () => {
    setStatus("Initializing webcam...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
          frameRate: { ideal: 30 }
        },
      });
      
      if (!videoRef.current) throw new Error("Video element not found");
      
      videoRef.current.srcObject = stream;
      return new Promise((resolve) => {
        videoRef.current.onloadedmetadata = () => resolve(true);
      });
    } catch (err) {
      throw new Error(`Webcam access failed: ${err.message}`);
    }
  };

  const processFaceDescriptors = async (files) => {
    const descriptors = [];
    const userFile = files.find(file => file.name.startsWith(currentUser.reg_no));
    
    if (userFile) {
      try {
        const { data } = supabase.storage.from("project").getPublicUrl(userFile.name);
        const img = await faceapi.fetchImage(data.publicUrl);
        const detection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          descriptors.push(new faceapi.LabeledFaceDescriptors(userFile.name, [detection.descriptor]));
        }
      } catch (err) {
        console.error(`Error processing ${userFile.name}:`, err);
      }
    }

    if (descriptors.length === 0) {
      throw new Error("No valid face descriptor could be created for current user");
    }

    return descriptors;
  };

  const detectFaces = useCallback(async () => {
    if (!videoRef.current || 
        videoRef.current.readyState !== 4 || 
        !faceMatcherRef.current || 
        document.hidden) {
      isDetectingRef.current = false;
      return;
    }

    isDetectingRef.current = true;

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length > 0) {
        const bestMatch = detections
          .map(detection => faceMatcherRef.current.findBestMatch(detection.descriptor))
          .reduce((prev, current) => 
            current.distance < prev.distance ? current : prev
          );

        if (bestMatch.label !== "unknown" && 
            bestMatch.label.startsWith(currentUser.reg_no)) {
          const confidence = (1 - bestMatch.distance).toFixed(2);
          setMatchedPerson(
            `Match found: ${bestMatch.label.split(".")[0]} (${confidence} confidence)`
          );

          if (parseFloat(confidence) > CONFIDENCE_THRESHOLD) {
            trackFaceDetection(currentUser.reg_no);
          }
        } else {
          setMatchedPerson("");
        }
      } else {
        setMatchedPerson("");
      }
    } catch (err) {
      console.error("Face detection error:", err);
      isDetectingRef.current = false;
      return;
    }

    if (!document.hidden) {
      detectionRef.current = requestAnimationFrame(detectFaces);
    } else {
      isDetectingRef.current = false;
    }
  }, [trackFaceDetection, currentUser]);

  // Effect hooks
  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      event.preventDefault();
      await forceCompleteActiveSessions();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [forceCompleteActiveSessions]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (detectionRef.current) {
          cancelAnimationFrame(detectionRef.current);
          detectionRef.current = null;
        }
        isDetectingRef.current = false;
      } else {
        if (labeledDescriptors?.length && !isDetectingRef.current) {
          detectFaces();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [labeledDescriptors, detectFaces]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (!user || user.role !== 'student') {
          throw new Error("Unauthorized access");
        }
        setCurrentUser(user);
      } catch (err) {
        setError(err.message);
      }
    };
    
    initializeAuth();
  }, []);

  useEffect(() => {
    let isInitialized = false;

    const initialize = async () => {
      try {
        await Promise.all([
          setupWebcam(),
          loadModels()
        ]);

        const { data: files, error: listError } = await supabase.storage
          .from("project")
          .list("");

        if (listError) throw listError;

        const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file.name));
        if (imageFiles.length === 0) throw new Error("No image files found");

        const descriptors = await processFaceDescriptors(imageFiles);
        
        if (!isInitialized) {
          setLabeledDescriptors(descriptors);
          faceMatcherRef.current = new faceapi.FaceMatcher(descriptors, 0.6);
          setStatus("Ready for face detection");
          setError(null);
        }
      } catch (err) {
        if (!isInitialized) {
          setError(err.message);
          setStatus(`Error: ${err.message}`);
          console.error("Initialization failed:", err);
        }
      }
    };

    if (currentUser) {
      initialize();
    }

    return async () => {
      isInitialized = true;
      
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      
      if (detectionRef.current) {
        cancelAnimationFrame(detectionRef.current);
      }

      await forceCompleteActiveSessions();
    };
  }, [currentUser, forceCompleteActiveSessions]);

  useEffect(() => {
    if (!labeledDescriptors?.length) return;
    
    if (!isDetectingRef.current) {
      detectFaces();
    }

    return () => {
      if (detectionRef.current) {
        cancelAnimationFrame(detectionRef.current);
      }
    };
  }, [labeledDescriptors, detectFaces]);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="flex flex-col items-center gap-4 p-4">
        {currentUser ? (
          <>
            <div className="mb-4 text-gray-600">
              Student: {currentUser.name} ({currentUser.reg_no})
            </div>
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-[640px] h-auto border rounded-lg shadow-lg"
              style={{ transform: "scaleX(-1)" }}
            />

            <div className="text-sm text-gray-600">
              Status: {status}
            </div>

            {error && (
              <div className="w-full p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
                <p className="font-medium">
                  Error: {error}
                </p>
              </div>
            )}

            {matchedPerson && (
              <div className="w-full p-4 mb-4 text-green-700 bg-green-50 rounded-lg">
                <p className="text-xl font-bold">
                  {matchedPerson}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="w-full p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
            <p className="font-medium">
              Please log in to access this feature
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebcamComponent;