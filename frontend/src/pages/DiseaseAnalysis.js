import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, Loader2, AlertTriangle, CheckCircle, Leaf, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function DiseaseAnalysis() {
  const { t, language } = useApp();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelect = useCallback(async (file) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image (JPEG, PNG, or WebP)');
      return;
    }
    
    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(',')[1]; // Remove data URL prefix
      setImageBase64(base64);
      setSelectedImage(e.target.result);
      setResult(null);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;
    
    setAnalyzing(true);
    setError(null);
    
    try {
      const storedToken = localStorage.getItem('krishi_token');
      const headers = storedToken ? { Authorization: `Bearer ${storedToken}` } : {};
      
      const response = await axios.post(
        `${API_URL}/api/analyze-disease`,
        {
          image_base64: imageBase64,
          language: language,
          crop_type: null
        },
        { withCredentials: true, headers }
      );
      
      setResult(response.data.analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageBase64(null);
    setResult(null);
    setError(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return 'bg-red-500';
      case 'moderate': return 'bg-amber-500';
      case 'mild': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div 
      className="flex-1 px-4 pt-6 pb-4 overflow-y-auto hide-scrollbar"
      data-testid="disease-analysis-screen"
    >
      {/* Header */}
      <div className="mb-6 page-enter">
        <h1 className="text-2xl font-bold text-[#1F2924] font-['Outfit']">
          {t('disease_title')}
        </h1>
        <p className="text-[#5C7364] mt-1">{t('disease_subtitle')}</p>
      </div>

      {/* Upload Area */}
      {!selectedImage ? (
        <div className="space-y-3 mb-6">
          {/* Camera button */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            data-testid="disease-camera-btn"
            className="w-full card flex items-center gap-4 hover:shadow-[0_8px_32px_rgba(47,105,68,0.1)] transition-all active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-xl bg-[#2F6944] flex items-center justify-center text-white">
              <Camera size={24} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-[#1F2924]">{t('take_photo')}</p>
              <p className="text-sm text-[#5C7364]">
                {language === 'hi' ? 'कैमरा से फोटो लें' : language === 'mr' ? 'कॅमेऱ्याने फोटो काढा' : 'Use camera to capture'}
              </p>
            </div>
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            data-testid="disease-upload-btn"
            className="w-full card flex items-center gap-4 hover:shadow-[0_8px_32px_rgba(47,105,68,0.1)] transition-all active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-xl bg-[#51A870] flex items-center justify-center text-white">
              <Upload size={24} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-[#1F2924]">{t('upload_image')}</p>
              <p className="text-sm text-[#5C7364]">
                {language === 'hi' ? 'गैलरी से चुनें' : language === 'mr' ? 'गॅलरीतून निवडा' : 'Select from gallery'}
              </p>
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <>
          {/* Image Preview */}
          <div className="mb-4">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(47,105,68,0.1)]">
              <img 
                src={selectedImage} 
                alt="Selected crop" 
                className="w-full h-56 object-cover"
                data-testid="disease-image-preview"
              />
              <button
                onClick={handleReset}
                data-testid="disease-reset-btn"
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>

          {/* Analyze Button */}
          {!result && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              data-testid="disease-analyze-btn"
              className="btn-primary mb-6"
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {t('analyzing')}
                </>
              ) : (
                <>
                  <Leaf size={20} />
                  {language === 'hi' ? 'विश्लेषण करें' : language === 'mr' ? 'विश्लेषण करा' : 'Analyze Image'}
                </>
              )}
            </button>
          )}
        </>
      )}

      {/* Error */}
      {error && (
        <div className="card bg-red-50 border-red-200 mb-4" data-testid="disease-error">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle size={20} />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Analysis Result */}
      {result && (
        <div className="space-y-4 fade-in" data-testid="disease-result">
          {/* Disease Name Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1F2924]">{t('analysis_result')}</h3>
              {result.is_mock && (
                <span className="badge badge-info text-xs">Demo</span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl ${getSeverityColor(result.severity)} flex items-center justify-center text-white`}>
                <Leaf size={24} />
              </div>
              <div>
                <p className="font-bold text-lg text-[#1F2924]">{result.disease_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                    {t('confidence')}: {result.confidence}
                  </span>
                  <span className="text-[#5C7364] text-sm">•</span>
                  <span className="text-sm text-[#5C7364]">
                    {t('severity')}: {result.severity}
                  </span>
                </div>
              </div>
            </div>

            {/* Symptoms */}
            {result.symptoms && result.symptoms.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-[#5C7364] mb-2">
                  {language === 'hi' ? 'लक्षण' : language === 'mr' ? 'लक्षणे' : 'Symptoms'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.symptoms.map((symptom, i) => (
                    <span key={i} className="badge badge-warning">{symptom}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Urgency */}
            {result.urgency && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                result.urgency === 'Immediate' ? 'bg-red-100 text-red-700' :
                result.urgency === 'Soon' ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              }`}>
                <AlertTriangle size={14} />
                {language === 'hi' ? 'तत्काल:' : language === 'mr' ? 'निकड:' : 'Urgency:'} {result.urgency}
              </div>
            )}
          </div>

          {/* Treatment */}
          {result.treatment && result.treatment.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-[#1F2924] mb-3 flex items-center gap-2">
                <CheckCircle size={18} className="text-[#2F6944]" />
                {t('treatment')}
              </h4>
              <ul className="space-y-2">
                {result.treatment.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#1F2924]">
                    <span className="w-6 h-6 rounded-full bg-[#2F6944]/10 text-[#2F6944] flex items-center justify-center flex-shrink-0 text-xs font-medium">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prevention */}
          {result.prevention && result.prevention.length > 0 && (
            <div className="card bg-[#F7F9F4]">
              <h4 className="font-semibold text-[#1F2924] mb-3">{t('prevention')}</h4>
              <ul className="space-y-1">
                {result.prevention.map((tip, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#5C7364]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2F6944]" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* New Analysis Button */}
          <button
            onClick={handleReset}
            data-testid="disease-new-analysis-btn"
            className="btn-secondary"
          >
            <RefreshCw size={18} />
            {language === 'hi' ? 'नया विश्लेषण' : language === 'mr' ? 'नवीन विश्लेषण' : 'New Analysis'}
          </button>
        </div>
      )}
    </div>
  );
}

export default DiseaseAnalysis;
