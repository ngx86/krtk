import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from 'react-router-dom';

export function MenteeDashboard() {
  const { feedbackRequests, credits } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Welcome to your Dashboard</h1>
        <Link to="/request-feedback">
          <Button>Request Feedback</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Available Credits</CardTitle>
            <CardDescription>Your current balance</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{credits}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Requests</CardTitle>
            <CardDescription>Pending and in-progress feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {feedbackRequests.filter(r => ['pending', 'accepted'].includes(r.status)).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Reviews</CardTitle>
            <CardDescription>Total feedback received</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {feedbackRequests.filter(r => r.status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Recent Feedback Requests</h2>
        {feedbackRequests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No feedback requests yet. Start by requesting feedback on your code!
              </p>
            </CardContent>
          </Card>
        ) : (
          feedbackRequests.slice(0, 5).map((request) => (
            <Card key={request.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{request.description}</h3>
                    <p className="text-sm text-muted-foreground">
                      Status: <span className="capitalize">{request.status}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Created: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{request.credits_cost} credits</p>
                    <p className="text-sm text-muted-foreground capitalize">{request.urgency} priority</p>
                  </div>
                </div>
                {request.feedback && (
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm">{request.feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 