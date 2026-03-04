import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InterviewCardProps {
  id: string;
  jobPosition: string;
  techStack: string;
  experience: string;
  createdAt: string;
  questionsCount: number;
  score?: number;
}

export const InterviewCard = ({
  id,
  jobPosition,
  techStack,
  experience,
  createdAt,
  questionsCount,
  score,
}: InterviewCardProps) => {
  const navigate = useNavigate();

  return (
    <Card variant="interactive" className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground line-clamp-1">
              {jobPosition}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {techStack}
            </p>
          </div>
          {score !== undefined && (
            <Badge variant={score >= 70 ? "default" : "secondary"} className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {score}%
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{experience} years exp.</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          {questionsCount} questions
        </p>
      </CardContent>

      <CardFooter className="gap-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => navigate(`/interview/${id}`)}
        >
          Continue
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/feedback/${id}`)}
        >
          View Feedback
        </Button>
      </CardFooter>
    </Card>
  );
};
