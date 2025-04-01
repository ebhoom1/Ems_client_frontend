import React, { useState, useEffect } from "react";
import { API_URL } from "../../utils/apiConfig";

const LeftQuantity = ({ sku }) => {
  const [left, setLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/left?sku=${sku}`)
      .then((res) => res.json())
      .then((data) => {
        setLeft(data.leftQuantity);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [sku]);

  if (loading) return <span>Loading...</span>;
  if (error) return <span>Error</span>;
  return <span>{left}</span>;
};

export default LeftQuantity;
