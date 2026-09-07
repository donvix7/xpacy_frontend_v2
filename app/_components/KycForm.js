"use client"

import { getUserProfile } from '@/app/_lib/data-services';
import React, { useEffect, useState, useCallback } from 'react';
import { uploadKyc } from '../_lib/action';
import FileUploadModal from './FileUploadModal';
import { compressImages } from '../_lib/image-compression';

const KycForm = ({token}) => {
  // Modal state for file upload
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleFileSelect = (file) => {
    setFormData(prev => ({ ...prev, idDocument: file }));
  };

  const [formData, setFormData] = useState({
   
    idDocument: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadProfileData = useCallback(async () => {

     try {
      setIsLoading(true);
      setError(null);
      const response = await getUserProfile(token);
      
      if (response && typeof response === 'object') {
        // Only update fields that exist in the response
        setFormData(prev => ({
          ...prev,
          firstName: response.firstname || prev.firstName,
          lastName: response.lastname || prev.lastName,
          email: response.email || prev.email,
          phoneNumber: response.phone_number || prev.phoneNumber,
          // Don't overwrite idDocument with a string if it's a File object
          idDocument: response.idDocument instanceof File ? response.idDocument : prev.idDocument
        }));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load user profile data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear any submission errors when user starts typing
    if (submitError) setSubmitError(null);
  }, [submitError]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setSubmitError('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setSubmitError('Please upload a PDF, JPG, JPEG, or PNG file');
        return;
      }
      
      setFormData((prev) => ({ ...prev, idDocument: file }));
      setSubmitError(null);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset submission states
    setSubmitError(null);
    setSubmitSuccess(false);
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
      setSubmitError('Please fill in all required fields');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitError('Please enter a valid email address');
      return;
    }
    
    // Validate phone number (basic validation)
    if (!formData.phoneNumber || formData.phoneNumber.length < 10) {
      setSubmitError('Please enter a valid phone number');
      return;
    }
    
    // Validate file upload
    if (!formData.idDocument) {
      setSubmitError('Please attach a valid government ID');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData with only the image file
      const compressedFile = await compressImages(formData.idDocument);
      const formPayload = new FormData();
      formPayload.append('kyc_image', compressedFile);
      const result = await uploadKyc(formPayload);
      if (!result.success) {
        throw new Error(result.message || 'Failed to submit application');
      }
      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white font-sans text-slate-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Profile</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      {/* --- Main Content Container --- */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        
        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800">Application submitted successfully!</p>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {submitError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800">{submitError}</p>
            </div>
          </div>
        )}
        
        {/* Form Title Heading */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-wide mb-2">
            KYC Registration
          </h1>
          <p className="text-gray-500">Please fill in the required information below.</p>
        </div>

        {/* --- Form Section --- */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="border border-gray-200 rounded-lg p-6 md:p-8 bg-white shadow-sm">
            <h2 className="text-xl font-medium text-slate-800 border-b border-gray-100 pb-3 mb-6">
              Applicant's Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  required
                  disabled
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  required
                  disabled
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                required
                disabled
              />
            </div>

            {/* Phone Number */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Phone number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                required
                disabled
                placeholder="e.g., (123) 456-7890"
              />
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Attach a copy of your valid government ID (driver's license, Int'l passport or Voter's card) <span className="text-red-500">*</span>
              </label>
              
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={isSubmitting}
                className={`px-5 py-2.5 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-gray-50 transition ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? 'Uploading...' : 'Attach Document'}
              </button>
              <FileUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onFileUpload={(file) => { handleFileSelect(file); setIsModalOpen(false); }}
              />
            </div>

          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-10 py-3 bg-[#1e2538] text-white font-medium rounded-md shadow transition duration-200 ${
                isSubmitting 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-slate-700'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}

export default KycForm