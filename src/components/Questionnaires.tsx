import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/Questionnaires.css';

interface Questionnaire {
  question: string;
  // Add more fields as per API response
}

const Questionnaires: React.FC = () => {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('questionnaires');
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuestionnaires(JSON.parse(data));
      localStorage.removeItem('questionnaires'); // Clean up
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="questionnaires-container">
      <h2>Questionnaires</h2>
      <ul>
        {questionnaires.map((q, index) => (
          <li key={index}>{q.question}</li>
        ))}
      </ul>
      <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
    </div>
  );
};

export default Questionnaires;