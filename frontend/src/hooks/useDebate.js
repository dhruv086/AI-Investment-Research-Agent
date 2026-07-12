import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const API_BASE = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

export default function useDebate() {
  // Input states
  const [company, setCompany] = useState('');
  const [riskProfile, setRiskProfile] = useState('Balanced');
  
  // App execution states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(1); // 1: Research, 2: Parallel Agents, 3: Judge
  const [step, setStep] = useState(0); // 0: Idle, 1: Running, 4: Complete
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Data states
  const [resultData, setResultData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [dbStatus, setDbStatus] = useState('Checking'); // 'Online' | 'Offline'
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch session history list on load
  const fetchSessions = async () => {
    try {
      const response = await fetch(`${API_BASE}/sessions`);
      if (response.status === 503) {
        setDbStatus('Offline');
        setSessions([]);
        return;
      }
      if (!response.ok) throw new Error('Failed to load past sessions');
      const data = await response.json();
      setSessions(data);
      setDbStatus('Online');
    } catch (err) {
      console.warn("MongoDB is offline or disconnected:", err.message);
      setDbStatus('Offline');
      setSessions([]);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Run the debate graph
  const triggerDebate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!company) return;

    setIsLoading(true);
    setErrorMsg(null);
    setResultData(null);
    setStep(1);
    setLoadingStep(1);

    // Simulate loading steps visually since the backend API is a single HTTP request
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < 3) return prev + 1;
        return prev;
      });
    }, 3500);

    try {
      const response = await fetch(`${API_BASE}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName: company, riskProfile })
      });

      clearInterval(stepInterval);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to complete committee debate');
      }

      setResultData(data);
      setSelectedSessionId(data.sessionId);
      setStep(4); // Complete
      setIsLoading(false);

      // Trigger confetti on positive catalyst
      if (data.verdict === 'Invest') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#c084fc', '#6366f1', '#10b981']
        });
      }

      // Refresh list
      fetchSessions();
    } catch (err) {
      clearInterval(stepInterval);
      console.error(err);
      setErrorMsg(err.message);
      setStep(0);
      setIsLoading(false);
    }
  };

  // Reopen a session from history
  const loadPastSession = async (id) => {
    setIsLoading(true);
    setErrorMsg(null);
    setResultData(null);
    setStep(1);
    setLoadingStep(3); // Direct load
    setSelectedSessionId(id);

    try {
      const response = await fetch(`${API_BASE}/sessions/${id}`);
      if (!response.ok) {
        throw new Error('Failed to retrieve past session details');
      }
      const data = await response.json();
      setResultData(data);
      setStep(4);
      setIsLoading(false);

      if (data.verdict === 'Invest') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#c084fc', '#6366f1', '#10b981']
        });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
      setStep(0);
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCompany('');
    setResultData(null);
    setSelectedSessionId(null);
    setStep(0);
  };

  return {
    company,
    setCompany,
    riskProfile,
    setRiskProfile,
    isLoading,
    loadingStep,
    step,
    errorMsg,
    resultData,
    sessions,
    dbStatus,
    selectedSessionId,
    sidebarOpen,
    setSidebarOpen,
    triggerDebate,
    loadPastSession,
    resetForm,
    fetchSessions
  };
}
