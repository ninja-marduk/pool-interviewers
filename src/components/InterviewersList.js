import React from 'react';
import './InterviewersList.css';
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from '../firebaseConfig';

function InterviewersList({ interviewers }) {
  // Función para alternar el estado del entrevistador
  const toggleStatus = async (interviewer) => {
    const newStatus = interviewer.status === 'active' ? 'inactive' : 'active';
    const interviewerRef = doc(firestore, "interviewers", interviewer.id);

    try {
      await updateDoc(interviewerRef, {
        status: newStatus
      });

      // Actualiza localmente el estado de los entrevistadores
      interviewer(interviewers.map(i => i.id === interviewer.id ? { ...i, status: newStatus } : i ));

      alert(`Status of ${interviewer.name} has been changed to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  // Ordenar los entrevistadores según seniority y nombre
  const sortedInterviewers = [...interviewers].sort((a, b) => {
    if (a.seniority === b.seniority) {
      return a.name.localeCompare(b.name);
    }
    return a.seniority === 'Old' ? -1 : 1;
  });

  return (
    <div className="interviewers-container">
      <h2>Interviewers List</h2>
      <table className="interviewers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Date Joined</th>
            <th>Seniority</th>
            <th>SO Mobile</th>
            <th>Interviews</th>
            <th>Date Last Interview</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedInterviewers.map((interviewer, index) => {
            const dateJoined = new Date(interviewer.dateJoined).toISOString().split('T')[0];
            const dateLastInterview = interviewer.dateLastInterview ? new Date(interviewer.dateLastInterview).toISOString().split('T')[0] : '';
            return (
              <tr key={index} onClick={() => toggleStatus(interviewer)} style={{ cursor: 'pointer' }}>
                <td>{interviewer.name}</td>
                <td>{interviewer.role}</td>
                <td>{dateJoined}</td>
                <td>{interviewer.seniority || 'N/A'}</td>
                <td>{interviewer.soMobile || 'N/A'}</td>
                <td>{interviewer.counter}</td>
                <td>{dateLastInterview}</td>
                <td>{interviewer.status}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default InterviewersList;
