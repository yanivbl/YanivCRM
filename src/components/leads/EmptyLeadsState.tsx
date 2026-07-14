import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function EmptyLeadsState({ isFiltered }: { isFiltered: boolean }) {
  if (isFiltered) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-gray-500">לא נמצאו תוצאות</p>
        <p className="text-sm text-gray-400">נסה לשנות את החיפוש או הסינון</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <p className="text-gray-500">עדיין אין לידים — הוסף את הליד הראשון שלך</p>
      <Link to="/leads/new">
        <Button>+ ליד חדש</Button>
      </Link>
    </div>
  );
}
