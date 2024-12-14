import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { CreditCard } from "lucide-react"

interface FeedbackRequestProps {
  selectedMentorId?: number;
  creditCost: number;
}

type UrgencyLevel = 'low' | 'medium' | 'high';

interface FormData {
  title: string;
  designLink: string;
  description: string;
  background: string;
  deadline: string;
  urgency: UrgencyLevel;
  isPublic: boolean;
  preferredLanguages: string[];
  expertise: string[];
}

export function FeedbackRequest({ selectedMentorId, creditCost }: FeedbackRequestProps) {
  const { createFeedbackRequest, user } = useApp();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    designLink: '',
    description: '',
    background: '',
    deadline: '',
    urgency: 'low',
    isPublic: !selectedMentorId,
    preferredLanguages: [],
    expertise: []
  });

  const expertiseOptions = [
    'UI Design',
    'UX Design',
    'Typography',
    'Color Theory',
    'Layout Design',
    'Design Systems',
    'Mobile Design',
    'Web Design',
    'Branding'
  ];

  const languageOptions = [
    'English',
    'Spanish',
    'Mandarin',
    'French',
    'German'
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createFeedbackRequest({
      menteeId: user?.id || '',
      mentorId: selectedMentorId?.toString(),
      description: formData.description,
      link: formData.designLink,
      status: 'pending',
      urgency: formData.urgency,
      creditsCost: creditCost
    });
  };

  const calculateCost = () => {
    const baseCost = 3;
    return formData.urgency === 'high' ? baseCost * 1.5 : baseCost;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Request Feedback</CardTitle>
            <CardDescription>
              {selectedMentorId 
                ? 'Request feedback from a specific mentor' 
                : 'Post your request to all available mentors'}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <Badge variant="secondary">
              {calculateCost()} Credits
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setFormData({ ...formData, title: e.target.value })}
              placeholder="E.g., E-commerce Homepage Redesign"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="designLink">
              Design Link
              <span className="ml-1 text-sm text-muted-foreground">(Figma, Dribbble, etc.)</span>
            </Label>
            <Input
              id="designLink"
              value={formData.designLink}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                setFormData({ ...formData, designLink: e.target.value })}
              placeholder="Paste your design link here"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Project Background</Label>
            <Textarea
              id="background"
              value={formData.background}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setFormData({ ...formData, background: e.target.value })}
              placeholder="Describe your project's context, target audience, and goals"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">What Would You Like Feedback On?</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                setFormData({ ...formData, description: e.target.value })}
              placeholder="List specific aspects you'd like feedback on (e.g., typography, color scheme, layout)"
            />
          </div>

          <div className="space-y-2">
            <Label>Areas of Expertise Needed</Label>
            <div className="flex flex-wrap gap-2">
              {expertiseOptions.map((skill) => (
                <Badge
                  key={skill}
                  variant={formData.expertise.includes(skill) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    const newExpertise = formData.expertise.includes(skill)
                      ? formData.expertise.filter(s => s !== skill)
                      : [...formData.expertise, skill];
                    setFormData({ ...formData, expertise: newExpertise });
                  }}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Languages</Label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((language) => (
                <Badge
                  key={language}
                  variant={formData.preferredLanguages.includes(language) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    const newLanguages = formData.preferredLanguages.includes(language)
                      ? formData.preferredLanguages.filter(l => l !== language)
                      : [...formData.preferredLanguages, language];
                    setFormData({ ...formData, preferredLanguages: newLanguages });
                  }}
                >
                  {language}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, deadline: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgency">Urgency</Label>
              <select
                id="urgency"
                value={formData.urgency}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  setFormData({ ...formData, urgency: e.target.value as UrgencyLevel })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {!selectedMentorId && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  setFormData({ ...formData, isPublic: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isPublic">
                Make this request visible to all mentors
              </Label>
            </div>
          )}

          <Card className="bg-muted">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Credit Cost</h4>
                  <p className="text-sm text-muted-foreground">
                    {formData.urgency === 'high' ? 'High urgency requests cost more credits' : 'Standard request'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-bold text-primary">
                    {calculateCost()} Credits
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full">
            Submit Request ({calculateCost()} Credits)
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 