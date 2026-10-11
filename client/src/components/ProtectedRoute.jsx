import React, { useEffect } from 'react';

const ProtectedRoute = ({ children, user, loading, onUnauthorized }) => {
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!loading && !isAdmin) {
      onUnauthorized();
    }
  }, [isAdmin, loading, onUnauthorized]);

  if (loading || !isAdmin) return null;

  return children;
};

export default ProtectedRoute;
