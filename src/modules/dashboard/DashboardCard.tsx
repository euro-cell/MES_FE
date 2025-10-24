import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value }) => {
  return (
    <div className='box'>
      <h3>{title}</h3>
      <p style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '8px' }}>{value}</p>
    </div>
  );
};

export default DashboardCard;
