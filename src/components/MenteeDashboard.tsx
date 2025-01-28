import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreditCard, Users, Clock } from "lucide-react"

export function MenteeDashboard() {
  const { feedbackRequests, credits } = useApp();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status'>('date');

  const filteredRequests = feedbackRequests
    .filter(request => statusFilter === 'all' || request.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return a.status.localeCompare(b.status);
    });

  const pendingRequests = feedbackRequests.filter(r => r.status === 'pending');
  const completedRequests = feedbackRequests.filter(r => r.status === 'completed');

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Reviews</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/request-feedback">
          <Button className="w-full" size="lg">
            Request New Feedback
          </Button>
        </Link>
        <Link to="/mentors">
          <Button variant="secondary" className="w-full" size="lg">
            Find a Mentor
          </Button>
        </Link>
      </div>

      {/* Feedback History */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback History</CardTitle>
          <CardDescription>
            View and manage your feedback requests
          </CardDescription>
          <div className="flex space-x-4 mt-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-md border bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border bg-background px-3 py-2 text-sm ring-offset-background"
            >
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
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
                        className="text-primary hover:underline text-sm"
                      >
                        View Design
                      </a>
                      <span className="text-sm text-muted-foreground">
                        Submitted on {request.created_at && new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                    }`}
                  >
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                {request.feedback && (
                  <div className="mt-4 bg-muted rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Feedback</h4>
                    <p className="text-sm text-muted-foreground">{request.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 