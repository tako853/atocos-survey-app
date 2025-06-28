'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth/context';
import styles from './login.module.scss';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (login(username, password)) {
      router.push('/admin');
    } else {
      setError('ユーザー名またはパスワードが正しくありません');
    }
  };

  return (
    <div className={styles.login_wrapper}>
      <div className={styles.login_container}>
        <h1>管理者ログイン</h1>
        
        <form onSubmit={handleSubmit} className={styles.login_form}>
          <div className={styles.form_group}>
            <label htmlFor="username">ユーザー名:</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名を入力"
              className={styles.input_field}
              required
            />
          </div>

          <div className={styles.form_group}>
            <label htmlFor="password">パスワード:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              className={styles.input_field}
              required
            />
          </div>

          {error && (
            <div className={styles.error_message}>
              {error}
            </div>
          )}

          <button type="submit" className={styles.login_button}>
            ログイン
          </button>
        </form>

        <div className={styles.demo_info}>
          <p><strong>デモ用ログイン情報:</strong></p>
          <p>ユーザー名: admin</p>
          <p>パスワード: admin123</p>
        </div>
      </div>
    </div>
  );
}