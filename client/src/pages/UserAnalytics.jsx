import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Activity,
  Calendar,
  User,
  BarChart2,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import API from '../../api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Line } from 'react-chartjs-2';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const UserAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('daily');
  const [activeUsers, setActiveUsers] = useState([]);
  const [trends, setTrends] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userActivities, setUserActivities] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch active users
      const usersResponse = await API.get(`/user-analytics/active-users?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch activity trends
      const trendsResponse = await API.get(`/user-analytics/activity-trends?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActiveUsers(usersResponse.data.users);
      setTrends(trendsResponse.data.trends);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivities = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await API.get(`/user-analytics/user-activity/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(response.data.user);
      setUserActivities(response.data.activities);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const chartData = {
    labels: trends.map(t => t._id.date),
    datasets: [
      {
        label: 'User Activity',
        data: trends.map(t => t.count),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-900">
        <LoadingSpinner fullScreen size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">User Analytics Dashboard</h1>

        {/* Period Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setPeriod('daily')}
            className={`px-4 py-2 rounded-lg ${
              period === 'daily' ? 'bg-blue-600' : 'bg-gray-800'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setPeriod('weekly')}
            className={`px-4 py-2 rounded-lg ${
              period === 'weekly' ? 'bg-blue-600' : 'bg-gray-800'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 rounded-lg ${
              period === 'monthly' ? 'bg-blue-600' : 'bg-gray-800'
            }`}
          >
            Monthly
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Active Users</p>
                <p className="text-2xl font-bold">{activeUsers.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400">Total Activities</p>
                <p className="text-2xl font-bold">
                  {trends.reduce((sum, t) => sum + t.count, 0)}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg">
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
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Activity Trends</h2>
          <div className="h-64">
            <Line data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        {/* Active Users List */}
        <div className="bg-gray-800 p-6 rounded-lg">
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
                {activeUsers.map((user) => (
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
                        onClick={() => fetchUserActivities(user.userId)}
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
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    {selectedUser.firstName} {selectedUser.lastName}'s Activity
                  </h2>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-4">
                  {userActivities.map((activity, index) => (
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
    </div>
  );
};

export default UserAnalytics; 