import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

const ImageFromDatabase = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      // List all files in the bucket
      const { data: files, error: listError } = await supabase.storage
        .from("project")
        .list();

      if (listError) {
        throw new Error(`Error listing files: ${listError.message}`);
      }

      console.log("Raw data from Supabase:", files);

      // Filter for image files
      const imageFiles =
        files?.filter((file) =>
          file.name.toLowerCase().match(/\.(jpg|jpeg|png)$/)
        ) || [];

      console.log("Filtered image files:", imageFiles);

      if (imageFiles.length === 0) {
        setImages([]);
        return;
      }

      // Generate public URLs
      const imageUrls = imageFiles.map((file) => {
        const { data } = supabase.storage
          .from("project")
          .getPublicUrl(file.name);

        // The publicUrl is now accessed from the data object
        return {
          url: data.publicUrl,
          name: file.name,
        };
      });

      console.log("Generated Image URLs:", imageUrls);

      setImages(imageUrls);
    } catch (err) {
      console.error("Error fetching images:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-2xl font-bold mb-4">Student Images</h1>

      {loading && <div className="text-gray-600">Loading images...</div>}

      {error && (
        <div className="text-red-600 bg-red-50 p-2 rounded">Error: {error}</div>
      )}

      {!loading && !error && images.length === 0 && (
        <div className="text-gray-600">No images found in storage.</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map(({ url, name }, index) => (
          <div key={name} className="flex flex-col items-center">
            <img
              src={url}
              alt={`Project Image ${index + 1}`}
              className="w-48 h-48 object-cover rounded-lg shadow-md"
            />
            <span className="mt-2 text-sm text-gray-600">{name.split(".")[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageFromDatabase;
