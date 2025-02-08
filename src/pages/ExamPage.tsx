import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useParams } from "react-router-dom";

const QuizWithTimer = () => {
  const { eventId } = useParams();
  interface Question {
    id: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: string;
  }
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  useEffect(() => {
    const checkQuizSubmission = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert("User not found. Please login again.");
        return;
      }

      const userId = user.id;
      const { data, error } = await supabase
        .from("quiz_submissions")
        .select("id")
        .eq("user_id", userId)
        .eq("event_id", eventId)
        // .single()
        .maybeSingle(); // Use maybeSingle to handle empty responses
        

      if (data) {
        setQuizSubmitted(true);
        alert("You have already submitted this quiz.");
      }
    };

    checkQuizSubmission();
  }, [eventId]);

  const fetchTimerValue = async () => {
    try {
      const { data, error } = await supabase
        .from("questionbank")
        .select("timetocomplete")
        .eq("event_id", eventId)
        .single();

      if (error) throw error;

      const quizDuration = data?.timetocomplete > 0 ? data.timetocomplete * 60 : 10 * 60;
      const storedStartTime = localStorage.getItem(`quizStartTime_${eventId}`);

      if (storedStartTime) {
        const elapsedTime = Math.floor((Date.now() - parseInt(storedStartTime)) / 1000);
        return Math.max(quizDuration - elapsedTime, 0);
      } else {
        localStorage.setItem(`quizStartTime_${eventId}`, Date.now().toString());
        return quizDuration;
      }
    } catch (error) {
      console.error("Error fetching timer value:", error.message);
      return 10 * 60;
    }
  };

  // useEffect(() => {
  //   if (quizSubmitted) return;

  //   const fetchQuestions = async () => {
  //     setLoading(true);
  //     try {
  //       const timerValue = await fetchTimerValue();
  //       setTimeLeft(timerValue);

  //       const { data, error } = await supabase
  //         .from("questions_details")
  //         .select("*")
  //         .eq("event_id", eventId);

  //       if (error) throw error;
  //       setQuestions(data);
  //     } catch (error) {
  //       console.error("Error fetching questions:", error.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchQuestions();
  // }, [eventId, quizSubmitted]);
  useEffect(() => {
    if (quizSubmitted) return; // Avoid fetching if quiz is submitted
  
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const timerValue = await fetchTimerValue(); // Make sure this function works correctly
        setTimeLeft(timerValue);
  
        const { data, error } = await supabase
          .from("questions_details")
          .select("*")
          .eq("event_id", eventId);
  
        if (error) {
          throw new Error(error.message); // Throwing the error with a specific message
        }
        
        // Check if data is not empty
        if (data && data.length > 0) {
          setQuestions(data);
        } else {
          console.log("No questions found for this event");
        }
      } catch (error) {
        console.error("Error fetching questions:", error.message);
        // You can also set an error state here to display an error message on the UI
      } finally {
        setLoading(false);
      }
    };
  
    fetchQuestions();
  }, [eventId, quizSubmitted]); // Dependency on eventId and quizSubmitted
  
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleOptionSelect = (option) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: option,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // const submitQuiz = async () => {
  //   if (!questions || questions.length === 0 || quizSubmitted) return;

  //   const { data: { user }, error: authError } = await supabase.auth.getUser();
  //   if (authError || !user) {
  //     alert("User not found. Please login again.");
  //     return;
  //   }

  //   const userId = user.id;
  //   const quizStartTime = localStorage.getItem(`quizStartTime_${eventId}`);
  //   if (!quizStartTime) return;

  //   const timeTaken = Math.floor((Date.now() - parseInt(quizStartTime)) / 1000);
  //   let score = 0;

  //   questions.forEach((question) => {
  //     if (question.correct_option === userAnswers[question.id]) {
  //       score += 1;
  //     }
  //   });

  //   try {
  //     const { error } = await supabase.from("quiz_submissions").insert([
  //       {
  //         user_id: userId,
  //         event_id: eventId,
  //         score: score,
  //         timetocomplete: timeTaken,
  //       },
  //     ]);

  //     if (error) throw error;

  //     await supabase
  //       .from("event_participants")
  //       .update({ attendance_status: true })
  //       .eq("user_id", userId)
  //       .eq("event_id", eventId);

  //     alert("Quiz submitted successfully!");
  //     setQuizSubmitted(true);
  //     localStorage.removeItem(`quizStartTime_${eventId}`);
  //     window.location.href = `/leaderboard/${eventId}`;
  //   } catch (error) {
  //     console.error("Error submitting quiz:", error.message);
  //     alert("Failed to submit quiz.");
  //   }
  // };
  const submitQuiz = async () => {
    if (!questions || questions.length === 0 || quizSubmitted) return;
  
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      alert("User not found. Please login again.");
      return;
    }
  
    const userId = user.id;
    const quizStartTime = localStorage.getItem(`quizStartTime_${eventId}`);
    if (!quizStartTime) return;
  
    const timeTaken = Math.floor((Date.now() - parseInt(quizStartTime)) / 1000);
    
    // Calculate score
let score = 0;
console.log("User Answers:", userAnswers);
console.log("Questions:", questions);

// Iterate through questions and check user answers
for (let question of questions) {
  console.log("Checking question:", question);
  // Access the user's answer for the current question
  let userAnswer = userAnswers[question.id];
  console.log("User Answer:", userAnswer);
  console.log("Correct answer:", question.correct_option);

  // Normalize both answers for comparison (case-insensitive and trim)
  if (userAnswer?.trim().toLowerCase() === question.correct_option?.trim().toLowerCase()) {
    score += 1;
  }
}

console.log("Final Score:", score);

    
    console.log(score);
    
    try {
      // Insert score into database
      const { error } = await supabase.from("quiz_submissions").insert([
        {
          user_id: userId,
          event_id: eventId,
          score: score,
          timetocomplete: timeTaken,
        },
      ]);
  
      if (error) throw error;
  
      // Update attendance status
      await supabase
        .from("event_participants")
        .update({ attendance_status: true })
        .eq("user_id", userId)
        .eq("event_id", eventId);
  
      alert("Quiz submitted successfully!");
      setQuizSubmitted(true);
      localStorage.removeItem(`quizStartTime_${eventId}`);
      window.location.href = `/leaderboard/${eventId}`;
      
    } catch (error) {
      console.error("Error submitting quiz:", error.message);
      alert("Failed to submit quiz. Please try again later.");
    }
  };
  

  if (quizSubmitted) return <div className="text-center text-lg mt-10">You have already submitted this quiz.</div>;
  if (loading) return <div className="text-center text-lg mt-10">Loading quiz...</div>;
  if (questions.length === 0) return <div className="text-center text-lg mt-10">No questions available for this event.</div>;

  const currentQ = questions[currentQuestion];
  const options = [currentQ?.option_a, currentQ?.option_b, currentQ?.option_c, currentQ?.option_d].filter(Boolean);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Quiz</h2>
        <p className="text-lg font-semibold">Time Left: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}</p>

        <div className="bg-gray-100 p-4 rounded-md shadow-sm">
          <p className="text-lg font-semibold">{currentQ?.question_text}</p>
        </div>

        <div className="mt-4">
          {options.map((option, index) => (
            <button
              key={index}
              className={`w-full text-left p-3 border rounded-md my-2 transition-all duration-200 ${userAnswers[currentQ.id] === option ? "bg-blue-500 text-white border-blue-500" : "bg-white hover:bg-blue-100"}`}
              onClick={() => handleOptionSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
            disabled={currentQuestion === 0}
            onClick={handlePrevious}
          >
            ⬅ Previous
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={handleNext}
          >
            {currentQuestion < questions.length - 1 ? "Next ➡" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizWithTimer;
