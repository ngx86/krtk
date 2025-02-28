import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type TimeFilterType = 'all' | '30' | '90';
type StatusFilterType = 'all' | 'completed' | 'pending' | 'declined';

export function FeedbackHistoryPage() {
  const { feedbackRequests } = useApp();
  const { userRole, user } = useAuth();
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>('all');
  
  // Filter requests based on role - mentees see requests they created, mentors see requests they received
  const filteredRequests = feedbackRequests
    .filter(request => {
      const isCorrectUser = userRole === 'mentee' 
        ? request.mentee_id === user?.id 
        : request.mentor_id === user?.id;
        
      // Apply status filter
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
      
      // Apply time filter
      let matchesTime = true;
      if (timeFilter !== 'all' && request.created_at) {
        const requestDate = new Date(request.created_at);
        const daysAgo = Math.floor((Date.now() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
        matchesTime = daysAgo <= parseInt(timeFilter);
      }
      
      return isCorrectUser && matchesStatus && matchesTime;
    })
    .sort((a, b) => {
      // Sort by most recent first
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Feedback History</CardTitle>
              <CardDescription>
                {userRole === 'mentee' 
                  ? 'Your submitted feedback requests' 
                  : 'Feedback you have provided to mentees'}
              </CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilterType)}
                className="px-3 py-2 rounded-md border bg-background text-sm"
              >
                <option value="all">All Time</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilterType)}
                className="px-3 py-2 rounded-md border bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="declined">Declined</option>
              </select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No feedback requests found matching your criteria
            </div>
          ) : (
            <div className="divide-y">
              {filteredRequests.map((request) => (
                <div key={request.id} className="py-6 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div>
                      <h3 className="font-medium">{request.description}</h3>
                      <div className="mt-1 space-x-4">
                        {request.link && (
                          <a
                            href={request.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            View Design
                          </a>
                        )}
                        {request.created_at && (
                          <span className="text-sm text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <Badge 
                      className={
                        request.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : request.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
                      }
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                  </div>
                  
                  {request.feedback && (
                    <div className="mt-4 bg-muted rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-2">Feedback</h4>
                      <p className="text-muted-foreground whitespace-pre-line">{request.feedback}</p>
                    </div>
                  )}
                  
                  {userRole === 'mentor' && request.status === 'pending' && (
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={() => window.location.href = '/dashboard'}
                        variant="secondary"
                        size="sm"
                      >
                        Provide Feedback
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 