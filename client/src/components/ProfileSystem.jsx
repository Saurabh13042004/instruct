import React, { useState, useRef, useEffect } from 'react';
import { User, X, Plus, Eye, EyeOff, AlertCircle, Check, Trash2 } from 'lucide-react';

const ProfileSystem = ({ onClose }) => {
  // Core state
  const [activeModal, setActiveModal] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [userDetails, setUserDetails] = useState({
    firstName: 'Instruct',
    lastName: 'User',
    emails: [{ address: 'instruct.edu@gmail.com', isPrimary: true }],
    phones: [{ number: '+91 83075-49295', isPrimary: true }]
  });

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
      <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  const handleVerifyOTP = () => {
    const otp = verificationCode.join('');
    if (otp === '123456') { // Demo verification code
      const type = currentModalType;
      const newItem = {
        [type === 'email' ? 'address' : 'number']: newInput,
        isPrimary: false
      };
      
      setUserDetails(prev => ({
        ...prev,
        [type === 'email' ? 'emails' : 'phones']: [...prev[type === 'email' ? 'emails' : 'phones'], newItem]
      }));
      
      setActiveModal(null);
      setNewInput('');
      setVerificationCode(['', '', '', '', '', '']);
      setCurrentModalType(null);
      showAlert(`${type} added successfully`, 'success');
    } else {
      showAlert('Invalid verification code');
    }
  };

  const handleRemove = (type, value) => {
    const items = type === 'email' ? userDetails.emails : userDetails.phones;
    if (items.length <= 1) {
      showAlert(`Must have at least one ${type}`);
      return;
    }
    
    const key = type === 'email' ? 'emails' : 'phones';
    const valueKey = type === 'email' ? 'address' : 'number';
    
    setUserDetails({
      ...userDetails,
      [key]: items.filter(item => item[valueKey] !== value)
    });
    showAlert(`${type} removed successfully`, 'success');
  };

  const handlePasswordUpdate = () => {
    if (passwordData.new !== passwordData.confirm) {
      showAlert('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 8) {
      showAlert('Password must be at least 8 characters long');
      return;
    }
    showAlert('Password updated successfully', 'success');
    setShowPasswordModal(false);
    setPasswordData({ current: '', new: '', confirm: '', signOutAll: false });
  };

  const renderContactSection = (type, items) => (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-100">
        {type === 'email' ? 'Email addresses' : 'Phone numbers'}
      </h3>
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-between py-2">
          <span className="text-gray-300">{item[type === 'email' ? 'address' : 'number']}</span>
          <div className="flex items-center space-x-2">
            {item.isPrimary ? (
              <span className="px-2 py-1 bg-gray-800 text-gray-300 text-sm rounded">Primary</span>
            ) : (
              <button
                onClick={() => handleRemove(type, item[type === 'email' ? 'address' : 'number'])}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ))}
      <button
        onClick={() => {
          setActiveModal(`add-${type}`);
          setCurrentModalType(type);
        }}
        className="flex items-center space-x-1 text-[#b16901] hover:text-[#c27811]"
      >
        <Plus className="w-4 h-4" />
        <span>Add {type === 'email' ? 'email address' : 'phone number'}</span>
      </button>
    </div>
  );

  return (
    <div>
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
          {/* Use the onClose prop to allow closing the modal */}
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
                if (isEditingProfile) showAlert('Profile updated successfully', 'success');
                setIsEditingProfile(!isEditingProfile);
              }}
              className="text-[#b16901] hover:text-[#c27811]"
            >
              {isEditingProfile ? 'Save' : 'Update profile'}
            </button>
          </div>

          {renderContactSection('email', userDetails.emails)}
          {renderContactSection('phone', userDetails.phones)}

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
            title={`Add ${activeModal.replace('add-', '')} address`}
            onClose={() => {
              setActiveModal(null);
              setNewInput('');
            }}
          >
            <div className="space-y-4">
              <p className="text-gray-400">
                You'll need to verify this {activeModal.replace('add-', '')} before it can be added to your account.
              </p>
              <input
                type={activeModal.includes('email') ? 'email' : 'tel'}
                value={newInput}
                onChange={(e) => setNewInput(e.target.value)}
                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100"
                placeholder={`Enter your ${activeModal.replace('add-', '')} address`}
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
                  onClick={() => {
                    if (newInput) {
                      const type = activeModal.replace('add-', '');
                      const items = type === 'email' ? userDetails.emails : userDetails.phones;
                      if (items.length >= 3) {
                        showAlert(`Cannot add more than 3 ${type}s`);
                        return;
                      }
                      setActiveModal('verify');
                      setResendTimer(30);
                    }
                  }}
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
                className={`text-[#b16901] hover:text-[#c27811] text-sm ${
                  resendTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={resendTimer > 0}
                onClick={() => resendTimer === 0 && setResendTimer(30)}
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
