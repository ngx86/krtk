import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockFeedbackRequests } from '../types';

export function MenteeDashboard() {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

  const filteredRequests = mockFeedbackRequests
    .filter(request => statusFilter === 'all' || request.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.status.localeCompare(b.status);
    });

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Available Credits</h3>
          <p className="text-2xl font-bold text-blue-600">10</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Active Requests</h3>
          <p className="text-2xl font-bold text-gray-900">
            {mockFeedbackRequests.filter(r => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Completed Reviews</h3>
          <p className="text-2xl font-bold text-gray-900">
            {mockFeedbackRequests.filter(r => r.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/request-feedback"
          className="bg-blue-500 text-white p-4 rounded-lg text-center hover:bg-blue-600 transition-colors"
        >
          Request New Feedback
        </Link>
        <Link
          to="/mentors"
          className="bg-green-500 text-white p-4 rounded-lg text-center hover:bg-green-600 transition-colors"
        >
          Find a Mentor
        </Link>
      </div>

      {/* Feedback History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Feedback History</h2>
            <div className="flex space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <div key={request.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{request.description}</h3>
                    <div className="mt-1 space-x-4">
                      <a
                        href={request.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View Design
                      </a>
                      <span className="text-sm text-gray-500">
                        Submitted on {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      request.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                {request.feedback && (
                  <div className="mt-4 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Feedback</h4>
                    <p className="text-gray-600">{request.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 