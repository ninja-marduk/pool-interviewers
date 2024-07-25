// src/components/InterviewersForm.js
import React, { useState } from 'react';

function InterviewersForm({ addInterviewer, role }) {
  const [name, setName] = useState('');
  const [dateJoined, setDateJoined] = useState('');
  const [seniority, setSeniority] = useState('New');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const interviewer = {
      name,
      role,
      dateJoined,
      seniority: role === 'TL' ? seniority : undefined,
      counter: 0
    };
    await addInterviewer(interviewer);
    setName('');
    setDateJoined('');
    setSeniority('New');
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
