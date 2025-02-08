import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import { useNavigate, useParams } from "react-router-dom";
import { notifyPageError, notifyPageSuccess } from "../../hooks/useToast";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const AdminQuizPage = () => {
  const { eventId } = useParams(); // Access eventId from URL parameters
  interface Question {
    question: string;
    options: string[];
    correct: string;
  }
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [quizDuration, setQuizDuration] = useState(60);

  const navigate = useNavigate();

  useEffect(() => {
    
  }, [eventId]);

  const handleQuestionCountChange = (e: { target: { value: string; }; }) => {
    const count = parseInt(e.target.value) || 0;
    setQuestionCount(count);
    setQuestions(Array.from({ length: count }, () => ({ question: "", options: ["", "", "", ""], correct: "" })));
  };

  const handleQuizDurationChange = (e: { target: { value: string; }; }) => {
    setQuizDuration(parseInt(e.target.value) || 60);
  };

  const handleQuestionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].question = value;
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (index: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleCorrectOptionChange = (index: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].correct = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    console.log("eventId:", eventId);
    const insertData = {
      event_id: eventId,  // The eventId passed from URL params
      questionsno: questionCount,  // Number of questions in the quiz
      timetocomplete: quizDuration,  // Quiz duration
      questions: questions.map((q) => q.question),  // Store as an array of questions
    };
  
    const questionDetails = questions.map((q, index) => ({
      question_number: index + 1,  // The question number (1-based index)
      question_text: q.question,  // The question text
      option_a: q.options[0],  // Option A
      option_b: q.options[1],  // Option B
      option_c: q.options[2],  // Option C
      option_d: q.options[3],  // Option D
      correct_option: q.correct,  // The correct option (A/B/C/D)
    }));
  
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
    try {
      // First, insert into questionbank
      const { data: insertedQuestionBank, error: insertError } = await supabase
        .from("questionbank")
        .insert([insertData])
        .select("id")
        .single();
  
      if (insertError) {
        throw new Error("Error inserting into questionbank: " + insertError.message);
      }
  
      const questionBankId = insertedQuestionBank.id;
  
      // Now, insert the question details using the questionBankId
      const { error: detailsError } = await supabase
        .from("questions_details")
        .insert(
          questionDetails.map((detail) => ({
            ...detail,
            question_bank_id: questionBankId,// Link to the questionbank
            event_id : eventId,  
          }))
        );
  
      if (detailsError) {
        throw new Error("Error inserting into questions_details: " + detailsError.message);
      }
  
      // If everything is successful, notify success
      notifyPageSuccess("Quiz Created");
  
      // Reset state after successful submission
      setQuestionCount(0);
      setQuizDuration(60);
      setQuestions([]);
      navigate(`/admin/events`);  // Navigate back to events page
  
    } catch (error) {
      // If any error occurs, show error message to user
      if (error instanceof Error) {
        notifyPageError("Error creating quiz: " + error.message);
      } else {
        notifyPageError("Error creating quiz");
      }
    }
  };
  
  
  
  
  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8">
        <h1 className="text-3xl font-bold text-indigo-600 text-center">Admin - Create Quiz</h1>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-lg font-semibold text-gray-700">Number of Questions</label>
            <input
              type="number"
              value={questionCount}
              onChange={handleQuestionCountChange}
              className="mt-2 w-full p-3 border rounded-lg text-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-lg font-semibold text-gray-700">Quiz Duration (in minutes)</label>
            <input
              type="number"
              value={quizDuration}
              onChange={handleQuizDurationChange}
              className="mt-2 w-full p-3 border rounded-lg text-gray-700"
              required
            />
          </div>

          {questions.map((q, index) => (
            <div key={index} className="mt-4">
              <label className="block text-lg font-semibold text-gray-700">Question {index + 1}</label>
              <textarea
                value={q.question}
                onChange={(e) => handleQuestionChange(index, e.target.value)}
                rows={3}
                className="mt-2 w-full p-3 border rounded-lg text-gray-700"
                required
              />
              <label className="block text-lg font-semibold text-gray-700 mt-2">Options</label>
              {["A", "B", "C", "D"].map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2 mt-2">
                  <input
                    type="text"
                    placeholder={`Option ${option}`}
                    value={q.options[optionIndex]}
                    onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                    className="w-full p-3 border rounded-lg text-gray-700"
                    required
                  />
                  <input
                    type="radio"
                    name={`correctOption${index}`}
                    value={option}
                    checked={q.correct === option}
                    onChange={() => handleCorrectOptionChange(index, option)}
                    className="h-5 w-5"
                  />
                  <label className="text-gray-600">Correct</label>
                </div>
              ))}
            </div>
          ))}

          <div className="flex justify-between mt-6">
            <button
              type="reset"
              onClick={() => {
                setQuestionCount(0);
                setQuizDuration(60);
                setQuestions([]);
              }}
              className="px-6 py-3 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save Quiz
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminQuizPage;