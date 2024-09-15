import React, { useState } from 'react';

function InterviewersForm({ addInterviewer, role }) {
  const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Mes en formato 2 dígitos
    const day = String(d.getDate()).padStart(2, '0'); // Día en formato 2 dígitos
    return `${year}-${month}-${day}`;
  };

  const [name, setName] = useState('');
  const [dateJoined, setDateJoined] = useState('');
  const [seniority, setSeniority] = useState('New');
  const [soMobile, setSoMobile] = useState('Android');
  const [dateLastInterview, setDateLastInterview] = useState(formatDate(new Date())); // Nuevo estado para la fecha de la última entrevista

  const handleSubmit = async (e) => {
    e.preventDefault();
    const interviewer = {
      name,
      role,
      dateJoined,
      counter: 0,
      dateLastInterview,
      status: 'active' // Establece el estado por defecto en 'active'
    };

    if (role === 'TL') {
      interviewer.seniority = seniority;
    }

    if (role === 'TL Mobile') {
      interviewer.soMobile = soMobile;
    }

    await addInterviewer(interviewer);
    setName('');
    setDateJoined('');
    setSeniority('New');
    setSoMobile('Android');
    setDateLastInterview(new Date());

  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        placeholder="Name" 
        value={name} 
        onChange={(e) => setName(e.target.value)} 
        required 
      />
      {role === 'TL' && (
        <select value={seniority} onChange={(e) => setSeniority(e.target.value)}>
          <option value="New">New</option>
          <option value="Old">Old</option>
        </select>
      )}
      {role === 'TL Mobile' && (
        <select value={soMobile} onChange={(e) => setSoMobile(e.target.value)}>
          <option value="Android">Android</option>
          <option value="iOS">iOS</option>
        </select>
      )}
      <input 
        type="date" 
        value={dateJoined} 
        onChange={(e) => setDateJoined(e.target.value)} 
        required 
      />
      <button type="submit">Add {role}</button>
    </form>
  );
}

export default InterviewersForm;
