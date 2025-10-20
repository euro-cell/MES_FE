import React from 'react';

const Topbar: React.FC = () => {
  return (
    <div className='top-bar'>
      <h2>대시보드</h2>
      <div className='right'>
        <span className='user-info'>로그인 사용자</span>
        <button className='logout-btn'>로그아웃</button>
      </div>
    </div>
  );
};

export default Topbar;
