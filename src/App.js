import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, increment } from "firebase/firestore";
import { firestore } from './firebaseConfig';
import InterviewersForm from './components/InterviewersForm';
import InterviewersList from './components/InterviewersList';
import './App.css';
import './components/PairsDisplay.css';
import './components/InterviewersList.css';

function App() {
  const [interviewers, setInterviewers] = useState([]);
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

  const getOldestInterviewer = (interviewers) => {
    // Filtrar primero los entrevistadores que no tienen fecha de última entrevista
    const noDateInterviewers = interviewers.filter(i => !i.dateLastInterview);
  
    // Si existen entrevistadores sin fecha de última entrevista, seleccionar uno de ellos
    if (noDateInterviewers.length > 0) {
      return noDateInterviewers[0]; // Seleccionar el primero en la lista
    }
  
    // Si todos los entrevistadores tienen fecha, seleccionar el que tiene la fecha más antigua
    return interviewers.reduce((oldest, interviewer) => {
      if (!oldest || new Date(interviewer.dateLastInterview) < new Date(oldest.dateLastInterview)) {
        return interviewer;
      }
      return oldest;
    }, null);
  };
  
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Mes en formato 2 dígitos
    const day = String(d.getDate()).padStart(2, '0'); // Día en formato 2 dígitos
    return `${year}-${month}-${day}`;
  };

  const calculateAverageCounter = (interviewers) => {
    if (interviewers.length === 0) return 0;
    const total = interviewers.reduce((sum, i) => sum + i.counter, 0);
    return total / interviewers.length;
  };

  const generateTLBack = async () => {
    const tlsBack = interviewers.filter(i => i.role === 'TL' && i.status === 'active');
    if (tlsBack.length === 0) {
      alert('No TL Back available');
      return;
    }
  
    const selectedTLBack = getOldestInterviewer(tlsBack);
  
    if (!selectedTLBack) {
      alert('Error selecting TL Back');
      return;
    }
  
    // Formatear la fecha antes de guardarla
    const formattedDate = formatDate(new Date());
  
    // Actualizar el contador y la fecha de última entrevista en Firestore
    const tlBackRef = doc(firestore, "interviewers", selectedTLBack.id);
  
    await updateDoc(tlBackRef, {
      counter: increment(1),
      dateLastInterview: formattedDate, // Guardar la fecha en formato yyyy-mm-dd
    });
  
    // Actualizar el estado
    settlBack({
      name: selectedTLBack.name,
      counter: selectedTLBack.counter + 1,
      dateLastInterview: formattedDate
    });
  };

  const generateExpert = async () => {
    const experts = interviewers.filter(i => i.role === 'Expert' && i.status === 'active');
    if (experts.length === 0) {
      alert('No experts available');
      return;
    }
  
    const selectedExpert = getOldestInterviewer(experts);
  
    if (!selectedExpert) {
      alert('Error selecting expert');
      return;
    }

    // Formatear la fecha antes de guardarla
    const formattedDate = formatDate(new Date());
  
    // Actualizar el contador y la fecha de última entrevista en Firestore
    const expertRef = doc(firestore, "interviewers", selectedExpert.id);
  
    await updateDoc(expertRef, {
      counter: increment(1),
      dateLastInterview: formattedDate, // Guardar la fecha en formato yyyy-mm-dd
    });
  
    // Actualizar el estado
    setExpert({
      name: selectedExpert.name,
      counter: selectedExpert.counter + 1,
      dateLastInterview: formattedDate
    });
  };
  

  const generateTlMobile = async (os) => {
    const tlMobile = interviewers.filter(i => i.role === 'TL Mobile' && i.soMobile === os && i.status === 'active');
    if (tlMobile.length === 0) {
      alert(`No TL Mobile available for ${os}`);
      return;
    }
  
    const selectedTlMobile = getOldestInterviewer(tlMobile);
  
    if (!selectedTlMobile) {
      alert(`Error selecting TL Mobile for ${os}`);
      return;
    }

    // Formatear la fecha antes de guardarla
    const formattedDate = formatDate(new Date());
  
    // Actualizar el contador y la fecha de última entrevista en Firestore
    const tlMobileRef = doc(firestore, "interviewers", selectedTlMobile.id);
  
    await updateDoc(tlMobileRef, {
      counter: increment(1),
      dateLastInterview: formattedDate,
    });
  
    // Actualizar el estado según el sistema operativo
    if (os === 'Android') {
      setTlMobileAndroid({
        name: selectedTlMobile.name,
        counter: selectedTlMobile.counter + 1,
        dateLastInterview: formattedDate
      });
    } else {
      setTlMobileIOS({
        name: selectedTlMobile.name,
        counter: selectedTlMobile.counter + 1,
        dateLastInterview: formattedDate
      });
    }
  }

  return (
    <div className="App">
      <h1>Credits - Pool Interviewers Generator V0.01</h1>
      <div className="averages">
        <p>Average Old Counter: {averageOldCounter.toFixed(2)}</p>
        <p>Average New Counter: {averageNewCounter.toFixed(2)}</p>
      </div>
      
      <div className="section">
        <h2>Team Leaders (TL)</h2>
        <InterviewersForm addInterviewer={addInterviewer} role="TL" />
        <button onClick={generateTLBack}>Select TL Backend</button>
        {tlBack && (
          <div className="pairs-container">
            <h2>Selected TL Backend</h2>
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
