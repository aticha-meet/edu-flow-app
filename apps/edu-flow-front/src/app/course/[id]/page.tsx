'use client';

import { useParams } from 'next/navigation';

export default function CourseDetail() {
  const params = useParams();
  const { id } = params;

  return (
    <div>
      <h1>Course Page</h1>
    </div>
  );
}
