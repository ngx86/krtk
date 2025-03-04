import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

export function FeedbackRequestsPage() {
  const { feedbackRequests, user, acceptFeedbackRequest } = useApp();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'credits'>('newest');

  const filteredRequests = feedbackRequests
    .filter(request => {
      const matchesSearch = request.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
      return matchesSearch && matchesUrgency;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'credits':
          return b.credits_cost - a.credits_cost;
        default:
          return 0;
      }
    });

  const handleAcceptRequest = async (requestId: number) => {
    try {
      await acceptFeedbackRequest(requestId);
      navigate(`/dashboard/requests/${requestId}`);
    } catch (error) {
      console.error('Error accepting request:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Feedback Requests</h1>
          <p className="text-muted-foreground">Browse and accept feedback requests from mentees</p>
        </div>
        <Button onClick={() => navigate('/dashboard/requests/new')}>
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select value={urgencyFilter} onValueChange={(value: any) => setUrgencyFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Urgency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Urgencies</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="credits">Credits (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No feedback requests found
              </div>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {request.description}
                        </CardTitle>
                        <CardDescription>
                          {new Date(request.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          request.urgency === 'high' ? 'destructive' :
                          request.urgency === 'medium' ? 'default' : 'secondary'
                        }>
                          {request.urgency}
                        </Badge>
                        <Badge variant="outline">
                          {request.credits_cost} credits
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <a
                        href={request.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        View Design
                      </a>
                      {request.status === 'pending' && user?.role === 'mentor' && (
                        <Button onClick={() => handleAcceptRequest(request.id)}>
                          Accept Request
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 