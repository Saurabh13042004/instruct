import React, { useState, useRef, useEffect } from 'react';
import { User, X, Plus, Eye, EyeOff, AlertCircle, Check, Trash2 } from 'lucide-react';
import API from '../../api';

const ProfileSystem = ({ onClose }) => {
  // Core state
  const [activeModal, setActiveModal] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(true);

  // OTP and input state
  const [newInput, setNewInput] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const otpRefs = Array(6).fill(0).map(() => useRef(null));
  const [currentModalType, setCurrentModalType] = useState(null);

  // Password state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '', new: '', confirm: '', signOutAll: false
  });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile();
  }, []);
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showAlert('Not authenticated', 'error');
        return;
      }
  
      const response = await API.get('/user/profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      if (response.data.success) {
        const { user } = response.data;
        setUserDetails({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      showAlert('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resend timer effect
  useEffect(() => {
    let timer;
    if (resendTimer > 0 && activeModal === 'verify') {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer, activeModal]);

  const showAlert = (message, type = 'error') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  // OTP handlers
  const handleOtpChange = (index, value) => {
    if (value.length <= 1) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      if (value === '' && index > 0) {
        otpRefs[index - 1].current?.focus();
      } else if (value !== '' && index < 5) {
        otpRefs[index + 1].current?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && verificationCode[index] === '' && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-900 py-2">
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );


// Update the handleUpdateProfile function
const handleUpdateProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert('Not authenticated', 'error');
      return;
    }
    
    const response = await API.put('/user/profile', {
      firstName: userDetails.firstName,
      lastName: userDetails.lastName
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      showAlert('Profile updated successfully', 'success');
      setIsEditingProfile(false);
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    showAlert('Failed to update profile', 'error');
  }
};
  const handleSendOTP = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showAlert('Not authenticated', 'error');
        return;
      }

      const payload = {};
      if (currentModalType === 'email') {
        payload.email = newInput;
      } else {
        payload.phoneNumber = newInput;
      }

      const response = await API.post('/profile/send-otp', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setActiveModal('verify');
        setResendTimer(30);
        showAlert('OTP sent successfully', 'success');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      showAlert(error.response?.data?.message || 'Failed to send OTP', 'error');
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showAlert('Not authenticated', 'error');
        return;
      }

      const otp = verificationCode.join('');
      const payload = { otp };

      if (currentModalType === 'email') {
        payload.email = newInput;
      } else {
        payload.phoneNumber = newInput;
      }

      const response = await API.post('/profile/verify-otp', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUserDetails(prev => ({
          ...prev,
          [currentModalType]: newInput
        }));

        setActiveModal(null);
        setNewInput('');
        setVerificationCode(['', '', '', '', '', '']);
        setCurrentModalType(null);
        showAlert(`${currentModalType} updated successfully`, 'success');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showAlert(error.response?.data?.message || 'Invalid verification code', 'error');
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      if (passwordData.new !== passwordData.confirm) {
        showAlert('New passwords do not match');
        return;
      }
      if (passwordData.new.length < 8) {
        showAlert('Password must be at least 8 characters long');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        showAlert('Not authenticated', 'error');
        return;
      }

      const response = await API.put('/profile/password', {
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showAlert('Password updated successfully', 'success');
        setShowPasswordModal(false);
        setPasswordData({ current: '', new: '', confirm: '', signOutAll: false });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      showAlert(error.response?.data?.message || 'Failed to update password', 'error');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 p-8 rounded-lg flex justify-center items-center">
        <div className="text-gray-100">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 p-8 rounded-lg">
      {alert.show && (
        <div className="fixed inset-x-0 top-4 flex justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 flex items-center space-x-2">
            {alert.type === 'success' ? (
              <Check className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <p className="text-gray-100">{alert.message}</p>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-semibold text-gray-100">Profile details</h1>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              {isEditingProfile ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userDetails.firstName}
                    onChange={(e) => setUserDetails({ ...userDetails, firstName: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-gray-100"
                  />
                  <input
                    type="text"
                    value={userDetails.lastName}
                    onChange={(e) => setUserDetails({ ...userDetails, lastName: e.target.value })}
                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-gray-100"
                  />
                </div>
              ) : (
                <div className="text-xl text-gray-100">
                  {userDetails.firstName} {userDetails.lastName}
                </div>
              )}
            </div>
            <button
              onClick={() => {
                if (isEditingProfile) {
                  handleUpdateProfile();
                } else {
                  setIsEditingProfile(true);
                }
              }}
              className="text-[#b16901] hover:text-[#c27811]"
            >
              {isEditingProfile ? 'Save' : 'Update profile'}
            </button>
          </div>

          {/* Email section */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-100">Email address</h3>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-300">{userDetails.email}</span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-gray-800 text-gray-300 text-sm rounded">Primary</span>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveModal('add-email');
                setCurrentModalType('email');
              }}
              className="flex items-center space-x-1 text-[#b16901] hover:text-[#c27811]"
            >
              <Plus className="w-4 h-4" />
              <span>Update email address</span>
            </button>
          </div>

          {/* Phone section */}
          <div className="space-y-2">
            <h3 className="font-medium text-gray-100">Phone number</h3>
            <div className="flex items-center justify-between py-2">
              <span className="text-gray-300">{userDetails.phoneNumber}</span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-gray-800 text-gray-300 text-sm rounded">Primary</span>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveModal('add-phone');
                setCurrentModalType('phone');
              }}
              className="flex items-center space-x-1 text-[#b16901] hover:text-[#c27811]"
            >
              <Plus className="w-4 h-4" />
              <span>Update phone number</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-100">Password</h3>
              <button
                onClick={() => setShowPasswordModal(true)}
                className="text-[#b16901] hover:text-[#c27811]"
              >
                Update password
              </button>
            </div>
            <div className="text-gray-600">••••••••••</div>
          </div>
        </div>

        {/* Modals for adding/verification and password update */}
        {activeModal?.startsWith('add-') && (
          <Modal
            title={`Update ${activeModal.replace('add-', '')}`}
            onClose={() => {
              setActiveModal(null);
              setNewInput('');
            }}
          >
            <div className="space-y-4">
              <p className="text-gray-400">
                You'll need to verify this {activeModal.replace('add-', '')} before it can be updated.
              </p>
              <input
                type={activeModal.includes('email') ? 'email' : 'tel'}
                value={newInput}
                onChange={(e) => setNewInput(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
                placeholder={`Enter your new ${activeModal.replace('add-', '')}`}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setActiveModal(null);
                    setNewInput('');
                  }}
                  className="text-[#b16901] hover:text-[#c27811] px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendOTP}
                  disabled={!newInput}
                  className="bg-[#b16901] text-white px-4 py-2 rounded-lg hover:bg-[#c27811] disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          </Modal>
        )}

        {activeModal === 'verify' && (
          <Modal
            title={`Verify ${currentModalType}`}
            onClose={() => {
              setActiveModal(`add-${currentModalType}`);
              setVerificationCode(['', '', '', '', '', '']);
            }}
          >
            <div className="space-y-4">
              <p className="text-gray-400">
                Enter the verification code sent to {newInput}
              </p>
              <div className="flex justify-between gap-2">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
                  />
                ))}
              </div>
              <button
                className={`text-[#b16901] hover:text-[#c27811] text-sm ${resendTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                disabled={resendTimer > 0}
                onClick={() => {
                  if (resendTimer === 0) {
                    handleSendOTP();
                    setResendTimer(30);
                  }
                }}
              >
                Resend code {resendTimer > 0 ? `(${resendTimer}s)` : ''}
              </button>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setActiveModal(`add-${currentModalType}`);
                    setVerificationCode(['', '', '', '', '', '']);
                  }}
                  className="text-[#b16901] hover:text-[#c27811] px-3 py-2"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyOTP}
                  disabled={verificationCode.some(digit => !digit)}
                  className="bg-[#b16901] text-white px-4 py-2 rounded-lg hover:bg-[#c27811] disabled:opacity-50"
                >
                  Verify
                </button>
              </div>
            </div>
          </Modal>
        )}

        {showPasswordModal && (
          <Modal
            title="Update password"
            onClose={() => setShowPasswordModal(false)}
          >
            <div className="space-y-4">
              {['current', 'new', 'confirm'].map((key) => (
                <div key={key}>
                  <label className="block text-sm mb-1 text-gray-300">
                    {key.charAt(0).toUpperCase() + key.slice(1)} password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword[key] ? 'text' : 'password'}
                      value={passwordData[key]}
                      onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                      className="w-full p-2 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
                    />
                    <button
                      onClick={() => setShowPassword({ ...showPassword, [key]: !showPassword[key] })}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword[key] ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  checked={passwordData.signOutAll}
                  onChange={(e) => setPasswordData({ ...passwordData, signOutAll: e.target.checked })}
                  className="mt-1"
                />
                <div>
                  <label className="block text-sm text-gray-300">Sign out of all other devices</label>
                  <p className="text-gray-400 text-sm">
                    Recommended to sign out of all other devices after password change.
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-[#b16901] hover:text-[#c27811] px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordUpdate}
                  disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
                  className="bg-[#b16901] text-white px-4 py-2 rounded-lg hover:bg-[#c27811] disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default ProfileSystem;
