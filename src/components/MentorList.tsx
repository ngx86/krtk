import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface Mentor {
  id: string;
  name: string | null;
  avatar_url: string | null;
  expertise: string[] | null;
  rating: number | null;
  review_count: number | null;
  bio: string | null;
  portfolio: string | null;
  languages: string[] | null;
  available: boolean;
  price_per_feedback: number | null;
}

interface MentorListProps {
  onSelectMentor: (mentorId: string) => void;
}

export function MentorList({ onSelectMentor }: MentorListProps) {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    expertise: '',
    language: '',
    minRating: 0,
  });

  useEffect(() => {
    fetchMentors();
  }, []);

  async function fetchMentors() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'mentor')
        .order('rating', { ascending: false });

      if (error) throw error;

      setMentors(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentors');
    } finally {
      setLoading(false);
    }
  }

  // Get unique expertise and languages from all mentors
  const allExpertise = Array.from(new Set(mentors.flatMap(m => m.expertise || [])));
  const allLanguages = Array.from(new Set(mentors.flatMap(m => m.languages || [])));

  // Filter mentors based on criteria
  const filteredMentors = mentors.filter(mentor => {
    const matchesExpertise = !filters.expertise || 
      (mentor.expertise && mentor.expertise.includes(filters.expertise));
    const matchesLanguage = !filters.language || 
      (mentor.languages && mentor.languages.includes(filters.language));
    const matchesRating = !mentor.rating || mentor.rating >= filters.minRating;
    return matchesExpertise && matchesLanguage && matchesRating;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-destructive/10">
        <CardContent className="p-6">
          <p className="text-destructive">{error}</p>
          <Button 
            onClick={fetchMentors}
            variant="outline"
            className="mt-2"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Mentors</CardTitle>
        <CardDescription>Find the perfect mentor for your design feedback</CardDescription>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filters.expertise}
            onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
          >
            <option value="">Any Expertise</option>
            {allExpertise.map(exp => (
              <option key={exp} value={exp}>{exp}</option>
            ))}
          </select>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filters.language}
            onChange={(e) => setFilters({ ...filters, language: e.target.value })}
          >
            <option value="">Any Language</option>
            {allLanguages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={filters.minRating}
            onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
          >
            <option value="0">Any Rating</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
            <option value="4.8">4.8+</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {filteredMentors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No mentors found matching your criteria
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMentors.map((mentor) => (
                <Card key={mentor.id}>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={mentor.avatar_url || undefined} />
                        <AvatarFallback>{mentor.name?.[0] || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <CardTitle>{mentor.name || 'Anonymous'}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{mentor.rating !== null && mentor.rating !== undefined ? mentor.rating.toFixed(1) : '0.0'}</span>
                          <span className="text-sm text-muted-foreground">
                            ({mentor.review_count || 0} reviews)
                          </span>
                        </div>
                      </div>
                      <Badge variant={mentor.available ? "default" : "secondary"}>
                        {mentor.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mentor.bio && (
                        <CardDescription className="line-clamp-2">
                          {mentor.bio}
                        </CardDescription>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {mentor.expertise?.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline">{skill}</Badge>
                        ))}
                        {mentor.expertise && mentor.expertise.length > 3 && (
                          <Badge variant="outline">+{mentor.expertise.length - 3} more</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold">
                          {mentor.price_per_feedback !== null 
                            ? `${mentor.price_per_feedback} credits` 
                            : 'Price not set'}
                        </div>
                        <Button
                          onClick={() => onSelectMentor(mentor.id)}
                          disabled={!mentor.available || mentor.price_per_feedback === null}
                        >
                          {!mentor.available 
                            ? "Currently Unavailable" 
                            : mentor.price_per_feedback === null 
                              ? "Price Not Set"
                              : "Request Feedback"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 