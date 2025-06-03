import React, { useState } from 'react';
import { CheckCircle, XCircle, SkipForward, Clock, ChevronDown, ExternalLink } from 'lucide-react';

const QuizResults = ({ results, questions }) => {
  const [activeSubject, setActiveSubject] = useState('all');
  const [currentAttempt, setCurrentAttempt] = useState(1);

  // Calculate overall score
  const calculateScore = () => {
    const correctAnswers = questions.filter((q, index) => 
      q.correctAnswer === results[index]
    ).length;
    return {
      correct: correctAnswers,
      total: questions.length,
      percentage: Math.round((correctAnswers / questions.length) * 100)
    };
  };

  const score = calculateScore();
  
  // Get unique subjects from questions
  const subjects = ['all', ...new Set(questions.map(q => q.subject || 'General'))];

  // Filter questions by active subject
  const filteredQuestions = activeSubject === 'all' 
    ? questions 
    : questions.filter(q => q.subject === activeSubject);
  
  // Group questions by subject for the "all" view
  const questionsBySubject = subjects.reduce((acc, subject) => {
    if (subject === 'all') return acc;
    acc[subject] = questions.filter(q => q.subject === subject);
    return acc;
  }, {});

  // Calculate stats for the active subject
  const getSubjectStats = () => {
    const relevant = filteredQuestions;
    const correct = relevant.filter((q, idx) => {
      const qIndex = questions.indexOf(q);
      return q.correctAnswer === results[qIndex];
    }).length;
    const incorrect = relevant.filter((q, idx) => {
      const qIndex = questions.indexOf(q);
      return results[qIndex] !== undefined && q.correctAnswer !== results[qIndex];
    }).length;
    const skipped = relevant.filter((q, idx) => {
      const qIndex = questions.indexOf(q);
      return results[qIndex] === undefined;
    }).length;
    
    return { correct, incorrect, skipped, total: relevant.length };
  };
  
  const stats = getSubjectStats();
  
  return (
    <div className="text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-3xl font-bold">Your Quiz Results</h1>
        <div className="relative">
          <button className="bg-gray-700 rounded-md px-3 py-1 text-sm">
            Attempt {currentAttempt} <ChevronDown className="inline h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-[#c6c6c4] mb-8">Completed on April 9, 2025 at 11:32 AM</p>
      
      {/* Score Card */}
      <div className="bg-[#111827] rounded-[2.75rem] p-6 sm:p-8 flex flex-col items-center mb-8">
        <h2 className="text-xl text-[#c6c6c4] mb-4">Final Score</h2>
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-4xl sm:text-6xl font-bold text-[#eb9f18]">{score.correct}</span>
          <span className="text-2xl sm:text-3xl text-[#c6c6c4]">/{score.total}</span>
        </div>
        
        <div className="w-full max-w-md mb-2">
          <div className="w-full bg-gray-800 rounded-full h-3">
            <div 
              className="bg-[#eb9f18] h-3 rounded-full transition-all duration-300" 
              style={{ width: `${score.percentage}%` }}
            ></div>
          </div>
        </div>
        
        <p className="text-[#c6c6c4]">{score.percentage}% success rate</p>
      </div>
      
      {/* Subject Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setActiveSubject(subject)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              activeSubject === subject 
                ? 'bg-[#eb9f18] text-black font-medium' 
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            {subject === 'all' ? 'All Subjects' : subject}
          </button>
        ))}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {/* Correct Card */}
        <div className="bg-[#111827] rounded-[1.5rem] p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-green-900/50 text-green-500 rounded-full p-2">
              <CheckCircle className="h-5 w-5" />
            </span>
            <h3 className="text-base text-white font-medium">Correct</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-2">{stats.correct}/{stats.total}</p>
          <p className="text-sm text-green-500">+{stats.correct * 4} Marks Obtained</p>
        </div>
        
        {/* Incorrect Card */}
        <div className="bg-[#111827] rounded-[1.5rem] p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-red-900/50 text-red-500 rounded-full p-2">
              <XCircle className="h-5 w-5" />
            </span>
            <h3 className="text-base text-white font-medium">Incorrect</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-2">{stats.incorrect}/{stats.total}</p>
          <p className="text-sm text-red-500">-{stats.incorrect} Marks Lost</p>
        </div>
        
        {/* Skipped Card */}
        <div className="bg-[#111827] rounded-[1.5rem] p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-900/50 text-blue-500 rounded-full p-2">
              <SkipForward className="h-5 w-5" />
            </span>
            <h3 className="text-base text-white font-medium">Skipped</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-2">{stats.skipped}/{stats.total}</p>
          <p className="text-sm text-blue-500">{stats.skipped * 4} Marks Skipped</p>
        </div>
        
        {/* Time Taken Card */}
        <div className="bg-[#111827] rounded-[1.5rem] p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-900/50 text-purple-500 rounded-full p-2">
              <Clock className="h-5 w-5" />
            </span>
            <h3 className="text-base text-white font-medium">Time Taken</h3>
          </div>
          <p className="text-2xl font-bold text-white mb-2">03:11:28</p>
          <p className="text-sm text-[#c6c6c4]">66.7% Accuracy</p>
        </div>
      </div>
      
      {/* Question Analysis */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Question Analysis</h2>
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 text-white text-sm font-medium hover:bg-black/50">
              <ChevronDown className="h-4 w-4" /> Sort By
            </button>
          </div>
        </div>
        
        {activeSubject === 'all' ? (
          Object.entries(questionsBySubject).map(([subject, subjectQuestions]) => (
            <div key={subject} className="mb-8">
              <div className="flex justify-center mb-6">
                <h3 className="text-xl font-bold text-white px-6 py-2 bg-[#1a2436] rounded-full capitalize">
                  {subject}
                </h3>
              </div>
              <div className="space-y-4">
                {subjectQuestions.map((question, idx) => (
                  <QuestionItem 
                    key={idx}
                    question={question}
                    userAnswer={results[questions.indexOf(question)]}
                    questionNumber={idx + 1}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question, idx) => (
              <QuestionItem 
                key={idx}
                question={question}
                userAnswer={results[questions.indexOf(question)]}
                questionNumber={idx + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Question item component
const QuestionItem = ({ question, userAnswer, questionNumber }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isCorrect = question.correctAnswer === userAnswer;
  const statusIcon = isCorrect ? 
    <CheckCircle className="w-6 h-6 text-green-500" /> : 
    <XCircle className="w-6 h-6 text-red-500" />;
  
  return (
    <div className="bg-[#111827] rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 mt-1">
            {statusIcon}
          </div>
          
          <div className="flex-grow">
            <h4 className="text-md font-medium mb-2">
              {questionNumber}. {question.question}
            </h4>
            
            {isOpen && (
              <div className="space-y-2 mt-4">
                {question.options.map((option, optIdx) => (
                  <div
                    key={optIdx}
                    className={`p-3 rounded-lg ${
                      optIdx === question.correctAnswer
                        ? 'bg-green-500/20 border border-green-500'
                        : optIdx === userAnswer && optIdx !== question.correctAnswer
                          ? 'bg-red-500/20 border border-red-500'
                          : 'bg-gray-700'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 text-sm flex items-center gap-1"
              >
                View {isOpen ? 'Less' : 'More'} (30 Sec)
              </button>
              
              <button className="text-[#eb9f18] text-sm flex items-center gap-1">
                View Solution <ExternalLink className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;