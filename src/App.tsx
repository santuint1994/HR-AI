import React, { createContext, useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Candidates from './components/Candidates'
import Questionnaires from './components/Questionnaires';
import CandidateForm from './components/CandidateForm';
import InterviewQuestions from './components/InterviewQuestions';

interface AuthContextType {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const login = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            // element={token ? <Dashboard /> : <Navigate to="/login" replace />}
            element={token ? <Dashboard /> : <Dashboard />}
          />
          <Route
            path="/questionnaires"
            // element={token ? <Questionnaires /> : <Navigate to="/login" replace />}
            element={token ? <Questionnaires /> : <Questionnaires />}
          />
          <Route
            path="/candidates"
            // element={token ? <Candidates /> : <Navigate to="/login" replace />}
            element={token ? <Candidates /> : <Candidates />}
          />
          <Route
            path="/candidate-form"
            // element={token ? <CandidateForm /> : <Navigate to="/login" replace />}
            element={token ? <CandidateForm /> : <CandidateForm />}
          />
          <Route
            path="/interview-questions"
            // element={token ? <InterviewQuestions /> : <Navigate to="/login" replace />}
            element={token ? <InterviewQuestions /> : <InterviewQuestions />}
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

export default App;