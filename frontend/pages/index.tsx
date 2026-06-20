'use client';

import { useState } from 'react';

export default function Home() {
  const [brainDump, setBrainDump] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brainDump }),
      });

      const data = await response.json();
      console.log('Analysis result:', data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: '20px' }}>
      <h1>LifeOS Insight Coach</h1>
      <textarea
        value={brainDump}
        onChange={(e) => setBrainDump(e.target.value)}
        placeholder="Enter your brain dump here..."
        style={{ width: '100%', height: '200px' }}
      />
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
    </main>
  );
}
