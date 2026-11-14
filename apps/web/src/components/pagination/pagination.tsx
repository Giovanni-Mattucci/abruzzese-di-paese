import { Button } from '@mannaggia/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

export interface PaginationProps {
  page: number;
  pages: number;
  /** Link for a page number; the caller keeps its own query parameters in it. */
  hrefFor: (page: number) => string;
}

/** Previous and Next links around "Page 2 of 3". Renders nothing when there is one page. */
export function Pagination({ page, pages, hrefFor }: PaginationProps) {
  const { t } = useTranslation();
  if (pages <= 1) return null;
  return (
    <nav aria-label={t('pagination.label')} className="mt-6 flex items-center justify-between">
      {/* An out-of-range link stays in the layout but is hidden from sight, keyboard and readers. */}
      <Button asChild variant="outline" className={page <= 1 ? 'invisible' : ''}>
        <Link to={hrefFor(page - 1)}>{t('pagination.previous')}</Link>
      </Button>
      <span className="text-sm text-muted-foreground">
        {t('pagination.page_of', { page, pages })}
      </span>
      <Button asChild variant="outline" className={page >= pages ? 'invisible' : ''}>
        <Link to={hrefFor(page + 1)}>{t('pagination.next')}</Link>
      </Button>
    </nav>
  );
}
