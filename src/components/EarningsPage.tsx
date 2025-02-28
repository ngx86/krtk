import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, CreditCard, ArrowRight } from "lucide-react";

export function EarningsPage() {
  const { feedbackRequests, user } = useApp();
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutEmail, setPayoutEmail] = useState("");
  
  // Calculate total earnings (1 credit = $1 for simplicity)
  const completedRequests = feedbackRequests.filter(
    request => request.mentor_id === user?.id && request.status === 'completed'
  );
  
  const totalEarnings = completedRequests.reduce(
    (total, request) => total + (request.credits_cost || 0), 
    0
  );
  
  // In a real app, we'd track payouts in a database
  // For now we'll just simulate that all earnings are available
  const availableEarnings = totalEarnings;
  
  const handleRequestPayout = () => {
    // In a real app, this would initiate a payout process
    alert(`Payout of $${payoutAmount} requested to ${payoutEmail}. This would be processed by your payment provider in a real application.`);
  };
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Earnings & Payouts</h1>
      
      {/* Earnings Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Lifetime earnings from all completed feedback
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${availableEarnings}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Amount ready to be withdrawn
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Review</CardTitle>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${completedRequests.length ? (totalEarnings / completedRequests.length).toFixed(2) : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on {completedRequests.length} completed reviews
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Payout Request Form */}
      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
          <CardDescription>
            Request a payout of your available earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max={availableEarnings}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="Enter amount to withdraw"
                className="max-w-[200px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">PayPal Email</Label>
              <Input
                id="email"
                type="email"
                value={payoutEmail}
                onChange={(e) => setPayoutEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="max-w-[300px]"
              />
            </div>
            
            <Button 
              onClick={handleRequestPayout}
              disabled={!payoutAmount || !payoutEmail || Number(payoutAmount) > availableEarnings}
            >
              Request Payout
            </Button>
            
            <p className="text-sm text-muted-foreground mt-2">
              Payouts are typically processed within 3-5 business days.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Earnings History */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings History</CardTitle>
          <CardDescription>
            History of completed feedback and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed feedback requests yet
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Feedback Request</th>
                      <th className="px-4 py-2 text-right">Credits</th>
                      <th className="px-4 py-2 text-right">Amount (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedRequests.map((request) => (
                      <tr key={request.id} className="border-t">
                        <td className="px-4 py-2 text-left">
                          {new Date(request.updated_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-left line-clamp-1">
                          {request.description}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {request.credits_cost}
                        </td>
                        <td className="px-4 py-2 text-right">
                          ${request.credits_cost}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 