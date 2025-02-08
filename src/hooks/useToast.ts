// 
// import React, { useState } from "react";

// const CreateQuiz = () => {
//   const [question, setQuestion] = useState("");
//   const [options, setOptions] = useState({ A: "", B: "", C: "", D: "" });
//   const [correctOption, setCorrectOption] = useState("");

//   const handleOptionChange = (e, option) => {
//     setOptions({ ...options, [option]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const quizData = { question, options, correctOption };
//     console.log(quizData); // Replace with API call
//     alert("Quiz question added!");
//     setQuestion("");
//     setOptions({ A: "", B: "", C: "", D: "" });
//     setCorrectOption("");
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
//       <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-8">
//         <header className="text-center border-b pb-4">
//           <h1 className="text-3xl font-bold text-indigo-600">Admin - Create Quiz</h1>
//           <p className="text-gray-500 text-sm mt-1">Easily add quiz questions and answers</p>
//         </header>

//         <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
//           <div>
//             <label className="block text-lg font-semibold text-gray-700">Quiz Question</label>
//             <textarea
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               rows="3"
//               className="mt-2 w-full p-3 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
//               placeholder="Enter the quiz question"
//             />
//           </div>

//           <div>
//             <label className="block text-lg font-semibold text-gray-700">Options</label>
//             {["A", "B", "C", "D"].map((option) => (
//               <div key={option} className="flex items-center space-x-2 mt-4">
//                 <input
//                   type="text"
//                   placeholder={`Option ${option}`}
//                   value={options[option]}
//                   onChange={(e) => handleOptionChange(e, option)}
//                   className="w-full p-3 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
//                 />
//                 <input
//                   type="radio"
//                   name="correctOption"
//                   value={option}
//                   checked={correctOption === option}
//                   onChange={(e) => setCorrectOption(e.target.value)}
//                   className="h-5 w-5 text-indigo-600 focus:ring-indigo-500"
//                 />
//                 <label className="text-gray-600">Correct</label>
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-between mt-6">
//             <button
//               type="reset"
//               onClick={() => {
//                 setQuestion("");
//                 setOptions({ A: "", B: "", C: "", D: "" });
//                 setCorrectOption("");
//               }}
//               className="px-6 py-3 bg-gray-200 text-gray-600 font-semibold rounded-lg hover:bg-gray-300 shadow-md"
//             >
//               Reset
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md"
//             >
//               Add Question
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateQuiz;
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function useToast(message: string, type: "info" | "success" | "warning" | "error" = "info") {
  toast[type](message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  });
}

export function notifyPageSuccess(message: string) {
  useToast(message, "success");
}

export function notifyPageError(message: string) {
  useToast(message, "error");
}

export function notifyInfo(message: string) {
  useToast(message, "info");
}

// Ensure to return the functions if you want to destructure them
export const toastFunctions = {
  notifyPageSuccess,
  notifyPageError,
  notifyInfo,
};
