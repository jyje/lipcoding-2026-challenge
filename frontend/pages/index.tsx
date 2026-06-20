'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  nickname: string;
  createdAt: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [brainDump, setBrainDump] = useState('');

  useEffect(() => {
    // 로컬 스토리지에서 사용자 정보 로드
    const savedUser = localStorage.getItem('lifeosUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleNicknameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to register');
      }

      const data = await response.json();
      const newUser = data.user;
      
      // 로컬 스토리지에 저장
      localStorage.setItem('lifeosUser', JSON.stringify(newUser));
      setUser(newUser);
      setNickname('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('lifeosUser');
    setUser(null);
  };

  const handleAnalyze = async () => {
    if (!brainDump.trim()) {
      setError('Please enter your thoughts');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          brainDump,
          timeBudgetMin: 120,
        }),
      });

      const data = await response.json();
      console.log('Analysis result:', data);
      // TODO: Display results
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 초기 접속 - 닉네임 설정 화면
  if (!user) {
    return (
      <main style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>🎯 LifeOS Insight Coach</h1>
        <p>첫 방문을 환영합니다! 닉네임을 설정해주세요.</p>

        <form onSubmit={handleNicknameSubmit}>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (2-50자)"
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '10px',
              fontSize: '16px',
            }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !nickname.trim()}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            {loading ? '처리 중...' : '시작하기'}
          </button>
        </form>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </main>
    );
  }

  // 사용자 로그인 상태 - 메인 화면
  return (
    <main style={{ padding: '20px' }}>
      <header style={{ marginBottom: '30px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <h1>🎯 LifeOS Insight Coach</h1>
        <p>안녕하세요, <strong>{user.nickname}</strong>님! 👋</p>
        <button onClick={handleLogout} style={{ padding: '5px 10px' }}>
          로그아웃
        </button>
      </header>

      <section>
        <h2>📝 오늘의 생각을 적어주세요</h2>
        <textarea
          value={brainDump}
          onChange={(e) => setBrainDump(e.target.value)}
          placeholder="업무, 커리어, 학습 등 떠오르는 모든 일을 자유롭게 작성해주세요..."
          style={{
            width: '100%',
            height: '200px',
            padding: '10px',
            marginBottom: '10px',
            fontSize: '16px',
            fontFamily: 'Arial, sans-serif',
          }}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading || !brainDump.trim()}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          {loading ? '분석 중...' : '분석하기'}
        </button>

        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </section>

      <section style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5' }}>
        <h3>📊 사용자 정보</h3>
        <p>ID: {user.id}</p>
        <p>가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}</p>
      </section>
    </main>
  );
}
