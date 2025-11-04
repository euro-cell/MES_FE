const API_BASE = import.meta.env.VITE_API_BASE_URL;

import '../styles/auth.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { employeeNumber, password }, { withCredentials: true });

      if (res.status === 200 || res.status === 201) {
        navigate('/dashboard', { replace: true });
      } else {
        console.warn('로그인 응답 상태:', res.status);
      }
    } catch (err: any) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 401) {
        setError(message || '사번 또는 비밀번호가 올바르지 않습니다.');
      } else if (status === 403) {
        setError(message || '현재 계정은 활성화되지 않았습니다. 관리자 승인이 필요합니다.');
      } else {
        setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
      console.error('로그인 실패:', err);
    }
  };

  return (
    <div className='auth-page'>
      <div className='auth-container'>
        <h2>유로셀 MES 로그인</h2>
        <form onSubmit={handleSubmit}>
          <input
            type='text'
            placeholder='사번'
            value={employeeNumber}
            onChange={e => setEmployeeNumber(e.target.value)}
            required
            autoComplete='username'
          />
          <input
            type='password'
            placeholder='비밀번호'
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete='current-password'
          />
          {error && <p className='error-text'>{error}</p>}
          <button type='submit'>로그인</button>
        </form>
        <p className='link'>
          계정이 없으신가요? <Link to='/register'>회원가입</Link>
        </p>
      </div>
    </div>
  );
}
