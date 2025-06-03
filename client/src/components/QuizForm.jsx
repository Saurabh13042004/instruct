import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Video, BookOpen } from 'lucide-react';
import API from '../../api';
import { toast } from 'react-hot-toast';

const QuizForm = ({ courseId, subjectId, chapterId, initialData, onSuccess }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    duration: 30,
    questions: [
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        imageFile: null,
        hasImage: false,
        solution: {
          text: '',
          videoUrl: '',
          imageUrl: ''
        }
      }
    ]
  });

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchSubjects();
    }
  }, [courseId]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await API.get(`/courses/course/${courseId}/content`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.courseContent) {
        setSubjects(response.data.courseContent);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      // Add basic quiz data
      formDataToSend.append('title', formData.title);
      formDataToSend.append('courseId', courseId);
      formDataToSend.append('subjectId', subjectId);
      formDataToSend.append('chapterId', chapterId);
      formDataToSend.append('duration', formData.duration * 60); // Convert minutes to seconds
      
      // Add questions with their solutions
      const questionsWithSolutions = formData.questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        hasImage: q.hasImage,
        solution: {
          text: q.solution.text,
          videoUrl: q.solution.videoUrl,
          imageUrl: q.solution.imageUrl
        }
      }));
      formDataToSend.append('questions', JSON.stringify(questionsWithSolutions));
      
      // Add question images
      formData.questions.forEach((q, index) => {
        if (q.imageFile) {
          formDataToSend.append('questionImages', q.imageFile);
        }
      });

      const response = await API.post('/quiz/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Quiz created successfully!');
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index][field] = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSolutionChange = (questionIndex, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].solution[field] = value;
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
    newQuestions[questionIndex].hasImage = true;
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
          hasImage: false,
          solution: {
            text: '',
            videoUrl: '',
            imageUrl: ''
          }
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-1">Quiz Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
        <input
          type="number"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          required
          min="1"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-4">
        {formData.questions.map((question, qIndex) => (
          <div key={qIndex} className="border border-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Question {qIndex + 1}</h3>
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question Text</label>
                <textarea
                  value={question.question}
                  onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Question Image (Optional)</label>
                <input
                  type="file"
                  onChange={(e) => handleImageUpload(qIndex, e.target.files[0])}
                  accept="image/*"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Options</label>
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correctAnswer-${qIndex}`}
                      checked={question.correctAnswer === oIndex}
                      onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex)}
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                      required
                      placeholder={`Option ${oIndex + 1}`}
                      className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              {/* Solution Section */}
              <div className="mt-4 border-t border-gray-700 pt-4">
                <h4 className="text-md font-medium mb-2">Solution</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Solution Text</label>
                    <textarea
                      value={question.solution.text}
                      onChange={(e) => handleSolutionChange(qIndex, 'text', e.target.value)}
                      placeholder="Enter solution explanation"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Solution Video URL</label>
                    <input
                      type="url"
                      value={question.solution.videoUrl}
                      onChange={(e) => handleSolutionChange(qIndex, 'videoUrl', e.target.value)}
                      placeholder="Enter video URL"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Solution Image</label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleSolutionChange(qIndex, 'imageUrl', URL.createObjectURL(file));
                        }
                      }}
                      accept="image/*"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {question.solution.imageUrl && (
                      <img
                        src={question.solution.imageUrl}
                        alt="Solution"
                        className="mt-2 max-w-xs rounded-lg"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={20} />
          Add Question
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? 'Creating Quiz...' : 'Create Quiz'}
      </button>
    </form>
  );
};

export default QuizForm;
