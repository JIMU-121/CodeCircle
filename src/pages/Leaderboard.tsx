import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useParams } from "react-router-dom";

const EventsLeaderboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const eventID = useParams();
  useEffect(() => {
    const fetchUserScores = async () => {
      setLoading(true);

      // Fetch authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        alert("User not found. Please login again.");
        setLoading(false);
        return;
      }

      // Fetch quiz submissions (score & time taken)
      const { data: quizData, error: quizError } = await supabase
        .from("quiz_submissions")
        .select("score, timetocomplete")
        .eq("user_id", user.id);

      if (quizError) {
        console.error("Error fetching quiz data:", quizError.message);
        setLoading(false);
        return;
      }

      console.log("Fetched quiz data:", quizData); // Debugging

      setSubmissions(quizData);
      setLoading(false);
    };

    fetchUserScores();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-6">Your Past Scores</h2>
      {loading ? (
        <div className="text-center text-lg">Loading...</div>
      ) : submissions.length === 0 ? (
        <div className="text-center text-lg">No scores available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="py-3 px-6 text-center">Score</th>
                <th className="py-3 px-6 text-center">Time Taken (sec)</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="py-3 px-6 text-center font-semibold text-blue-600">
                    {submission.score ?? "N/A"}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {submission.timetocomplete ?? "N/A"} sec
                  </td>
                  {/* <td className="py-3 px-6 text-center font-semibold text-blue-600">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    onClick={() => window.location.href = `/certificate/${eventID}`}>
                      Generate Certificate
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EventsLeaderboard;
