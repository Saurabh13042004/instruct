import React, { useState } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import API from '../../api';
import { toast } from 'react-hot-toast';

const QuizForm = ({ courseId, subjectId, chapterId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    duration: 30, // minutes
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        imageFile: null,
        hasImage: false
      }
    ]
  });

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleImageUpload = (questionIndex, file) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].imageFile = file;
    newQuestions[questionIndex].hasImage = !!file;
    setFormData({ ...formData, questions: newQuestions });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          imageFile: null,
          hasImage: false
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = [...formData.questions];
    newQuestions.splice(index, 1);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
        const submitFormData = new FormData();
        submitFormData.append('title', formData.title);
        submitFormData.append('duration', formData.duration * 60);
        submitFormData.append('courseId', courseId);
        submitFormData.append('subjectId', subjectId);
        submitFormData.append('chapterId', chapterId); // Ensure this line is present

        const questionsData = formData.questions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            hasImage: !!q.imageFile
        }));

        // Add images if present
        formData.questions.forEach((q, index) => {
            if (q.imageFile) {
                submitFormData.append('questionImages', q.imageFile);
            }
        });

        submitFormData.append('questions', JSON.stringify(questionsData));

        const token = localStorage.getItem('token');
        const response = await API.post('/quiz/create', submitFormData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.success) {
            toast.success('Quiz created successfully');
            onSuccess();
        }
    } catch (error) {
        console.error('Error creating quiz:', error);
        toast.error('Failed to create quiz');
    }
};



  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Quiz Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
        <input
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          required
          min="1"
        />
      </div>

      <div className="space-y-6">
        {formData.questions.map((question, qIndex) => (
          <div key={qIndex} className="border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Question {qIndex + 1}</h3>
              {qIndex > 0 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question Text</label>
                <input
                  type="text"
                  value={question.question}
                  onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={16} />
                    Question Image (optional)
                  </div>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(qIndex, e.target.files[0])}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-3">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex}>
                    <label className="flex items-center gap-2 text-sm font-medium mb-1">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={question.correctAnswer === oIndex}
                        onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                        className="text-blue-500"
                        required
                      />
                      Option {oIndex + 1}
                    </label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
        >
          <Plus size={20} />
          Add Question
        </button>

        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create Quiz
        </button>
      </div>
    </form>
  );
};

export default QuizForm;
