import '../styles/auth.css';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className='auth-page'>
      <div className='auth-container'>
        <h2>회원가입</h2>
        <form>
          <input type='text' placeholder='아이디' />
          <input type='password' placeholder='비밀번호' />
          <input type='password' placeholder='비밀번호 확인' />
          <button type='submit'>가입하기</button>
        </form>
        <div className='link'>
          <Link to='/login'>로그인으로 돌아가기</Link>
        </div>
      </div>
    </div>
  );
}
