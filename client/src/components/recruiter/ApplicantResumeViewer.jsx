import { ResumePreview } from '@/components/resume/ResumePreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export function ApplicantResumeViewer({ resume }) {
  if (!resume) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Resume not available.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{resume.title || 'Resume'}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <ResumePreview resume={resume} showActions={false} />
      </CardContent>
    </Card>
  );
}
