import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { firestore } from './firebaseConfig';
import InterviewersForm from './components/InterviewersForm';
import PairsDisplay from './components/PairsDisplay';
import InterviewersList from './components/InterviewersList';
import './App.css';
import './components/PairsDisplay.css';
import './components/InterviewersList.css';

function App() {
  const [interviewers, setInterviewers] = useState([]);
  const [pairs, setPairs] = useState([]);
  const [averageOldCounter, setAverageOldCounter] = useState(0);
  const [averageNewCounter, setAverageNewCounter] = useState(0);
  const [tlBack, settlBack] = useState(null);
  const [expert, setExpert] = useState(null);
  const [tlMobileAndroid, setTlMobileAndroid] = useState(null);
  const [tlMobileIOS, setTlMobileIOS] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "interviewers"), (snapshot) => {
      const interviewersData = snapshot.docs.map(doc => ({
        id: doc.id,
        counter: doc.data().counter || 0,
        dateLastInterview: doc.data().dateLastInterview || null,
        ...doc.data()
      }));
      setInterviewers(interviewersData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const tlNew = interviewers.filter(i => i.role === 'TL' && i.seniority === 'New');
    const tlOld = interviewers.filter(i => i.role === 'TL' && i.seniority === 'Old');
    setAverageNewCounter(calculateAverageCounter(tlNew));
    setAverageOldCounter(calculateAverageCounter(tlOld));
  }, [interviewers]);

  const addInterviewer = async (interviewer) => {
    try {
      await addDoc(collection(firestore, "interviewers"), interviewer);
    } catch (error) {
      console.error("Error adding interviewer: ", error);
    }
  };

  const weightedRandomInterviewer = (interviewers) => {
    const today = new Date();
  const weights = interviewers.map(interviewer => {
    if (interviewer.dateLastInterview) {
      const daysSinceLastInterview = (today - new Date(interviewer.dateLastInterview)) / (1000 * 60 * 60 * 24);
      const timeFactor = daysSinceLastInterview > 0 ? daysSinceLastInterview : 1; // Evita división por cero
      return (1 / (interviewer.counter + 1)) * timeFactor; // Penaliza a entrevistadores con fechas más recientes
    } else {
      // Si dateLastInterview es null, no penalizar
      return 1 / (interviewer.counter + 1);
    }
  });

  const sumOfWeights = weights.reduce((a, b) => a + b, 0);
  const random = Math.random() * sumOfWeights;

  let runningSum = 0;
  for (let i = 0; i < interviewers.length; i++) {
    runningSum += weights[i];
    if (random < runningSum) {
      return interviewers[i];
    }
  }
  return interviewers[0]; // Fallback, debería retornar aquí solo en caso de error
  };

  const calculateAverageCounter = (interviewers) => {
    if (interviewers.length === 0) return 0;
    const total = interviewers.reduce((sum, i) => sum + i.counter, 0);
    return total / interviewers.length;
  };
/*
  const generatePairsTL = async () => {
    const tlNew = interviewers.filter(i => i.role === 'TL' && i.seniority === 'New');
    const tlOld = interviewers.filter(i => i.role === 'TL' && i.seniority === 'Old');

    if (tlOld.length < 2 && tlNew.length === 0) {
      alert('Not enough interviewers to generate pairs');
      return;
    }

    const averageOldCounter = calculateAverageCounter(tlOld);
    const averageNewCounter = calculateAverageCounter(tlNew);

    let newInterviewer, oldInterviewer;

    if (averageOldCounter > averageNewCounter && tlNew.length > 0) {
      // Prioritize Old & New
      newInterviewer = weightedRandomInterviewer(tlNew);
      oldInterviewer = weightedRandomInterviewer(tlOld);
    } else {
      // Prioritize Old & Old
      oldInterviewer = weightedRandomInterviewer(tlOld);
      newInterviewer = weightedRandomInterviewer(tlOld.filter(i => i.id !== oldInterviewer.id));
    }

    if (!newInterviewer || !oldInterviewer) {
      alert('Error generating pairs');
      return;
    }

    // Actualizar los contadores en Firestore y la fecha de última entrevista
    const newInterviewerRef = doc(firestore, "interviewers", newInterviewer.id);
    const oldInterviewerRef = doc(firestore, "interviewers", oldInterviewer.id);
    const currentDate = new Date().toISOString().split('T')[0]; // Fecha actual

    await updateDoc(newInterviewerRef, {
      counter: increment(1),
      dateLastInterview: currentDate
    });

    await updateDoc(oldInterviewerRef, {
      counter: increment(1),
      dateLastInterview: currentDate
    });

    // Crear el par y actualizar el estado
    const newPair = {
      new: `${newInterviewer.name} [${newInterviewer.seniority}]`,
      old: `${oldInterviewer.name} [${oldInterviewer.seniority}]`
    };
    setPairs([newPair]);
  };
  */

  const generateTLBack = async () => {
    const tlsBack = interviewers.filter(i => i.role === 'TL')
    if (tlsBack.length === 0) {
      alert('No TL Back available');
      return;
    }

    const selectedTLBack = weightedRandomInterviewer(tlsBack);

    if (!selectedTLBack) {
      alert('Error selecting TL Back');
      return;
    }

    // Actualizar el contador y la fecha de última entrevista en Firestore
    const tlBackRef = doc(firestore, "interviewers", selectedTLBack.id);

    await updateDoc(tlBackRef, {
      counter: increment(1),
      dateLastInterview: new Date().toISOString().split('T')[0],
    });

    // Actualizar el estado
    settlBack({
      name: selectedTLBack.name,
      counter: selectedTLBack.counter + 1,
      dateLastInterview: selectedTLBack.dateLastInterview
    });
  };

  const generateExpert = async () => {
    const experts = interviewers.filter(i => i.role === 'Expert');
    if (experts.length === 0) {
      alert('No experts available');
      return;
    }

    const selectedExpert = weightedRandomInterviewer(experts);

    if (!selectedExpert) {
      alert('Error selecting expert');
      return;
    }

    // Actualizar el contador y la fecha de última entrevista en Firestore
    const expertRef = doc(firestore, "interviewers", selectedExpert.id);

    await updateDoc(expertRef, {
      counter: increment(1),
      dateLastInterview: new Date().toISOString().split('T')[0],
    });

    // Actualizar el estado
    setExpert({
      name: selectedExpert.name,
      counter: selectedExpert.counter + 1,
      dateLastInterview: selectedExpert.dateLastInterview
    });
  };

  const generateTlMobile = async (os) => {
    const tlMobile = interviewers.filter(i => i.role === 'TL Mobile' && i.soMobile === os);
    if (tlMobile.length === 0) {
      alert(`No TL Mobile available for ${os}`);
      return;
    }

    const selectedTlMobile = weightedRandomInterviewer(tlMobile);

    if (!selectedTlMobile) {
      alert(`Error selecting TL Mobile for ${os}`);
      return;
    }

    // Actualizar el contador en Firestore
    const tlMobileRef = doc(firestore, "interviewers", selectedTlMobile.id);

    await updateDoc(tlMobileRef, {
      counter: increment(1),
      dateLastInterview: new Date().toISOString().split('T')[0],
    });

    // Actualizar el estado
    if (os === 'Android') {
      setTlMobileAndroid({
        name: selectedTlMobile.name,
        counter: selectedTlMobile.counter + 1,
        dateLastInterview: selectedTlMobile.dateLastInterview
      });
    } else {
      setTlMobileIOS({
        name: selectedTlMobile.name,
        counter: selectedTlMobile.counter + 1,
        dateLastInterview: selectedTlMobile.dateLastInterview
      });
    }
  };

  return (
    <div className="App">
      <h1>Credits - Pool Interviewers Generator</h1>
      <div className="averages">
        <p>Average Old Counter: {averageOldCounter.toFixed(2)}</p>
        <p>Average New Counter: {averageNewCounter.toFixed(2)}</p>
      </div>
      
      <div className="section">
        <h2>Team Leaders (TL)</h2>
        <InterviewersForm addInterviewer={addInterviewer} role="TL" />
        <button onClick={generateTLBack}>Select TL Backend</button>
        {/* <PairsDisplay pairs={pairs} /> */}
        {tlBack && (
          <div className="pairs-container">
            <h2>Selected Expert</h2>
            <ul>
              <li className="selected-expert-item">
                {tlBack.name} - Interviews: {tlBack.counter}
              </li>
            </ul>
          </div>
        )}
        <InterviewersList interviewers={interviewers.filter(i => i.role === 'TL')} />
      </div>
      
      <div className="section">
        <h2>Experts</h2>
        <InterviewersForm addInterviewer={addInterviewer} role="Expert" />
        <button onClick={generateExpert}>Select Expert</button>
        {expert && (
          <div className="pairs-container">
            <h2>Selected Expert</h2>
            <ul>
              <li className="selected-expert-item">
                {expert.name} - Interviews: {expert.counter}
              </li>
            </ul>
          </div>
        )}
        <InterviewersList interviewers={interviewers.filter(i => i.role === 'Expert')} />
      </div>
      
      <div className="section">
        <h2>TL Mobile</h2>
        <InterviewersForm addInterviewer={addInterviewer} role="TL Mobile" />
        <button onClick={() => generateTlMobile('Android')}>Select TL Mobile for Android</button>
        <button onClick={() => generateTlMobile('iOS')}>Select TL Mobile for iOS</button>
        {tlMobileAndroid && (
          <div className="pairs-container">
            <h2>Selected TL Mobile for Android</h2>
            <ul>
              <li className="selected-expert-item">
                {tlMobileAndroid.name} - Interviews: {tlMobileAndroid.counter}
              </li>
            </ul>
          </div>
        )}
        {tlMobileIOS && (
          <div className="pairs-container">
            <h2>Selected TL Mobile for iOS</h2>
            <ul>
              <li className="selected-expert-item">
                {tlMobileIOS.name} - Interviews: {tlMobileIOS.counter}
              </li>
            </ul>
          </div>
        )}
        <InterviewersList interviewers={interviewers.filter(i => i.role === 'TL Mobile')} />
      </div>
    </div>
  );
}

export default App;
