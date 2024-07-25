// src/App.js
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

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(firestore, "interviewers"), (snapshot) => {
      const interviewersData = snapshot.docs.map(doc => ({
        id: doc.id,
        counter: doc.data().counter || 0,
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
    const weights = interviewers.map(interviewer => 1 / (interviewer.counter + 1));
    const sumOfWeights = weights.reduce((a, b) => a + b, 0);
    const random = Math.random() * sumOfWeights;

    let runningSum = 0;
    for (let i = 0; i < interviewers.length; i++) {
      runningSum += weights[i];
      if (random < runningSum) {
        return interviewers[i];
      }
    }
    return interviewers[0];  // Fallback, should not reach here
  };

  const calculateAverageCounter = (interviewers) => {
    if (interviewers.length === 0) return 0;
    const total = interviewers.reduce((sum, i) => sum + i.counter, 0);
    return total / interviewers.length;
  };

  const generatePairs = async () => {
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

    // Actualizar los contadores en Firestore
    const newInterviewerRef = doc(firestore, "interviewers", newInterviewer.id);
    const oldInterviewerRef = doc(firestore, "interviewers", oldInterviewer.id);

    await updateDoc(newInterviewerRef, {
      counter: increment(1)
    });

    await updateDoc(oldInterviewerRef, {
      counter: increment(1)
    });

    // Crear el par y actualizar el estado
    const newPair = {
      new: `${newInterviewer.name} [${newInterviewer.seniority}]`,
      old: `${oldInterviewer.name} [${oldInterviewer.seniority}]`
    };
    setPairs([newPair]);
  };

  return (
    <div className="App">
      <h1>Pool Interviewers Pairs Generator</h1>
      <div className="averages">
        <p>Average Old Counter: {averageOldCounter.toFixed(2)}</p>
        <p>Average New Counter: {averageNewCounter.toFixed(2)}</p>
      </div>
      <InterviewersForm addInterviewer={addInterviewer} />
      <button onClick={generatePairs}>Generate Pairs</button>
      <PairsDisplay pairs={pairs} />
      <InterviewersList interviewers={interviewers} />
    </div>
  );
}

export default App;
