import '../styles/auth.css';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className='auth-page'>
      <div className='auth-container'>
        <h2>로그인</h2>
        <form>
          <input type='text' placeholder='아이디' />
          <input type='password' placeholder='비밀번호' />
          <button type='submit'>로그인</button>
        </form>
        <div className='link'>
          <Link to='/register'>회원가입</Link>
        </div>
      </div>
    </div>
  );
}
