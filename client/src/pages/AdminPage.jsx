import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api";
import { toast } from "react-hot-toast";
import {
  Users,
  BookOpen,
  LogOut,
  Plus,
  User,
  CreditCard,
  Home,
  Settings,
  Bell,
  Brain,
  Search,
  Filter,
  Shield,
  UserX,
  Clock,
  Activity,
  Calendar,
  ChevronDown,
  Book,
  FileText,
  ArrowLeft,
  List,
  Tag,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import QuizForm from "../components/QuizForm";
import AdminLayout from '../components/AdminLayout';
import PromoCodeManager from '../components/admin/PromoCodeManager';

function AdminPage() {
  const [userCount, setUserCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [quizViewMode, setQuizViewMode] = useState("list"); // 'list' or 'create'
  const [quizzes, setQuizzes] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [courseViewMode, setCourseViewMode] = useState("add"); // "add", "list", "edit", or "transactions"
  const [courses, setCourses] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSortBy, setUserSortBy] = useState("createdAt");
  const [userSortOrder, setUserSortOrder] = useState("desc");
  const [userActivityData, setUserActivityData] = useState(null);
  const [adminRole, setAdminRole] = useState("");
  const [blockForm, setBlockForm] = useState({
    blockType: "temporary",
    blockDuration: 7,
  });

  const [courseForm, setCourseForm] = useState({
    courseName: "",
    description: "",
    includedAssets: "",
    introVideo: "",
    languages: "",
    originalPrice: "",
    discountPrice: "",
    promocode: "",
  });

  const [quizForm, setQuizForm] = useState({
    title: "",
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        hasImage: false,
        imageFile: null,
      },
    ],
  });

  const [subjects, setSubjects] = useState([]);
  const [quizCreationStep, setQuizCreationStep] = useState("select-course");

  const [editingCourseId, setEditingCourseId] = useState(null);
  const [adminForm, setAdminForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phoneNumber: "",
    adminRole: "Content Admin",
  });

  const [analyticsPeriod, setAnalyticsPeriod] = useState('daily');
  const [analyticsData, setAnalyticsData] = useState({
    activeUsers: [],
    trends: [],
    selectedUser: null,
    userActivities: []
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalQuizzes: 0
  });

  useEffect(() => {
    if (activeTab === "quiz") {
      fetchCourses();
    }
  }, [activeTab]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    if (!token || userType !== "admin") {
      navigate("/");
    } else {
      // Get admin role
      fetchAdminRole();
    }
  }, [navigate]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchAdminRole = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get('/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });


      // const response = await API.get("/profile", {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      if (response.data.success) {
        setAdminRole(response.data.user.adminRole || "");
      }
    } catch (error) {
      console.error("Error fetching admin role:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get("/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserCount(response.data.userCount);
      setCourseCount(response.data.courseCount);
      if (response.data.transactionCount !== undefined) {
        setTransactionCount(response.data.transactionCount);
      }
      if (response.data.activeUsers) {
        setActiveUsers(response.data.activeUsers);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to fetch admin stats!");
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get(`/admin/users?search=${userSearchQuery}&sortBy=${userSortBy}&sortOrder=${userSortOrder}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setUsersList(response.data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get(`/admin/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSelectedUser(response.data.user);
        setUserActivityData(response.data.user.activityMetrics);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details");
    }
  };

  const handleBlockUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.put(`/admin/users/${selectedUser._id}/block`, blockForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUserDetails(selectedUser._id);
        fetchUsers();
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to update user block status");
    }
  };

  const handleUnblockUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.put(`/admin/users/${selectedUser._id}/block`, { blockType: "none" }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchUserDetails(selectedUser._id);
        fetchUsers();
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to update user block status");
    }
  };

  const fetchChapterQuizzes = async (chapterId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.get(`/quiz/chapter/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setQuizzes(response.data.quizzes);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      toast.error("Failed to fetch quizzes");
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await API.delete(`/quiz/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          toast.success("Quiz deleted successfully");
          fetchChapterQuizzes(selectedChapter._id);
        }
      } catch (error) {
        console.error("Error deleting quiz:", error);
        toast.error("Failed to delete quiz");
      }
    }
  };

  const handleEditQuiz = async (quiz) => {
    try {
      setQuizForm({
        title: quiz.title,
        duration: quiz.duration / 60, // Convert seconds to minutes
        questions: quiz.questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          hasImage: q.hasImage || false,
          imageUrl: q.imageUrl || '',
          imageFile: null
        }))
      });
      setQuizViewMode("edit");
    } catch (error) {
      console.error("Error setting up quiz edit:", error);
      toast.error("Failed to load quiz for editing");
    }
  };

  const handleUpdateQuiz = async (quizId, formData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.put(`/quiz/${quizId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        toast.success("Quiz updated successfully");
        setQuizViewMode("list");
        fetchChapterQuizzes(selectedChapter._id);
      }
    } catch (error) {
      console.error("Error updating quiz:", error);
      toast.error("Failed to update quiz");
    }
  };

  const resetQuizForm = () => {
    setQuizForm({
      title: "",
      duration: 30,
      questions: [
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          imageFile: null,
          hasImage: false,
        },
      ],
    });
  };

  const handleQuizModeChange = (mode) => {
    setQuizViewMode(mode);
    if (mode === "create") {
      resetQuizForm();
    }
  };

  const handleChapterSelect = (course, subject, chapter) => {
    setSelectedCourse(course);
    setSelectedSubject(subject);
    setSelectedChapter(chapter);
    fetchChapterQuizzes(chapter._id);
    setQuizViewMode("list");
  };

  const clearQuizSelection = () => {
    setSelectedCourse(null);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setQuizzes([]);
    resetQuizForm();
    setQuizViewMode("list");
  };

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/courses/getAllCourses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setCourses(res.data.courses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast.error("Failed to fetch courses");
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/admin/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setTransactions(res.data.transactions);
        setTransactionCount(res.data.transactions.length);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    }
  };

  // Upload file and update the respective chapter field (pdfLink or audioLink)
  const handleFileUpload = async (subjIndex, chapIndex, field, file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const token = localStorage.getItem("token");
      const res = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        handleChapterChange(subjIndex, chapIndex, field, res.data.url);
        toast.success("File uploaded successfully");
      } else {
        toast.error("File upload failed");
      }
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Error uploading file");
    }
  };

  // Functions for managing subjects and chapters dynamically
  const addSubject = () => {
    setSubjects([...subjects, { subjectName: "", chapters: [] }]);
  };

  const removeSubject = (index) => {
    const newSubjects = [...subjects];
    newSubjects.splice(index, 1);
    setSubjects(newSubjects);
  };

  const handleSubjectNameChange = (index, value) => {
    const newSubjects = [...subjects];
    newSubjects[index].subjectName = value;
    setSubjects(newSubjects);
  };

  const addChapter = (subjectIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].chapters.push({
      chapterName: "",
      quizLink: "",
      audioLink: "",
      pdfLink: "",
      videoLink: "",
    });
    setSubjects(newSubjects);
  };

  const removeChapter = (subjectIndex, chapterIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].chapters.splice(chapterIndex, 1);
    setSubjects(newSubjects);
  };

  const handleChapterChange = (subjectIndex, chapterIndex, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].chapters[chapterIndex][field] = value;
    setSubjects(newSubjects);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const courseData = {
        ...courseForm,
        includedAssets: courseForm.includedAssets
          .split(",")
          .map((s) => s.trim()),
        languages: courseForm.languages.split(",").map((s) => s.trim()),
        subjects,
      };
      let response;
      if (editingCourseId) {
        response = await API.put(
          `/courses/updateCourse/${editingCourseId}`,
          courseData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        response = await API.post("/courses/createCourse", courseData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      if (response.data.success) {
        toast.success(
          editingCourseId
            ? "Course updated successfully!"
            : "Course added successfully!"
        );
        setCourseForm({
          courseName: "",
          description: "",
          includedAssets: "",
          introVideo: "",
          languages: "",
          originalPrice: "",
          discountPrice: "",
          promocode: "",
        });
        setSubjects([]);
        setEditingCourseId(null);
        fetchStats();
        if (courseViewMode !== "add") fetchCourses();
      } else {
        toast.error(response.data.message || "Failed to add/update course.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding/updating course.");
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await API.post("/admin/createAdmin", adminForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        toast.success("Admin created successfully!");
        setAdminForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phoneNumber: "",
          adminRole: "Content Admin",
        });
        fetchStats();
      } else {
        toast.error(response.data.message || "Failed to create admin.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating admin.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    toast.success("Logged out!");
    navigate("/login");
  };

  const handleViewCourses = () => {
    setCourseViewMode("list");
    fetchCourses();
  };

  const handleViewTransactions = () => {
    setCourseViewMode("transactions");
    fetchTransactions();
  };

  const handleEditCourse = (course) => {
    setCourseForm({
      courseName: course.courseName,
      description: course.description,
      includedAssets: course.includedAssets.join(", "),
      introVideo: course.introVideo,
      languages: course.languages.join(", "),
      originalPrice: course.originalPrice,
      discountPrice: course.discountPrice,
      promocode: course.promocode || "",
    });
    setSubjects(course.subjects || []);
    setEditingCourseId(course._id);
    setCourseViewMode("edit");
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await API.delete(`/courses/deleteCourse/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        toast.success("Course deleted successfully!");
        fetchCourses();
        fetchStats();
      } else {
        toast.error(response.data.message || "Failed to delete course.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting course.");
    }
  };

  const cancelEdit = () => {
    setCourseForm({
      courseName: "",
      description: "",
      includedAssets: "",
      introVideo: "",
      languages: "",
      originalPrice: "",
      discountPrice: "",
      promocode: "",
    });
    setSubjects([]);
    setEditingCourseId(null);
    setCourseViewMode("list");
  };

  // Check if current admin has permission for specific actions
  const hasPermission = (requiredRoles) => {
    if (adminRole === "Super Admin") return true;
    return requiredRoles.includes(adminRole);
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
    }
  }, [activeTab, userSearchQuery, userSortBy, userSortOrder]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch active users
      const usersResponse = await API.get(`/user-analytics/active-users?period=${analyticsPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch activity trends
      const trendsResponse = await API.get(`/user-analytics/activity-trends?period=${analyticsPeriod}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAnalyticsData(prev => ({
        ...prev,
        activeUsers: usersResponse.data.users,
        trends: trendsResponse.data.trends
      }));
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAnalytics = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await API.get(`/user-analytics/user-activity/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalyticsData(prev => ({
        ...prev,
        selectedUser: response.data.user,
        userActivities: response.data.activities
      }));
    } catch (error) {
      console.error('Error fetching user activities:', error);
      toast.error('Failed to fetch user activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsData();
    }
  }, [activeTab, analyticsPeriod]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen w-[98vw] pt-10 p-8 text-white">
      {/* Navbar */}
      <nav className="shadow-md px-6 py-4 flex justify-between items-center bg-gray-800 mb-8">
        <div className="flex items-center gap-2">
          <Home size={24} className="text-white" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          {adminRole && (
            <span className="ml-2 px-2 py-1 bg-blue-600 text-xs rounded-full">
              {adminRole}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Bell size={20} className="text-white" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="border border-gray-700 rounded-lg shadow-md p-6 bg-gray-800">
            <div className="flex items-center gap-4">
              <Users className="w-6 h-6 text-blue-400" />
              <div>
                <p className="text-sm text-gray-300">Total Users</p>
                <h3 className="text-2xl font-bold">{userCount}</h3>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">DAU:</span>
                <span>{activeUsers.daily}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">WAU:</span>
                <span>{activeUsers.weekly}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">MAU:</span>
                <span>{activeUsers.monthly}</span>
              </div>
            </div>
          </div>
          <div
            onClick={handleViewCourses}
            className="cursor-pointer border border-gray-700 rounded-lg shadow-md p-6 bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <BookOpen className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-sm text-gray-300">Total Courses</p>
                <h3 className="text-2xl font-bold">{courseCount}</h3>
              </div>
            </div>
          </div>
          <div
            onClick={handleViewTransactions}
            className="cursor-pointer border border-gray-700 rounded-lg shadow-md p-6 bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-4">
              <CreditCard className="w-6 h-6 text-yellow-400" />
              <div>
                <p className="text-sm text-gray-300">Total Transactions</p>
                <h3 className="text-2xl font-bold">{transactionCount}</h3>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-6">
          {hasPermission(["Content Admin", "Super Admin"]) && (
            <div
              onClick={() => {
                setActiveTab("course");
                setCourseViewMode("add");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "course" && courseViewMode === "add"
                ? "bg-blue-500 text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
            >
              <Plus size={20} />
              Add Course
            </div>
          )}

          {hasPermission(["Super Admin"]) && (
            <div
              onClick={() => setActiveTab("admin")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "admin"
                ? "bg-blue-500 text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
            >
              <Shield size={20} />
              Create Admin
            </div>
          )}

          {hasPermission(["Content Admin", "Super Admin"]) && (
            <div
              onClick={() => setActiveTab("quiz")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "quiz"
                ? "bg-blue-500 text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
            >
              <Brain size={20} />
              Create Quiz
            </div>
          )}

          {hasPermission(["Content Admin", "Super Admin"]) && (
            <div
              onClick={() => {
                setActiveTab("course");
                setCourseViewMode("list");
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${courseViewMode === "list"
                ? "bg-blue-500 text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
            >
              <Settings size={20} />
              Courses List
            </div>
          )}

          {hasPermission(["UMAA Admin", "Super Admin"]) && (
            <div
              onClick={() => {
                setActiveTab("users");
                setSelectedUser(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "users"
                ? "bg-blue-500 text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
            >
              <Users size={20} />
              Manage Users
            </div>
          )}

          {hasPermission(["Financial Admin", "Super Admin"]) && (
            <div
              onClick={() => {
                setActiveTab("course");
                setCourseViewMode("transactions");
                fetchTransactions();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${activeTab === "course" && courseViewMode === "transactions"
                ? "bg-blue-500 text-black"
                : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
            >
              <CreditCard size={20} />
              Transactions
            </div>
          )}

          {hasPermission(["Financial Admin", "Super Admin"]) && (
            <div
              onClick={() => setActiveTab("promocodes")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "promocodes"
                  ? "bg-blue-500 text-black"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              <Tag size={20} />
              Promocodes
            </div>
          )}

          {hasPermission(["UMAA Admin", "Super Admin"]) && (
            <div
              onClick={() => setActiveTab("analytics")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === "analytics"
                  ? "bg-blue-500 text-black"
                  : "bg-gray-700 text-white hover:bg-gray-600"
              }`}
            >
              <Activity size={20} />
              User Analytics
            </div>
          )}
        </div>

        {/* Main Content: Course Form / List / Edit / Transactions */}
        {activeTab === "course" && (
          <>
            {courseViewMode === "list" && (
              <>
                <h2 className="text-xl font-semibold mb-4">Courses List</h2>
                {courses.length ? (
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Course Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Intro Video
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Original Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Discount Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                      {courses.map((course) => (
                        <tr key={course._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {course.courseName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a
                              href={course.introVideo}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline"
                            >
                              View
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {course.originalPrice}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {course.discountPrice}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleEditCourse(course)}
                              className="text-green-400 hover:text-green-500 mr-2"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course._id)}
                              className="text-red-500 hover:text-red-600"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No courses found.</p>
                )}
                <div className="mt-4">
                  <button
                    onClick={() => setCourseViewMode("add")}
                    className="px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600 flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add New Course
                  </button>
                </div>
              </>
            )}

            {(courseViewMode === "add" || courseViewMode === "edit") && (
              <>
                <h2 className="text-xl font-semibold mb-6">
                  {courseViewMode === "edit" ? "Edit Course" : "Add New Course"}
                </h2>
                <form onSubmit={handleCourseSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Course Name
                    </label>
                    <input
                      type="text"
                      value={courseForm.courseName}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          courseName: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={courseForm.description}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          description: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Included Assets (comma separated)
                    </label>
                    <input
                      type="text"
                      value={courseForm.includedAssets}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          includedAssets: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Intro Video URL
                    </label>
                    <input
                      type="text"
                      value={courseForm.introVideo}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          introVideo: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Languages (comma separated)
                    </label>
                    <input
                      type="text"
                      value={courseForm.languages}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          languages: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Original Price
                    </label>
                    <input
                      type="number"
                      value={courseForm.originalPrice}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          originalPrice: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Discount Price
                    </label>
                    <input
                      type="number"
                      value={courseForm.discountPrice}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          discountPrice: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Promocode
                    </label>
                    <input
                      type="text"
                      value={courseForm.promocode}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          promocode: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {/* Subjects and Chapters Section */}
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Subjects</h3>
                    {subjects.map((subject, subjIndex) => (
                      <div
                        key={subjIndex}
                        className="border border-gray-700 p-4 rounded mb-4"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <input
                            type="text"
                            placeholder="Subject Name"
                            value={subject.subjectName}
                            onChange={(e) =>
                              handleSubjectNameChange(subjIndex, e.target.value)
                            }
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => removeSubject(subjIndex)}
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                        <div>
                          <h4 className="text-md font-semibold mb-2">
                            Chapters
                          </h4>
                          {subject.chapters.map((chapter, chapIndex) => (
                            <div key={chapIndex} className="mb-2">
                              <input
                                type="text"
                                placeholder="Chapter Name"
                                value={chapter.chapterName}
                                onChange={(e) =>
                                  handleChapterChange(
                                    subjIndex,
                                    chapIndex,
                                    "chapterName",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 mb-1"
                              />
                              <input
                                type="text"
                                placeholder="Quiz Link"
                                value={chapter.quizLink}
                                onChange={(e) =>
                                  handleChapterChange(
                                    subjIndex,
                                    chapIndex,
                                    "quizLink",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 mb-1"
                              />
                              <label className="block text-sm font-medium mb-1">
                                Upload PDF
                              </label>
                              <input
                                type="file"
                                onChange={(e) => {
                                  if (e.target.files[0]) {
                                    handleFileUpload(
                                      subjIndex,
                                      chapIndex,
                                      "pdfLink",
                                      e.target.files[0]
                                    );
                                  }
                                }}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 mb-1"
                              />
                              <label className="block text-sm font-medium mb-1">
                                Upload Audio
                              </label>
                              <input
                                type="file"
                                onChange={(e) => {
                                  if (e.target.files[0]) {
                                    handleFileUpload(
                                      subjIndex,
                                      chapIndex,
                                      "audioLink",
                                      e.target.files[0]
                                    );
                                  }
                                }}
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 mb-1"
                              />
                              <button
                                onClick={() =>
                                  removeChapter(subjIndex, chapIndex)
                                }
                                type="button"
                                className="text-red-500 hover:text-red-600"
                              >
                                Remove Chapter
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addChapter(subjIndex)}
                            type="button"
                            className="mt-2 text-blue-400 hover:text-blue-500"
                          >
                            Add Chapter
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={addSubject}
                      type="button"
                      className="mt-2 text-blue-400 hover:text-blue-500"
                    >
                      Add Subject
                    </button>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-blue-500 text-black rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={20} />
                      {courseViewMode === "edit"
                        ? "Update Course"
                        : "Add Course"}
                    </button>
                    {courseViewMode === "edit" && (
                      <button
                        onClick={cancelEdit}
                        type="button"
                        className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}

            {courseViewMode === "transactions" && (
              <>
                <h2 className="text-xl font-semibold mb-4">
                  Transactions List
                </h2>
                {transactions.length ? (
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Transaction ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Course
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                      {transactions.map((txn) => (
                        <tr key={txn._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {txn.razorpay_order_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {txn.user ? `${txn.user.firstName} ${txn.user.lastName}` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {txn.course ? txn.course.courseName : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            ₹{txn.amount / 100}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(txn.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No transactions found.</p>
                )}
                <div className="mt-4">
                  <button
                    onClick={() => setCourseViewMode("list")}
                    className="px-4 py-2 bg-blue-500 text-black rounded hover:bg-blue-600"
                  >
                    Back to Courses
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "admin" && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">Create New Admin</h2>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    value={adminForm.firstName}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, firstName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    value={adminForm.lastName}
                    onChange={(e) =>
                      setAdminForm({ ...adminForm, lastName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, email: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, password: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="text"
                  value={adminForm.phoneNumber}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, phoneNumber: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Admin Role</label>
                <select
                  value={adminForm.adminRole}
                  onChange={(e) =>
                    setAdminForm({ ...adminForm, adminRole: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Content Admin">Content Admin</option>
                  <option value="UMAA Admin">UMAA Admin</option>
                  <option value="Financial Admin">Financial Admin</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-black rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Shield size={20} />
                Create Admin
              </button>
            </form>
          </div>
        )}

        {activeTab === "quiz" && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            {/* Header with breadcrumb navigation */}
            <div className="flex items-center gap-2 mb-6">
              <h2 className="text-xl font-semibold">Quiz Creation</h2>
              {selectedCourse && (
                <>
                  <span className="text-gray-400">/</span>
                  <span>{selectedCourse.courseName}</span>
                </>
              )}
              {selectedSubject && (
                <>
                  <span className="text-gray-400">/</span>
                  <span>{selectedSubject.subjectName}</span>
                </>
              )}
              {selectedChapter && (
                <>
                  <span className="text-gray-400">/</span>
                  <span>{selectedChapter.chapterName}</span>
                </>
              )}
            </div>

            {/* Step 1: Course Selection */}
            {quizCreationStep === "select-course" && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-4">Select a Course</h3>
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setSelectedCourse(course);
                      setQuizCreationStep("select-subject");
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen size={20} />
                      <span className="font-medium">{course.courseName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Subject Selection */}
            {quizCreationStep === "select-subject" && selectedCourse && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    onClick={() => {
                      setSelectedCourse(null);
                      setQuizCreationStep("select-course");
                    }}
                    className="text-gray-400 hover:text-white cursor-pointer p-2 rounded-lg bg-gray-700"
                  >
                    <ArrowLeft size={20} />
                  </div>
                  <h3 className="text-lg font-medium">Select a Subject</h3>
                </div>
                {selectedCourse.subjects.map((subject) => (
                  <div
                    key={subject._id}
                    className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setSelectedSubject(subject);
                      setQuizCreationStep("select-chapter");
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Book size={20} />
                      <span className="font-medium">{subject.subjectName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Chapter Selection */}
            {quizCreationStep === "select-chapter" && selectedSubject && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div
                    onClick={() => {
                      setSelectedSubject(null);
                      setQuizCreationStep("select-subject");
                    }}
                    className="text-gray-400 hover:text-white cursor-pointer p-2 rounded-lg bg-gray-700"
                  >
                    <ArrowLeft size={20} />
                  </div>
                  <h3 className="text-lg font-medium">Select a Chapter</h3>
                </div>
                {selectedSubject.chapters.map((chapter) => (
                  <div
                    key={chapter._id}
                    className="border border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                    onClick={() => {
                      setSelectedChapter(chapter);
                      setQuizCreationStep("create-quiz");
                      fetchChapterQuizzes(chapter._id);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={20} />
                      <span className="font-medium">{chapter.chapterName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Step 4: Quiz Creation/Management */}
            {quizCreationStep === "create-quiz" && selectedChapter && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div
                      onClick={() => {
                        setSelectedChapter(null);
                        setQuizCreationStep("select-chapter");
                      }}
                      className="text-gray-400 hover:text-white cursor-pointer p-2 rounded-lg bg-gray-700"
                    >
                      <ArrowLeft size={20} />
                    </div>
                    <h3 className="text-lg font-medium">Quiz Management</h3>
                  </div>
                  <div
                    onClick={() =>
                      setQuizViewMode(
                        quizViewMode === "list" ? "create" : "list"
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600"
                  >
                    {quizViewMode === "list" ? (
                      <>
                        <Plus size={20} />
                        Create Quiz
                      </>
                    ) : (
                      <>
                        <List size={20} />
                        View Quizzes
                      </>
                    )}
                  </div>
                </div>

                {quizViewMode === "list" ? (
                  <div className="space-y-4">
                    {quizzes.length > 0 ? (
                      quizzes.map((quiz) => (
                        <div
                          key={quiz._id}
                          className="border border-gray-700 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{quiz.title}</h4>
                            <div className="flex gap-2">
                              <div
                                onClick={() => handleEditQuiz(quiz)}
                                className="text-blue-400 hover:text-blue-500"
                              >
                                Edit
                              </div>
                              <div
                                onClick={() => handleDeleteQuiz(quiz._id)}
                                className="text-red-400 hover:text-red-500"
                              >
                                Delete
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-400">
                            Duration: {quiz.duration / 60} minutes
                          </p>
                          <p className="text-sm text-gray-400">
                            Questions: {quiz.questions.length}
                          </p>
                        </div>
                      ))
                    ) : (
                      <QuizForm
                        courseId={selectedCourse._id}
                        subjectId={selectedSubject._id}
                        chapterId={selectedChapter._id}
                        initialData={quizViewMode === "edit" ? quizForm : null}
                        onSuccess={() => {
                          setQuizViewMode("list");
                          fetchChapterQuizzes(selectedChapter._id);
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <QuizForm
                    courseId={selectedCourse._id}
                    subjectId={selectedSubject._id}
                    chapterId={selectedChapter._id}
                    initialData={quizViewMode === "edit" ? quizForm : null}
                    onSuccess={() => {
                      setQuizViewMode("list");
                      fetchChapterQuizzes(selectedChapter._id);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* User Management Section */}
        {activeTab === "users" && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            {!selectedUser ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">User Management</h2>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearchQuery}
                        onChange={(e) => setUserSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 w-64"
                      />
                      <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                    </div>
                    <div className="relative">
                      <select
                        value={userSortBy}
                        onChange={(e) => setUserSortBy(e.target.value)}
                        className="pl-4 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                      >
                        <option value="firstName">Name</option>
                        <option value="email">Email</option>
                        <option value="phoneNumber">Phone</option>
                        <option value="dateOfBirth">Date of Birth</option>
                        <option value="createdAt">Sign-up Date</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
                    </div>
                    <button
                      onClick={() => setUserSortOrder(userSortOrder === "asc" ? "desc" : "asc")}
                      className="p-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600"
                    >
                      {userSortOrder === "asc" ? "↑" : "↓"}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          DOB
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Sign-up Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                      {usersList.map((user) => (
                        <tr key={user._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.phoneNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.isBlocked ? (
                              <span className="px-2 py-1 bg-red-900 text-red-200 rounded-full text-xs">
                                {user.blockType === "permanent" ? "Permanently Blocked" : "Temporarily Blocked"}
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-900 text-green-200 rounded-full text-xs">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => fetchUserDetails(user._id)}
                              className="text-blue-400 hover:text-blue-500"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <div
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-white cursor-pointer p-2 rounded-lg bg-gray-700"
                  >
                    <ArrowLeft size={20} />
                  </div>
                  <h2 className="text-xl font-semibold">User Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-900 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-400">Full Name</p>
                        <p>{selectedUser.firstName} {selectedUser.lastName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p>{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Phone Number</p>
                        <p>{selectedUser.phoneNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Date of Birth</p>
                        <p>{selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Account Type</p>
                        <p className="capitalize">{selectedUser.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Account Created</p>
                        <p>{new Date(selectedUser.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-900 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Account Status</h3>

                    {selectedUser.isBlocked ? (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <UserX size={20} className="text-red-500" />
                          <p className="text-red-400">
                            {selectedUser.blockType === "permanent"
                              ? "This account is permanently blocked"
                              : "This account is temporarily blocked"}
                          </p>
                        </div>
                        {selectedUser.blockType === "temporary" && selectedUser.blockExpiry && (
                          <p className="text-sm text-gray-400">
                            Block expires on: {new Date(selectedUser.blockExpiry).toLocaleString()}
                          </p>
                        )}
                        <button
                          onClick={handleUnblockUser}
                          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Unblock User
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Block Type</label>
                          <select
                            value={blockForm.blockType}
                            onChange={(e) => setBlockForm({ ...blockForm, blockType: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="temporary">Temporary Block</option>
                            <option value="permanent">Permanent Block</option>
                          </select>
                        </div>

                        {blockForm.blockType === "temporary" && (
                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Block Duration (days)</label>
                            <input
                              type="number"
                              min="1"
                              value={blockForm.blockDuration}
                              onChange={(e) => setBlockForm({ ...blockForm, blockDuration: e.target.value })}
                              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        <button
                          onClick={handleBlockUser}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Block User
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Purchased Courses</h3>
                    {selectedUser.purchases && selectedUser.purchases.length > 0 ? (
                      <ul className="space-y-2">
                        {selectedUser.purchases.map((purchase) => (
                          <li key={purchase.courseId} className="p-3 bg-gray-800 rounded-lg">
                            <p className="font-medium">{purchase.courseName}</p>
                            <p className="text-sm text-gray-400">
                              Purchased: {new Date(purchase.purchaseDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-400">
                              Amount: ₹{purchase.amount / 100}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">No courses purchased yet.</p>
                    )}
                  </div>

                  <div className="bg-gray-900 p-6 rounded-lg">
                    <h3 className="text-lg font-medium mb-4">Activity Metrics</h3>
                    {userActivityData ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Clock size={20} className="text-blue-400" />
                          <div>
                            <p className="text-sm text-gray-400">Last Login</p>
                            <p>{userActivityData.lastLogin ? new Date(userActivityData.lastLogin).toLocaleString() : 'Never'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Activity size={20} className="text-green-400" />
                          <div>
                            <p className="text-sm text-gray-400">Total Logins</p>
                            <p>{userActivityData.totalLogins || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar size={20} className="text-yellow-400" />
                          <div>
                            <p className="text-sm text-gray-400">Active Days (Last 30 Days)</p>
                            <p>{userActivityData.activeDaysLastMonth || 0}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">No activity data available.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-6">User Analytics Dashboard</h2>

            {/* Period Selector */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setAnalyticsPeriod('daily')}
                className={`px-4 py-2 rounded-lg ${
                  analyticsPeriod === 'daily' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setAnalyticsPeriod('weekly')}
                className={`px-4 py-2 rounded-lg ${
                  analyticsPeriod === 'weekly' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setAnalyticsPeriod('monthly')}
                className={`px-4 py-2 rounded-lg ${
                  analyticsPeriod === 'monthly' ? 'bg-blue-600' : 'bg-gray-700'
                }`}
              >
                Monthly
              </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Active Users</p>
                    <p className="text-2xl font-bold">{analyticsData.activeUsers.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Total Activities</p>
                    <p className="text-2xl font-bold">
                      {analyticsData.trends.reduce((sum, t) => sum + t.count, 0)}
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-gray-900 p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400">Average Session</p>
                    <p className="text-2xl font-bold">30m</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="bg-gray-900 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-semibold mb-4">Activity Trends</h2>
              <div className="h-64">
                <Line 
                  data={{
                    labels: analyticsData.trends.map(t => t._id.date),
                    datasets: [
                      {
                        label: 'User Activity',
                        data: analyticsData.trends.map(t => t.count),
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                      }
                    ]
                  }}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </div>

            {/* Active Users List */}
            <div className="bg-gray-900 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Active Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700">
                      <th className="pb-4">User</th>
                      <th className="pb-4">Role</th>
                      <th className="pb-4">Last Activity</th>
                      <th className="pb-4">Activity Count</th>
                      <th className="pb-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.activeUsers.map((user) => (
                      <tr key={user.userId} className="border-b border-gray-700">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-gray-700 rounded-full text-sm">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4">{formatDate(user.lastActivity)}</td>
                        <td className="py-4">{user.activityCount}</td>
                        <td className="py-4">
                          <button
                            onClick={() => fetchUserAnalytics(user.userId)}
                            className="px-3 py-1 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Activity Details Modal */}
            {analyticsData.selectedUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">
                        {analyticsData.selectedUser.firstName} {analyticsData.selectedUser.lastName}'s Activity
                      </h2>
                      <button
                        onClick={() => setAnalyticsData(prev => ({ ...prev, selectedUser: null }))}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="space-y-4">
                      {analyticsData.userActivities.map((activity, index) => (
                        <div
                          key={index}
                          className="bg-gray-700 p-4 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium capitalize">
                              {activity.action.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-400">
                              {formatDate(activity.timestamp)}
                            </p>
                          </div>
                          <div className="text-sm text-gray-400">
                            {activity.details?.courseName && (
                              <p>Course: {activity.details.courseName}</p>
                            )}
                            {activity.details?.chapterName && (
                              <p>Chapter: {activity.details.chapterName}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "promocodes" && (
          <div className="bg-gray-800 rounded-lg shadow-md p-6">
            <PromoCodeManager />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPage;




