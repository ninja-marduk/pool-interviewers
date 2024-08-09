import React from 'react';
import './InterviewersList.css';

function InterviewersList({ interviewers }) {
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
          </tr>
        </thead>
        <tbody>
          {sortedInterviewers.map((interviewer, index) => {
            const dateJoined = new Date(interviewer.dateJoined).toISOString().split('T')[0];
            const dateLastInterview = interviewer.dateLastInterview ? new Date(interviewer.dateLastInterview).toISOString().split('T')[0] : '';
            return (
              <tr key={index}>
                <td>{interviewer.name}</td>
                <td>{interviewer.role}</td>
                <td>{dateJoined}</td>
                <td>{interviewer.seniority || 'N/A'}</td>
                <td>{interviewer.soMobile || 'N/A'}</td>
                <td>{interviewer.counter}</td>
                <td>{dateLastInterview}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default InterviewersList;
