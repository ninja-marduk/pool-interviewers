// src/components/InterviewersForm.js
import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';

function InterviewersForm({ addInterviewer }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('TL');
  const [dateJoined, setDateJoined] = useState('');
  const [seniority, setSeniority] = useState('New');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const interviewer = {
      name,
      role,
      dateJoined: dateJoined,
      seniority,
      counter: 0
    };
    await addInterviewer(interviewer);
    setName('');
    setRole('TL');
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
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="TL">TL</option>
        <option value="Expert">Expert</option>
        <option value="TL Mobile">TL Mobile</option>
      </select>
      <input 
        type="date" 
        value={dateJoined} 
        onChange={(e) => setDateJoined(e.target.value)} 
        required 
      />
      <select value={seniority} onChange={(e) => setSeniority(e.target.value)}>
        <option value="New">New</option>
        <option value="Old">Old</option>
      </select>
      <button type="submit">Add Interviewer</button>
    </form>
  );
}

export default InterviewersForm;
