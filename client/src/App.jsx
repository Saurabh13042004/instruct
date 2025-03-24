import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import Login from './pages/Login/Login'
import './assets/css/AllStyles.css';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage'
import Courses from './pages/Courses';
import About from './pages/About';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import Vision from './pages/CourseContent';
import AdminPage from './pages/AdminPage';
import CourseDetail from './pages/CourseDetail';
import AuthSuccess from './components/AuthSuccess';
import Footer from './components/Footer';
import CourseContent from './pages/CourseContent';
import CourseContentDetail from './pages/CourseContentDetail';
import Contact from './pages/Contact';
import { Toaster } from 'react-hot-toast';
import Quiz from './pages/Quiz';
import TermsConditions from './pages/TermsConditions';



function AppContent() {
  const location = useLocation();
  const isQuizRoute = location.pathname.includes('/quiz');

  return (
    <>
      {!isQuizRoute && <Navbar />}
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <h1>Welcome to the protected page!</h1>
            </ProtectedRoute>
          }
        />
        <Route path='/about' element={<About />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/terms' element={<TermsConditions/>  } />
        <Route path='/vision' element={<Vision />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path='/courses' element={<Courses />} />
        <Route path='/course-content/:courseId' element={<CourseContent />} />
        <Route path='/course-content-detail/:courseId/:subjectId' element={<CourseContentDetail />} />
        <Route path='/course-content-detail/:courseId/:subjectId/quiz' element={<Quiz />} />
        <Route path='/course/:courseId' element={<CourseDetail />} />
        <Route path="/auth/success" element={<AuthSuccess />} />
        <Route path="/quiz" element={<Quiz />} />

      </Routes>
      {!isQuizRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <>
      <Router>
        <AppContent />
      </Router>
      <Toaster/>
    </>
  )
}

export default App