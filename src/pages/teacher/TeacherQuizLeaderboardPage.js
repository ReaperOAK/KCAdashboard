
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QuizApi } from '../../api/quiz';
import { FaTrophy } from 'react-icons/fa';


function formatTime(seconds) {
  if (!seconds && seconds !== 0) return '-';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

const LoadingSkeleton = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent" aria-label="Loading leaderboard" />
  </div>
);


const LeaderboardTable = React.memo(function LeaderboardTable({ leaderboard }) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-light overflow-hidden transition-all duration-200">
      <div className="p-6 border-b border-gray-light bg-background-light">
        <h2 className="text-xl font-bold text-primary">Quiz Leaderboard</h2>
      </div>
      <div className="p-0 sm:p-6">
        {leaderboard.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-light bg-primary text-white text-sm uppercase">
                  <th className="py-2 px-4 text-left">Rank</th>
                  <th className="py-2 px-4 text-left">Student</th>
                  <th className="py-2 px-4 text-left">Score</th>
                  <th className="py-2 px-4 text-left">Time</th>
                  <th className="py-2 px-4 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  let rowBg = '';
                  let badge = null;
                  if (index === 0) {
                    rowBg = 'bg-yellow-50';
                    badge = <span className="inline-flex items-center px-2 py-1 bg-accent text-white rounded-full text-xs font-semibold mr-2"><FaTrophy className="text-yellow-400 mr-1" aria-hidden="true" />1</span>;
                  } else if (index === 1) {
                    rowBg = 'bg-gray-100';
                    badge = <span className="inline-flex items-center px-2 py-1 bg-secondary text-white rounded-full text-xs font-semibold mr-2"><FaTrophy className="text-gray-300 mr-1" aria-hidden="true" />2</span>;
                  } else if (index === 2) {
                    rowBg = 'bg-amber-100';
                    badge = <span className="inline-flex items-center px-2 py-1 bg-highlight text-white rounded-full text-xs font-semibold mr-2"><FaTrophy className="text-amber-700 mr-1" aria-hidden="true" />3</span>;
                  }
                  return (
                    <tr
                      key={index}
                      className={`border-b border-gray-light transition-colors duration-150 hover:bg-gray-light/60 focus-within:bg-accent/10 ${rowBg}`}
                      tabIndex={0}
                      aria-label={`Rank ${index + 1}, Student ${entry.student_name}, Score ${entry.score}`}
                    >
                      <td className="py-2 px-4 font-semibold">
                        {badge || index + 1}
                      </td>
                      <td className="py-2 px-4 text-text-dark">{entry.student_name}</td>
                      <td className="py-2 px-4 text-primary font-bold">{entry.score}</td>
                      <td className="py-2 px-4 text-gray-dark">{formatTime(entry.time_taken)}</td>
                      <td className="py-2 px-4 text-gray-dark">{new Date(entry.completed_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-dark py-4">No leaderboard data available yet.</p>
        )}
      </div>
    </div>
  );
});

const TeacherQuizLeaderboardPage = () => {
  const { id } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardData = await QuizApi.getQuizLeaderboard(id);
        setLeaderboard(leaderboardData.leaderboard);
      } catch (error) {
        setLeaderboard([]);
      }
      setLoading(false);
    };
    fetchLeaderboard();
  }, [id]);


  if (loading) return (
    <div className="p-8 text-center">
      <LoadingSkeleton />
    </div>
  );

  return (
    <div className="min-h-screen bg-background-light px-2 sm:px-4 md:px-8 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <LeaderboardTable leaderboard={leaderboard} />
      </div>
    </div>
  );
};

export default TeacherQuizLeaderboardPage;
