import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useLoading } from 'context/LoadingContext';

function HandleOnCompleteChild() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {setLoading}:any = useLoading();

  useEffect(() => setLoading(false), [pathname, searchParams]);
  return null;
}

export function HandleOnComplete() {
  return (
    <Suspense>
      <HandleOnCompleteChild />
    </Suspense>
  );
}
