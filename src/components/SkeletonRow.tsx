// components/SkeletonRow.tsx
import React from 'react';

interface SkeletonRowProps {
  columns: number;
}

const SkeletonRow: React.FC<SkeletonRowProps> = ({ columns }) => {
  return (
    <tr className="bg-white border-b border-gray-200 animate-pulse">
      {Array.from({ length: columns }).map((_, colIndex) => (
        <td key={colIndex} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded"></div>
        </td>
      ))}
    </tr>
  );
};

export default SkeletonRow;