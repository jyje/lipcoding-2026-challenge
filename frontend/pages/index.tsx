'use client';

import { useEffect, useMemo, useState } from 'react';

type GoalOverview = {
  goals: Array<{
    space: 'work' | 'career' | 'tech';
    top_task: {
      id: string;
      title: string;
      description: string;
      priority: 1 | 2 | 3;
      status: 'pending' | 'done';
    } | null;
  }>;
};

type TaskStatus = 'todo' | 'doing' | 'done';

type PlannerTask = {
  id: string;
  title: string;
  description: string;
  date: string;
  status: TaskStatus;
  priority: 1 | 2 | 3;
  space: 'work' | 'career' | 'tech';
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

type JobStatus = 'interest' | 'applied' | 'interview' | 'closed';

type JobPosting = {
  id: string;
  title: string;
  company: string;
  url: string;
  status: JobStatus;
  addedDate: string;
};

const STORAGE_KEYS = {
  name: 'thriveopsUserName',
  tasks: 'thriveopsTasks',
  jobs: 'thriveopsJobs',
};

const statusCopy: Record<TaskStatus, string> = {
  todo: 'Todo',
  doing: 'Doing',
  done: 'Done',
};

const jobStatusCopy: Record<JobStatus, string> = {
  interest: '관심',
  applied: '지원',
  interview: '면접',
  closed: '마감',
};

const jobStatusOrder: JobStatus[] = ['interest', 'applied', 'interview', 'closed'];

const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토'];

const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const shiftDate = (base: Date, diff: number): string => {
  const next = new Date(base);
  next.setDate(base.getDate() + diff);
  return toDateKey(next);
};

const formatDateLabel = (dateKey: string): string => {
  const parsed = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return dateKey;
  }
  return `${parsed.getMonth() + 1}월 ${parsed.getDate()}일 (${weekdayLabels[parsed.getDay()]})`;
};

const relativeDateLabel = (dateKey: string, todayKey: string): string => {
  if (dateKey === todayKey) {
    return '오늘';
  }
  const today = new Date(`${todayKey}T00:00:00`);
  if (dateKey === shiftDate(today, 1)) {
    return '내일';
  }
  if (dateKey === shiftDate(today, -1)) {
    return '어제';
  }
  return '';
};

const buildSeedTasks = (baseDate: Date): PlannerTask[] => [
  {
    id: 't-1',
    title: '고객 제안서 마감 검토',
    description: '핵심 리스크 3개와 일정 조정안을 정리합니다.',
    date: shiftDate(baseDate, 0),
    status: 'todo',
    priority: 1,
    space: 'work',
  },
  {
    id: 't-2',
    title: '기술 블로그 초안 작성',
    description: '이번 주 학습 내용을 1개 아티클로 정리합니다.',
    date: shiftDate(baseDate, 1),
    status: 'doing',
    priority: 2,
    space: 'tech',
  },
  {
    id: 't-3',
    title: '포트폴리오 프로젝트 캡처 업데이트',
    description: '최근 결과 화면과 설명 문구를 갱신합니다.',
    date: shiftDate(baseDate, 2),
    status: 'todo',
    priority: 2,
    space: 'career',
  },
  {
    id: 't-4',
    title: '주간 회고 정리',
    description: '성과/실패/다음 액션을 문서화합니다.',
    date: shiftDate(baseDate, -1),
    status: 'done',
    priority: 3,
    space: 'work',
  },
  {
    id: 't-5',
    title: '시장 리서치 키워드 점검',
    description: '직무 공고 트렌드 키워드를 5개 추립니다.',
    date: shiftDate(baseDate, 4),
    status: 'todo',
    priority: 1,
    space: 'career',
  },
  {
    id: 't-6',
    title: '서비스 모니터링 알람 튜닝',
    description: '오탐 알람 임계값을 낮추고 룰을 점검합니다.',
    date: shiftDate(baseDate, 5),
    status: 'doing',
    priority: 1,
    space: 'work',
  },
];

const summarizeTaskTitle = (message: string): string => {
  const compact = message.replace(/\s+/g, ' ').trim();
  if (!compact) {
    return '새 업무';
  }

  return compact.length > 22 ? `${compact.slice(0, 22)}…` : compact;
};

const linkLabel = (url: string): string => {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname === '/' ? '' : parsed.pathname;
    return `${parsed.hostname}${path}`.slice(0, 40);
  } catch {
    return url.slice(0, 40);
  }
};

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8010';
  const todayKey = toDateKey(new Date());
  const [name, setName] = useState('');
  const [draftName, setDraftName] = useState('');
  const [tasks, setTasks] = useState<PlannerTask[]>(() => buildSeedTasks(new Date()));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'chat-1',
      role: 'assistant',
      text: '업무·URL을 붙여넣거나 파일을 드롭하면 티켓으로 등록됩니다. 날짜는 카드의 파란 날짜를 클릭해 지정하세요.',
    },
  ]);
  const [messageDraft, setMessageDraft] = useState('');
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [jobDraft, setJobDraft] = useState('');
  const [activeTab, setActiveTab] = useState<'work' | 'career'>('work');
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskDraft, setTaskDraft] = useState<PlannerTask | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [showIntent, setShowIntent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GoalOverview | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const savedName = window.localStorage.getItem(STORAGE_KEYS.name);
    if (savedName) {
      setName(savedName);
    }
    try {
      const savedTasks = window.localStorage.getItem(STORAGE_KEYS.tasks);
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks) as PlannerTask[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTasks(parsed);
        }
      }
    } catch {
      // 손상된 캐시는 무시하고 시드 데이터를 유지합니다.
    }
    try {
      const savedJobs = window.localStorage.getItem(STORAGE_KEYS.jobs);
      if (savedJobs) {
        const parsedJobs = JSON.parse(savedJobs) as JobPosting[];
        if (Array.isArray(parsedJobs)) {
          setJobs(parsedJobs);
        }
      }
    } catch {
      // 손상된 채용공고 캐시는 무시합니다.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
  }, [tasks, hydrated]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS.jobs, JSON.stringify(jobs));
  }, [jobs, hydrated]);

  const tasksByStatus = useMemo(() => {
    const groups: Record<TaskStatus, PlannerTask[]> = { todo: [], doing: [], done: [] };
    tasks.forEach((task) => {
      groups[task.status].push(task);
    });
    (Object.keys(groups) as TaskStatus[]).forEach((key) => {
      groups[key].sort((a, b) =>
        a.date === b.date ? a.priority - b.priority : a.date.localeCompare(b.date),
      );
    });
    return groups;
  }, [tasks]);

  const dateSummary = useMemo(() => {
    const overdue = tasks.filter((task) => task.date < todayKey && task.status !== 'done').length;
    const today = tasks.filter((task) => task.date === todayKey).length;
    const upcoming = tasks.filter((task) => task.date > todayKey).length;
    return { overdue, today, upcoming };
  }, [tasks, todayKey]);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = draftName.trim();
    if (!trimmed) {
      setError('이름을 입력해 주세요.');
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.name, trimmed);
    setName(trimmed);
    setDraftName('');
    setError(null);
  };

  const handleLogout = () => {
    window.localStorage.removeItem(STORAGE_KEYS.name);
    setName('');
    setResult(null);
  };

  const buildTicketEntry = (line: string) => {
    const isUrl = /^https?:\/\/\S+$/i.test(line);
    return {
      title: isUrl ? `🔗 ${linkLabel(line)}` : summarizeTaskTitle(line),
      description: line,
    };
  };

  const createTickets = (entries: Array<{ title: string; description: string }>) => {
    if (entries.length === 0) {
      return;
    }
    const stamp = Date.now();
    setTasks((prev) => [
      ...entries.map((entry, index) => ({
        id: `task-${stamp}-${index}`,
        title: entry.title,
        description: entry.description,
        date: todayKey,
        status: 'todo' as TaskStatus,
        priority: 2 as 1 | 2 | 3,
        space: 'work' as const,
      })),
      ...prev,
    ]);
  };

  const appendAssistant = (text: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: 'assistant',
        text,
      },
    ]);
  };

  const handleSendMessage = () => {
    const text = messageDraft.trim();
    if (!text) {
      return;
    }

    const lines = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const entries = lines.map(buildTicketEntry);
    createTickets(entries);
    setMessageDraft('');
    setChatMessages((prev) => [
      ...prev,
      { id: `chat-${Date.now()}`, role: 'user', text },
      {
        id: `chat-${Date.now()}-reply`,
        role: 'assistant',
        text:
          entries.length > 1
            ? `${entries.length}개의 티켓을 Todo에 등록했습니다. 각 티켓의 파란 날짜를 클릭해 일정을 지정하세요.`
            : `"${entries[0].title}" 티켓을 Todo에 등록했습니다. 카드의 파란 날짜를 클릭해 일정을 지정하세요.`,
      },
    ]);
  };

  const handleDropTickets = (event: React.DragEvent) => {
    event.preventDefault();
    setDropActive(false);
    const files = Array.from(event.dataTransfer.files);
    const droppedText = event.dataTransfer.getData('text/plain').trim();
    const entries: Array<{ title: string; description: string }> = [];

    files.forEach((file) => {
      entries.push({
        title: `📎 ${file.name}`,
        description: `파일 티켓 · ${Math.max(1, Math.round(file.size / 1024))}KB`,
      });
    });

    if (files.length === 0 && droppedText) {
      droppedText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => entries.push(buildTicketEntry(line)));
    }

    if (entries.length === 0) {
      return;
    }
    createTickets(entries);
    appendAssistant(`드롭한 ${entries.length}개 항목을 티켓으로 등록했습니다.`);
  };

  const moveTaskStatus = (taskId: string, nextStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: nextStatus,
            }
          : task,
      ),
    );
  };

  const handleDropToStatus = (status: TaskStatus) => {
    if (!draggingTaskId) {
      return;
    }
    moveTaskStatus(draggingTaskId, status);
    setDraggingTaskId(null);
  };

  const updateTaskDate = (taskId: string, nextDate: string) => {
    if (!nextDate) {
      return;
    }
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, date: nextDate } : task)),
    );
  };

  const openTaskEditor = (task: PlannerTask) => {
    setEditingTaskId(task.id);
    setTaskDraft({ ...task });
  };

  const closeTaskEditor = () => {
    setEditingTaskId(null);
    setTaskDraft(null);
  };

  const saveTaskDraft = () => {
    if (!taskDraft) {
      return;
    }
    const title = taskDraft.title.trim() || '제목 없음';
    setTasks((prev) =>
      prev.map((task) => (task.id === taskDraft.id ? { ...taskDraft, title } : task)),
    );
    closeTaskEditor();
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    closeTaskEditor();
  };

  const addJobPostings = () => {
    const text = jobDraft.trim();
    if (!text) {
      return;
    }
    const stamp = Date.now();
    const entries: JobPosting[] = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const isUrl = /^https?:\/\/\S+$/i.test(line);
        let company = '';
        let url = '';
        let title = line;
        if (isUrl) {
          url = line;
          try {
            company = new URL(line).hostname.replace(/^www\./, '');
          } catch {
            company = '';
          }
          title = linkLabel(line);
        } else {
          const sep = line.match(/\s[-·@]\s/);
          if (sep) {
            const parts = line.split(sep[0]);
            company = parts[0].trim();
            title = parts.slice(1).join(' ').trim() || line;
          }
        }
        return {
          id: `job-${stamp}-${index}`,
          title,
          company,
          url,
          status: 'interest' as JobStatus,
          addedDate: todayKey,
        };
      });
    if (entries.length === 0) {
      return;
    }
    setJobs((prev) => [...entries, ...prev]);
    setJobDraft('');
  };

  const setJobStatus = (jobId: string, status: JobStatus) => {
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status } : job)));
  };

  const removeJob = (jobId: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
  };

  const loadOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/v1/goals/overview`);
      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }

      const data = (await response.json()) as GoalOverview;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f6f8fb 0%, #ffffff 100%)',
        color: '#111827',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
      }}
    >
      {!hydrated ? null : (
        <>
          <section
            style={{
              maxWidth: '1180px',
              margin: '0 auto',
              padding: '40px 24px 360px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '16px',
                alignItems: 'center',
                marginBottom: '28px',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  ThriveOps
                </div>
                <h1 className="heroTitle" style={{ fontSize: '40px', lineHeight: 1.1, margin: 0 }}>
                  <span className="heroFull">업무가 곧 커리어가 되는 실행 워크스페이스</span>
                  <span className="heroShort">워크스페이스</span>
                </h1>
                <style jsx>{`
                  .heroShort {
                    display: none;
                  }
                  @media (max-width: 640px) {
                    .heroFull {
                      display: none;
                    }
                    .heroShort {
                      display: inline;
                    }
                  }
                `}</style>
                <p style={{ margin: '10px 0 0', color: '#4b5563' }}>
                  업무·커리어·테크 지식을 한곳에 모아, 매일의 실행으로 업무 생산성과 개인의 커리어 성장을 함께 챙깁니다.
                </p>
              </div>

              {name ? (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => setShowIntent(true)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #c7d2fe',
                      background: '#eef2ff',
                      color: '#4338ca',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    설명
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #d1d5db',
                      background: '#ffffff',
                      color: '#111827',
                      cursor: 'pointer',
                    }}
                  >
                    로그아웃
                  </button>
                </div>
              ) : null}
            </div>

            <div
              style={{
                display: 'inline-flex',
                gap: '4px',
                padding: '4px',
                borderRadius: '14px',
                background: '#eef2f7',
                border: '1px solid #e5e7eb',
                marginBottom: '18px',
              }}
            >
              {([
                { key: 'work', label: '업무' },
                { key: 'career', label: '커리어' },
              ] as const).map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive ? '#111827' : 'transparent',
                      color: isActive ? '#ffffff' : '#4b5563',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    {tab.label}
                    {tab.key === 'career' && jobs.length > 0 ? ` · ${jobs.length}` : ''}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr)',
                gap: '18px',
                alignItems: 'start',
              }}
            >
              {activeTab === 'work' ? (
                <>
              <section
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 12px 40px rgba(15, 23, 42, 0.06)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '26px' }}>업무</h2>
                    <p style={{ margin: 0, color: '#6b7280' }}>
                      카드는 상태 칸으로 드래그하고, 파란 날짜를 클릭하면 일정을 바꿀 수 있습니다.
                    </p>
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      alignSelf: 'flex-start',
                      fontSize: '13px',
                      color: '#334155',
                    }}
                  >
                    총 {tasks.length}개
                  </div>
                </div>

                {error ? (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: '#fef2f2',
                      color: '#b91c1c',
                    }}
                  >
                    {error}
                  </div>
                ) : null}

                <div
                  style={{
                    marginTop: '18px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                    gap: '10px',
                  }}
                >
                  {(Object.keys(statusCopy) as TaskStatus[]).map((statusKey) => (
                    <section
                      key={statusKey}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => handleDropToStatus(statusKey)}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '16px',
                        padding: '16px',
                        background: '#fafafa',
                        minHeight: '220px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '10px',
                        }}
                      >
                        <strong>{statusCopy[statusKey]}</strong>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {tasksByStatus[statusKey].length}개
                        </span>
                      </div>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        {tasksByStatus[statusKey].map((task) => {
                          const relative = relativeDateLabel(task.date, todayKey);
                          const isOverdue = task.date < todayKey && task.status !== 'done';
                          return (
                            <article
                              key={task.id}
                              draggable
                              onDragStart={() => setDraggingTaskId(task.id)}
                              onDragEnd={() => setDraggingTaskId(null)}
                              onClick={() => openTaskEditor(task)}
                              title="클릭해서 상세 편집"
                              style={{
                                borderRadius: '12px',
                                border: '1px solid #d1d5db',
                                background: '#fff',
                                padding: '10px',
                                cursor: 'pointer',
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  gap: '8px',
                                }}
                              >
                                <strong style={{ fontSize: '14px' }}>{task.title}</strong>
                                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                  P{task.priority}
                                </span>
                              </div>
                              <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#4b5563' }}>
                                {task.description}
                              </p>
                              <div
                                style={{
                                  marginTop: '8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '8px',
                                }}
                              >
                                {editingDateId === task.id ? (
                                  <input
                                    type="date"
                                    defaultValue={task.date}
                                    autoFocus
                                    ref={(el) => {
                                      if (el) {
                                        el.focus();
                                        try {
                                          (el as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
                                        } catch {
                                          // showPicker는 사용자 제스처가 필요할 수 있어 실패를 무시합니다.
                                        }
                                      }
                                    }}
                                    onChange={(event) => {
                                      updateTaskDate(task.id, event.target.value);
                                      setEditingDateId(null);
                                    }}
                                    onBlur={() => setEditingDateId(null)}
                                    onClick={(event) => event.stopPropagation()}
                                    style={{
                                      fontSize: '12px',
                                      padding: '4px 6px',
                                      borderRadius: '8px',
                                      border: '1px solid #93c5fd',
                                      color: '#334155',
                                    }}
                                  />
                                ) : (
                                  <button
                                    type="button"
                                    title="클릭해서 일정 변경"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setEditingDateId(task.id);
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: 0,
                                      background: 'transparent',
                                      border: 'none',
                                      fontSize: '12px',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      textDecoration: 'underline dotted',
                                      textUnderlineOffset: '3px',
                                      color: isOverdue ? '#b91c1c' : '#2563eb',
                                    }}
                                  >
                                    {relative ? `${relative} · ` : ''}
                                    {formatDateLabel(task.date)}
                                  </button>
                                )}
                                <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                                  {task.space.toUpperCase()}
                                </span>
                              </div>
                            </article>
                          );
                        })}
                        {tasksByStatus[statusKey].length === 0 ? (
                          <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                            카드를 이 칸으로 드래그하세요.
                          </div>
                        ) : null}
                      </div>
                    </section>
                  ))}
                </div>
              </section>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    background: '#111827',
                    color: '#fff',
                    borderRadius: '20px',
                    padding: '20px',
                  }}
                >
                  <div style={{ fontSize: '13px', opacity: 0.8, marginBottom: '12px' }}>
                    날짜 현황
                  </div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ opacity: 0.85 }}>오늘 일정</span>
                      <strong style={{ fontSize: '22px' }}>{dateSummary.today}개</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ opacity: 0.85 }}>지난 미완료</span>
                      <strong style={{ fontSize: '22px', color: '#fca5a5' }}>{dateSummary.overdue}개</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span style={{ opacity: 0.85 }}>예정</span>
                      <strong style={{ fontSize: '22px' }}>{dateSummary.upcoming}개</strong>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '20px',
                    padding: '20px',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '10px' }}>AI 목표 요약</div>
                  <button
                    onClick={loadOverview}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#111827',
                      color: '#fff',
                      cursor: loading ? 'default' : 'pointer',
                    }}
                  >
                    {loading ? '불러오는 중...' : '요약 불러오기'}
                  </button>
                  <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
                    {(result?.goals ?? [
                      { space: 'work', top_task: null },
                      { space: 'career', top_task: null },
                      { space: 'tech', top_task: null },
                    ]).map((goal) => (
                      <div
                        key={goal.space}
                        style={{ padding: '10px', borderRadius: '10px', background: '#f9fafb' }}
                      >
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          {goal.space.toUpperCase()}
                        </div>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>
                          {goal.top_task?.title ?? '추천 업무 없음'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '20px',
                    padding: '20px',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '10px' }}>조작 가이드</div>
                  <ul style={{ margin: 0, paddingLeft: '18px', color: '#4b5563', lineHeight: 1.8 }}>
                    <li>카드 드래그: 상태 변경</li>
                    <li>파란 날짜 클릭: 일정 변경</li>
                    <li>하단 입력함: 붙여넣기·파일 드롭으로 티켓 등록</li>
                  </ul>
                </div>
              </div>
                </>
              ) : (
              <section
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 12px 40px rgba(15, 23, 42, 0.06)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <h2 style={{ margin: '0 0 8px', fontSize: '26px' }}>커리어</h2>
                    <p style={{ margin: 0, color: '#6b7280' }}>
                      관심 채용공고를 업무와 분리해 별도로 관리합니다. 링크나 “회사 - 직무”를 붙여넣어
                      직접 수집하세요.
                    </p>
                  </div>
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      alignSelf: 'flex-start',
                      fontSize: '13px',
                      color: '#334155',
                    }}
                  >
                    총 {jobs.length}건
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '16px',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '10px',
                    alignItems: 'center',
                  }}
                >
                  <textarea
                    value={jobDraft}
                    onChange={(event) => setJobDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        addJobPostings();
                      }
                    }}
                    placeholder="채용공고 URL 또는 '회사 - 직무'를 붙여넣기 (여러 줄 가능 · Enter 추가)"
                    rows={1}
                    style={{
                      width: '100%',
                      resize: 'none',
                      borderRadius: '12px',
                      border: '1px solid #d1d5db',
                      padding: '12px 14px',
                      fontSize: '14px',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={addJobPostings}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#15803d',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    수집
                  </button>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#9ca3af' }}>
                  정기 자동 수집은 외부 사이트 크롤링이 필요해 백엔드 연동 시 지원됩니다. 현재는 수동
                  수집을 제공합니다.
                </p>

                {jobs.length > 0 ? (
                  <div
                    style={{
                      marginTop: '18px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                      gap: '10px',
                    }}
                  >
                    {[...jobs]
                      .sort((a, b) =>
                        a.status === b.status
                          ? b.addedDate.localeCompare(a.addedDate)
                          : jobStatusOrder.indexOf(a.status) - jobStatusOrder.indexOf(b.status),
                      )
                      .map((job) => (
                        <article
                          key={job.id}
                          style={{
                            border: '1px solid #d1d5db',
                            borderRadius: '14px',
                            padding: '14px',
                            background: '#fafafa',
                            display: 'grid',
                            gap: '8px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '8px',
                            }}
                          >
                            <strong style={{ fontSize: '14px', lineHeight: 1.4 }}>{job.title}</strong>
                            <button
                              onClick={() => removeJob(job.id)}
                              aria-label="삭제"
                              style={{
                                flexShrink: 0,
                                border: 'none',
                                background: 'transparent',
                                color: '#9ca3af',
                                fontSize: '16px',
                                lineHeight: 1,
                                cursor: 'pointer',
                              }}
                            >
                              ×
                            </button>
                          </div>
                          {job.company ? (
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{job.company}</div>
                          ) : null}
                          {job.url ? (
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: '12px',
                                color: '#2563eb',
                                textDecoration: 'underline',
                                wordBreak: 'break-all',
                              }}
                            >
                              공고 열기 ↗
                            </a>
                          ) : null}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '8px',
                              marginTop: '2px',
                            }}
                          >
                            <select
                              value={job.status}
                              onChange={(event) =>
                                setJobStatus(job.id, event.target.value as JobStatus)
                              }
                              style={{
                                fontSize: '12px',
                                padding: '6px 8px',
                                borderRadius: '8px',
                                border: '1px solid #d1d5db',
                                background: '#fff',
                              }}
                            >
                              {jobStatusOrder.map((status) => (
                                <option key={status} value={status}>
                                  {jobStatusCopy[status]}
                                </option>
                              ))}
                            </select>
                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                              {formatDateLabel(job.addedDate)}
                            </span>
                          </div>
                        </article>
                      ))}
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: '18px',
                      padding: '20px',
                      borderRadius: '14px',
                      border: '1px dashed #d1d5db',
                      color: '#9ca3af',
                      fontSize: '13px',
                      textAlign: 'center',
                    }}
                  >
                    아직 수집한 채용공고가 없습니다. 위에 링크나 “회사 - 직무”를 붙여넣어 추가하세요.
                  </div>
                )}
              </section>
              )}
            </div>
          </section>

          <div
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 40,
              padding: '0 16px 16px',
              pointerEvents: 'none',
            }}
          >
            <section
              onDragOver={(event) => {
                event.preventDefault();
                setDropActive(true);
              }}
              onDragLeave={() => setDropActive(false)}
              onDrop={handleDropTickets}
              style={{
                pointerEvents: 'auto',
                maxWidth: '1180px',
                margin: '0 auto',
                background: '#0f172a',
                borderRadius: '22px',
                padding: '16px 20px',
                color: '#e2e8f0',
                border: dropActive ? '2px dashed #f59e0b' : '2px solid transparent',
                boxShadow: '0 24px 60px rgba(15, 23, 42, 0.28)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '12px',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#94a3b8',
                    }}
                  >
                    대화창
                  </span>
                  <h3 style={{ margin: '4px 0 0', fontSize: '18px', color: '#fff' }}>
                    하단 고정 · 티켓 입력함
                  </h3>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '12px' }}>
                <div
                  style={{
                    maxHeight: '140px',
                    overflowY: 'auto',
                    display: 'grid',
                    gap: '8px',
                    paddingRight: '4px',
                  }}
                >
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        justifySelf: message.role === 'user' ? 'end' : 'start',
                        maxWidth: '78%',
                        background:
                          message.role === 'user' ? '#2563eb' : 'rgba(148, 163, 184, 0.12)',
                        color: '#fff',
                        borderRadius:
                          message.role === 'user'
                            ? '18px 18px 4px 18px'
                            : '18px 18px 18px 4px',
                        padding: '10px 13px',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {message.text}
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '10px',
                    alignItems: 'center',
                  }}
                >
                  <textarea
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="업무·URL 붙여넣기, 여러 줄 입력, 파일 드롭으로 티켓 등록 (Enter 등록 · Shift+Enter 줄바꿈)"
                    rows={1}
                    style={{
                      width: '100%',
                      resize: 'none',
                      borderRadius: '14px',
                      border: '1px solid rgba(148, 163, 184, 0.28)',
                      background: 'rgba(15, 23, 42, 0.7)',
                      color: '#fff',
                      padding: '12px 16px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '14px',
                      border: 'none',
                      background: '#f59e0b',
                      color: '#111827',
                      fontWeight: 800,
                      cursor: 'pointer',
                      minWidth: '96px',
                    }}
                  >
                    등록
                  </button>
                </div>
              </div>
            </section>
          </div>

          {!name ? (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 60,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(4px)',
                padding: '20px',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '420px',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '20px',
                  padding: '28px',
                  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.25)',
                }}
              >
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  ThriveOps
                </div>
                <h2 style={{ fontSize: '26px', margin: '0 0 8px' }}>이름으로 로그인</h2>
                <p style={{ margin: '0 0 18px', color: '#4b5563', lineHeight: 1.6 }}>
                  이름만으로 사용자를 구분합니다. 화면 이동 없이 바로 시작합니다.
                </p>

                <form onSubmit={handleLogin}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                    이름
                  </label>
                  <input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '12px',
                      marginBottom: '12px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#111827',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    시작하기
                  </button>
                </form>

                {error ? (
                  <div
                    style={{
                      marginTop: '14px',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: '#fef2f2',
                      color: '#b91c1c',
                    }}
                  >
                    {error}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {showIntent ? (
            <div
              onClick={() => setShowIntent(false)}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 70,
                display: 'grid',
                placeItems: 'center',
                background: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(4px)',
                padding: '20px',
              }}
            >
              <div
                onClick={(event) => event.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '20px',
                  padding: '28px',
                  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.25)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>
                      ThriveOps · 설명
                    </div>
                    <h2 style={{ fontSize: '24px', margin: 0 }}>
                      매일의 업무를 생성형 AI로 커리어 성장으로 바꾸는 플랫폼
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowIntent(false)}
                    aria-label="닫기"
                    style={{
                      flexShrink: 0,
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      background: '#f9fafb',
                      color: '#374151',
                      fontSize: '18px',
                      lineHeight: 1,
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '16px', color: '#374151', lineHeight: 1.7 }}>
                  <p style={{ margin: 0 }}>
                    ThriveOps는 매일 반복하는 업무가 흩어져 사라지지 않고,
                    <strong> 생성형 AI</strong>의 도움을 받아 <strong>커리어 성장</strong>으로
                    제대로 누적되도록 돕는 생산성 플랫폼입니다.
                  </p>

                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '6px' }}>풀고자 하는 문제</div>
                    <ul style={{ margin: 0, paddingLeft: '18px' }}>
                      <li>오늘의 업무가 장기 커리어 발전과 연결되지 않습니다.</li>
                      <li>열심히 일해도 성장의 흔적이 데이터로 남지 않습니다.</li>
                      <li>배운 지식을 실무와 미래 역량으로 전환하기 어렵습니다.</li>
                    </ul>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '6px' }}>해결 방식</div>
                    <p style={{ margin: 0 }}>
                      떠오르는 일을 한 줄로 입력하면 생성형 AI가 업무·커리어·테크 지식을 통합 분석해,
                      오늘의 우선순위와 실행 플랜을 제안하고 매일의 실행을 성장 데이터로 정리합니다.
                    </p>
                  </div>

                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '6px' }}>지향하는 성장 루프</div>
                    <p style={{ margin: 0 }}>
                      매일의 업무 → 생성형 AI의 분석·코칭 → 지식 축적 → 커리어 역량으로 누적되는 선순환.
                      반복할수록 더 똑똑해지고, 업무가 곧 미래 성장의 자산이 됩니다.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowIntent(false)}
                  style={{
                    marginTop: '22px',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#111827',
                    color: '#ffffff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  닫기
                </button>
              </div>
            </div>
          ) : null}

          {editingTaskId && taskDraft ? (
            <div
              onClick={closeTaskEditor}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 80,
                background: 'rgba(15, 23, 42, 0.45)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
              }}
            >
              <div
                onClick={(event) => event.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: '520px',
                  maxHeight: '86vh',
                  overflowY: 'auto',
                  background: '#ffffff',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 30px 80px rgba(15, 23, 42, 0.35)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '12px',
                    marginBottom: '18px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px' }}>
                      업무 카드 편집
                    </div>
                    <h2 style={{ fontSize: '22px', margin: 0 }}>제목·내용·날짜·상태 수정</h2>
                  </div>
                  <button
                    onClick={closeTaskEditor}
                    aria-label="닫기"
                    style={{
                      flexShrink: 0,
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      background: '#f9fafb',
                      color: '#374151',
                      fontSize: '18px',
                      lineHeight: 1,
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '14px' }}>
                  <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#374151' }}>
                    제목
                    <input
                      type="text"
                      value={taskDraft.title}
                      onChange={(event) =>
                        setTaskDraft((prev) => (prev ? { ...prev, title: event.target.value } : prev))
                      }
                      autoFocus
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                      }}
                    />
                  </label>

                  <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#374151' }}>
                    내용
                    <textarea
                      value={taskDraft.description}
                      onChange={(event) =>
                        setTaskDraft((prev) =>
                          prev ? { ...prev, description: event.target.value } : prev,
                        )
                      }
                      rows={4}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        resize: 'vertical',
                      }}
                    />
                  </label>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: '12px',
                    }}
                  >
                    <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#374151' }}>
                      날짜
                      <input
                        type="date"
                        value={taskDraft.date}
                        onChange={(event) =>
                          setTaskDraft((prev) =>
                            prev ? { ...prev, date: event.target.value } : prev,
                          )
                        }
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px',
                        }}
                      />
                    </label>

                    <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#374151' }}>
                      상태
                      <select
                        value={taskDraft.status}
                        onChange={(event) =>
                          setTaskDraft((prev) =>
                            prev ? { ...prev, status: event.target.value as TaskStatus } : prev,
                          )
                        }
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px',
                          background: '#fff',
                        }}
                      >
                        <option value="todo">Todo</option>
                        <option value="doing">Doing</option>
                        <option value="done">Done</option>
                      </select>
                    </label>

                    <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#374151' }}>
                      우선순위
                      <select
                        value={taskDraft.priority}
                        onChange={(event) =>
                          setTaskDraft((prev) =>
                            prev
                              ? { ...prev, priority: Number(event.target.value) as 1 | 2 | 3 }
                              : prev,
                          )
                        }
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px',
                          background: '#fff',
                        }}
                      >
                        <option value={1}>P1 · 높음</option>
                        <option value={2}>P2 · 보통</option>
                        <option value={3}>P3 · 낮음</option>
                      </select>
                    </label>

                    <label style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#374151' }}>
                      분류
                      <select
                        value={taskDraft.space}
                        onChange={(event) =>
                          setTaskDraft((prev) =>
                            prev
                              ? { ...prev, space: event.target.value as PlannerTask['space'] }
                              : prev,
                          )
                        }
                        style={{
                          padding: '10px 12px',
                          borderRadius: '10px',
                          border: '1px solid #d1d5db',
                          fontSize: '14px',
                          background: '#fff',
                        }}
                      >
                        <option value="work">WORK</option>
                        <option value="career">CAREER</option>
                        <option value="tech">TECH</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: '22px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <button
                    onClick={() => deleteTask(taskDraft.id)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #fecaca',
                      background: '#fff1f2',
                      color: '#b91c1c',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    삭제
                  </button>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={closeTaskEditor}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        background: '#f9fafb',
                        color: '#374151',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      취소
                    </button>
                    <button
                      onClick={saveTaskDraft}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        background: '#111827',
                        color: '#ffffff',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      저장
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </main>
  );
}
