import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";

interface MentorProfile {
  id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  expertise: string[];
  languages: string[];
  rating: number;
  review_count: number;
  portfolio_url: string | null;
  price_per_feedback: number | null;
}

export function MentorProfilePage() {
  const { mentorId } = useParams<{ mentorId: string }>();
  const { user } = useApp();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState<string>('');

  useEffect(() => {
    if (mentorId) {
      fetchMentorProfile();
    }
  }, [mentorId]);

  async function fetchMentorProfile() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', mentorId)
        .eq('role', 'mentor')
        .single();

      if (error) throw error;
      setMentor(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentor profile');
    } finally {
      setLoading(false);
    }
  }

  async function updatePrice() {
    if (!mentor || !user || user.id !== mentor.id) return;
    
    const price = parseInt(newPrice);
    if (isNaN(price) || price < 1) {
      setError('Please enter a valid price (minimum 1 credit)');
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ price_per_feedback: price })
        .eq('id', mentor.id);

      if (error) throw error;

      setMentor(prev => prev ? { ...prev, price_per_feedback: price } : null);
      setEditingPrice(false);
      setNewPrice('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update price');
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!mentor) {
    return <div>Mentor not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={mentor.avatar_url || undefined} />
              <AvatarFallback>{mentor.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{mentor.name || 'Anonymous'}</CardTitle>
              <div className="flex items-center mt-2 space-x-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-lg">{mentor.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({mentor.review_count} reviews)</span>
              </div>
            </div>
            <div className="text-right">
              {user?.id === mentor.id ? (
                <div className="space-y-2">
                  {editingPrice ? (
                    <div className="space-y-2">
                      <Label htmlFor="price">Price per feedback (in credits)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="price"
                          type="number"
                          min="1"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder="Enter price"
                        />
                        <Button onClick={updatePrice}>Save</Button>
                        <Button variant="outline" onClick={() => setEditingPrice(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-primary">
                        {mentor.price_per_feedback !== null ? `${mentor.price_per_feedback} credits` : 'Price not set'}
                      </div>
                      <Button onClick={() => {
                        setNewPrice(mentor.price_per_feedback?.toString() || '');
                        setEditingPrice(true);
                      }}>
                        {mentor.price_per_feedback !== null ? 'Update Price' : 'Set Price'}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {mentor.price_per_feedback !== null ? `${mentor.price_per_feedback} credits` : 'Price not set'}
                  </div>
                  <div className="text-sm text-muted-foreground">per feedback</div>
                  {mentor.price_per_feedback !== null && (
                    <Button className="mt-2">Request Feedback</Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {mentor.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <CardDescription>{mentor.bio}</CardDescription>
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold mb-2">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.expertise?.map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.languages?.map((lang) => (
                <Badge key={lang} variant="outline">{lang}</Badge>
              ))}
            </div>
          </div>
          {mentor.portfolio_url && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Portfolio</h3>
              <a 
                href={mentor.portfolio_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View Portfolio
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 