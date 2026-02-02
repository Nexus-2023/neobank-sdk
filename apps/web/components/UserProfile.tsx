'use client';

import { isNeobankError } from '@raga-neobank/core';
import { useUser } from '../hooks/use-user';

export function UserProfile() {
  const { data: user, isLoading, error, refetch } = useUser();

  if (isLoading) {
    return <div className="loading">Loading user profile...</div>;
  }

  if (error) {
    let errorMessage = 'Failed to fetch user';
    if (isNeobankError(error)) {
      errorMessage = `Error ${error.code}: ${error.message}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return (
      <div className="error">
        <h3>User Error</h3>
        <p>{errorMessage}</p>
        <button 
          onClick={() => refetch()}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <div className="user-info">
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Address:</strong>{' '}
          <code>{user.address}</code>
        </p>
        <p>
          <strong>Status:</strong>{' '}
          <span className={user.isEnabled ? 'status-enabled' : 'status-disabled'}>
            {user.isEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </p>
        <p>
          <strong>Bank ID:</strong> {user.bankId}
        </p>
        <p>
          <strong>Created On:</strong> {new Date(user.createdOn).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
