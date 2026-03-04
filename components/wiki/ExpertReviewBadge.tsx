import { UserCheck } from 'lucide-react';

interface ExpertReviewBadgeProps {
  reviewers: string[];
}

export function ExpertReviewBadge({ reviewers }: ExpertReviewBadgeProps) {
  if (!reviewers || reviewers.length === 0) {
    return null;
  }

  return (
    <div className="flex items-start gap-3 p-4 bg-blue-50 border-l-4 border-action rounded-xl">
      <div className="flex-shrink-0 mt-0.5">
        <UserCheck className="w-5 h-5 text-action" />
      </div>
      <div>
        <div className="font-semibold text-action text-sm mb-1">
          Expert Reviewed
        </div>
        <div className="text-action text-sm">
          {reviewers.length === 1 ? (
            <>
              Reviewed by <span className="font-medium">{reviewers[0]}</span>
            </>
          ) : (
            <>
              Reviewed by{' '}
              {reviewers.map((reviewer, index) => (
                <span key={reviewer}>
                  <span className="font-medium">{reviewer}</span>
                  {index < reviewers.length - 2 && ', '}
                  {index === reviewers.length - 2 && ' and '}
                </span>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
