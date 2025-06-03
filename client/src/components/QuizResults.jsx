import React from 'react';
import { CheckCircle, XCircle, BookOpen, Video, Image as ImageIcon } from 'lucide-react';

const QuizResults = ({ results, questions }) => {
  const calculateScore = () => {
    const correctAnswers = questions.filter((q, index) => 
      q.correctAnswer === results[index]
    ).length;
    return {
      correct: correctAnswers,
      total: questions.length,
      percentage: (correctAnswers / questions.length) * 100
    };
  };

  const score = calculateScore();

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-500">{score.correct}</div>
            <div className="text-sm text-gray-400">Correct Answers</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-gray-400">{score.total}</div>
            <div className="text-sm text-gray-400">Total Questions</div>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-500">{score.percentage.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Score</div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const isCorrect = question.correctAnswer === results[index];
          return (
            <div key={index} className="bg-gray-800 p-6 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {isCorrect ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-medium mb-2">Question {index + 1}</h3>
                  <p className="text-gray-300 mb-4">{question.question}</p>
                  
                  {question.hasImage && (
                    <img
                      src={question.imageUrl}
                      alt="Question"
                      className="max-w-md rounded-lg mb-4"
                    />
                  )}

                  <div className="space-y-2 mb-4">
                    {question.options.map((option, oIndex) => (
                      <div
                        key={oIndex}
                        className={`p-3 rounded-lg ${
                          oIndex === question.correctAnswer
                            ? 'bg-green-500/20 border border-green-500'
                            : oIndex === results[index] && !isCorrect
                            ? 'bg-red-500/20 border border-red-500'
                            : 'bg-gray-700'
                        }`}
                      >
                        {option}
                      </div>
                    ))}
                  </div>

                  {/* Solution Section */}
                  {(question.solution.text || question.solution.videoUrl || question.solution.imageUrl) && (
                    <div className="mt-6 border-t border-gray-700 pt-4">
                      <h4 className="text-md font-medium mb-3">Solution</h4>
                      
                      {question.solution.text && (
                        <div className="flex items-start gap-2 mb-4">
                          <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                          <p className="text-gray-300">{question.solution.text}</p>
                        </div>
                      )}

                      {question.solution.videoUrl && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Video className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-medium">Video Solution</span>
                          </div>
                          <div className="aspect-video">
                            <iframe
                              src={question.solution.videoUrl}
                              className="w-full h-full rounded-lg"
                              allowFullScreen
                            />
                          </div>
                        </div>
                      )}

                      {question.solution.imageUrl && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-medium">Image Solution</span>
                          </div>
                          <img
                            src={question.solution.imageUrl}
                            alt="Solution"
                            className="max-w-md rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizResults; 