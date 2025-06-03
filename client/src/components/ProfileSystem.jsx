import React, { useState, useRef, useEffect } from 'react';
import { User, X, Plus, Eye, EyeOff, AlertCircle, Check, Trash2, ArrowLeft } from 'lucide-react';
import API from '../../api';

const ProfileSystem = ({ onClose }) => {
  // Core state
  const [activeModal, setActiveModal] = useState(null);
  const [modalStep, setModalStep] = useState(1); // Track steps within a modal flow
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

  // New enhanced modal component with step handling
  const EnhancedModal = ({ title, children, onClose, showBackdiv = false, onBack }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-900 py-2">
          <div className="flex items-center">
            {showBackdiv && (
              <div 
                onClick={onBack} 
                className="mr-2 text-gray-400 hover:text-gray-300"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </div>
            )}
            <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
          </div>
          <div onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <X size={20} />
          </div>
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
        setModalStep(2); // Move to verification step
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
        setModalStep(1);
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

  // Reset the modal state
  const resetModalState = () => {
    setActiveModal(null);
    setNewInput('');
    setModalStep(1);
    setVerificationCode(['', '', '', '', '', '']);
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
            <div onClick={onClose} className="text-gray-400 hover:text-gray-300">
              <X className="w-5 h-5" />
            </div>
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
            <div
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
            </div>
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
            <div
              onClick={() => {
                setActiveModal('update-contact');
                setCurrentModalType('email');
                setModalStep(1);
              }}
              className="flex items-center space-x-1 text-[#b16901] hover:text-[#c27811]"
            >
              <Plus className="w-4 h-4" />
              <span>Update email address</span>
            </div>
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
            <div
              onClick={() => {
                setActiveModal('update-contact');
                setCurrentModalType('phoneNumber');
                setModalStep(1);
              }}
              className="flex items-center space-x-1 text-[#b16901] hover:text-[#c27811]"
            >
              <Plus className="w-4 h-4" />
              <span>Update phone number</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-100">Password</h3>
              <div
                onClick={() => setShowPasswordModal(true)}
                className="text-[#b16901] hover:text-[#c27811]"
              >
                Update password
              </div>
            </div>
            <div className="text-gray-600">••••••••••</div>
          </div>
        </div>

        {/* Enhanced Contact Update Modal with Steps */}
        {activeModal === 'update-contact' && (
          <EnhancedModal
            title={`Update ${currentModalType === 'email' ? 'Email' : 'Phone Number'}`}
            onClose={resetModalState}
            showBackdiv={modalStep === 2}
            onBack={() => setModalStep(1)}
          >
            <div className="mb-6">
              {/* Step indicator */}
              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${modalStep === 1 ? 'bg-[#b16901] text-white' : 'bg-gray-700 text-gray-300'}`}>1</div>
                <div className={`flex-grow h-1 mx-2 ${modalStep === 1 ? 'bg-gray-700' : 'bg-[#b16901]'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${modalStep === 2 ? 'bg-[#b16901] text-white' : 'bg-gray-700 text-gray-300'}`}>2</div>
              </div>
              
              {/* Step 1: Enter new contact info */}
              {modalStep === 1 && (
                <div className="space-y-4 transition-opacity duration-300">
                  <p className="text-gray-400">
                    Enter your new {currentModalType === 'email' ? 'email address' : 'phone number'} below. 
                    You'll need to verify it before it can be updated.
                  </p>
                  <input
                    type={currentModalType === 'email' ? 'email' : 'tel'}
                    value={newInput}
                    onChange={(e) => setNewInput(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-[#b16901]/50 focus:border-[#b16901]"
                    placeholder={`Enter new ${currentModalType === 'email' ? 'email address' : 'phone number'}`}
                  />
                  <div className="flex justify-end space-x-3 pt-2">
                    <div
                      onClick={resetModalState}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </div>
                    <div
                      onClick={handleSendOTP}
                      disabled={!newInput}
                      className="bg-[#b16901] text-white px-5 py-2 rounded-lg hover:bg-[#c27811] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue
                    </div>
                  </div>
                </div>
              )}
              
              {/* Step 2: Verification */}
              {modalStep === 2 && (
                <div className="space-y-5 transition-opacity duration-300">
                  <p className="text-gray-400 mb-1">
                    Enter the verification code sent to{' '}
                    <span className="text-gray-200 font-medium">{newInput}</span>
                  </p>
                  
                  <div className="flex justify-between gap-2 my-4">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={otpRefs[index]}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-14 text-center text-lg bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-[#b16901]/50 focus:border-[#b16901]"
                      />
                    ))}
                  </div>
                  
                  <div
                    className={`text-[#b16901] hover:text-[#c27811] text-sm flex items-center ${resendTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={resendTimer > 0}
                    onClick={() => {
                      if (resendTimer === 0) {
                        handleSendOTP();
                        setResendTimer(30);
                      }
                    }}
                  >
                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12C22 17.52 17.52 22 12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13 17L18 12L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Resend code {resendTimer > 0 ? `(${resendTimer}s)` : ''}
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-3">
                    <div
                      onClick={() => setModalStep(1)}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Back
                    </div>
                    <div
                      onClick={handleVerifyOTP}
                      disabled={verificationCode.some(digit => !digit)}
                      className="bg-[#b16901] text-white px-5 py-2 rounded-lg hover:bg-[#c27811] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify
                    </div>
                  </div>
                </div>
              )}
            </div>
          </EnhancedModal>
        )}

        {/* Password Update Modal */}
        {showPasswordModal && (
          <EnhancedModal
            title="Update Password"
            onClose={() => {
              setShowPasswordModal(false);
              setPasswordData({ current: '', new: '', confirm: '', signOutAll: false });
              setShowPassword({ current: false, new: false, confirm: false });
            }}
          >
            <div className="space-y-5">
              {['current', 'new', 'confirm'].map((key) => (
                <div key={key} className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-300">
                    {key.charAt(0).toUpperCase() + key.slice(1)} password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword[key] ? 'text' : 'password'}
                      value={passwordData[key]}
                      onChange={(e) => setPasswordData({ ...passwordData, [key]: e.target.value })}
                      className="w-full p-3 pr-10 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:ring-2 focus:ring-[#b16901]/50 focus:border-[#b16901]"
                    />
                    <div
                      type="div"
                      onClick={() => setShowPassword({ ...showPassword, [key]: !showPassword[key] })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex items-start space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="signOutAll"
                  checked={passwordData.signOutAll}
                  onChange={(e) => setPasswordData({ ...passwordData, signOutAll: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-gray-700 bg-gray-800 text-[#b16901] focus:ring-[#b16901]"
                />
                <div>
                  <label htmlFor="signOutAll" className="block text-sm font-medium text-gray-300">
                    Sign out of all other devices
                  </label>
                  <p className="text-gray-400 text-sm">
                    Recommended for security after changing your password
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <div
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ current: '', new: '', confirm: '', signOutAll: false });
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </div>
                <div
                  onClick={handlePasswordUpdate}
                  disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
                  className="bg-[#b16901] text-white px-5 py-2 rounded-lg hover:bg-[#c27811] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Password
                </div>
              </div>
            </div>
          </EnhancedModal>
        )}
      </div>
    </div>
  );
};

export default ProfileSystem;