import { useState, useCallback } from 'react';

export default function useApi(serviceMethod) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true);
        setError(null);
        const response = await serviceMethod(...args);
        const result = response.data;
        setData(result);
        return result;
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Something went wrong';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [serviceMethod]
  );

  return { data, loading, error, execute };
}
