import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the MapShanghai component
const MapShanghai = dynamic(() => import('@/components/MapShanghai'), { ssr: false });

const ShanghaiMapPage = () => {
  return (
    <div>
      <h1>NYU Shanghai Housing Selection Helper</h1>
      <MapShanghai />
    </div>
  );
};

export default ShanghaiMapPage;
