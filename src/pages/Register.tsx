const API_BASE = import.meta.env.VITE_API_BASE_URL;

import styles from '../styles/auth.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    employeeNumber: '',
    name: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.employeeNumber || !form.name || !form.password) {
      setError('모든 필드를 입력해주세요.');
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/auth/register`,
        {
          employeeNumber: form.employeeNumber,
          name: form.name,
          password: form.password,
        },
        { withCredentials: true }
      );

      if (res.status === 200 || res.status === 201) {
        alert('회원가입이 완료되었습니다. 로그인해주세요.');
        navigate('/login');
      }
    } catch (err: any) {
      console.error('회원가입 실패:', err);
      setError('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <h2>유로셀 MES 회원가입</h2>
        <form onSubmit={handleSubmit} autoComplete='on'>
          <input
            type='text'
            name='employeeNumber'
            placeholder='사번'
            value={form.employeeNumber}
            onChange={handleChange}
            required
            autoComplete='username'
          />

          <input
            type='text'
            name='name'
            placeholder='이름'
            value={form.name}
            onChange={handleChange}
            required
            autoComplete='name'
          />

          <input
            type='password'
            name='password'
            placeholder='비밀번호'
            value={form.password}
            onChange={handleChange}
            required
            autoComplete='new-password'
          />

          {error && <p className={styles.errorText}>{error}</p>}
          <button type='submit'>회원가입</button>
        </form>

        <p className={styles.link}>
          이미 계정이 있으신가요? <Link to='/login'>로그인</Link>
        </p>
      </div>
    </div>
  );
}
