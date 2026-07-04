import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 text-center">
      <div>
        <div className="tabular text-6xl font-semibold">404</div>
        <div className="mt-2 text-lg font-medium">Page not found</div>
        <p className="mt-1 text-sm text-muted-foreground">
          The link may be broken, or the page may have moved.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Return to home</Link>
        </Button>
      </div>
    </div>
  );
}
