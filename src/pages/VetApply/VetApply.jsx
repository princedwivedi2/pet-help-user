import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import FormInput from '../../components/common/FormInput/FormInput';
import FileUpload from '../../components/common/FileUpload/FileUpload';
import Button from '../../components/common/Button/Button';
import LocationPicker from './LocationPicker';
import styles from './VetApply.module.css';

const SPECIES_OPTIONS = [
  'Dogs', 'Cats', 'Birds', 'Rabbits', 'Fish',
  'Reptiles', 'Hamsters', 'Cattle', 'Horses',
];

const SERVICES_OPTIONS = [
  'General Checkup', 'Vaccination', 'Surgery', 'Dental Care',
  'Dermatology', 'Radiology', 'Emergency Care', 'Lab Tests',
  'Grooming', 'Nutrition Counseling',
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TOTAL_STEPS = 6;

const STEP_LABELS = [
  'Personal Information',
  'Professional Details',
  'Clinic Location',
  'Working Hours',
  'Documents',
  'Review & Submit',
];

const DOCUMENT_TYPES = [
  { key: 'license', label: 'Veterinary License' },
  { key: 'degree', label: 'Degree Certificate' },
  { key: 'id_proof', label: 'Government ID' },
  { key: 'clinic_registration', label: 'Clinic Registration' },
];

const STORAGE_KEY = 'petsathi_vet_apply_draft';

const DEFAULT_SCHEDULE = DAY_NAMES.map((_, i) => ({
  day_of_week: i,
  is_open: i >= 1 && i <= 5,
  open_time: '09:00',
  close_time: '17:00',
}));

const INITIAL_FORM = {
  full_name: '',
  email: '',
  phone_number: '',
  password: '',
  password_confirmation: '',
  clinic_name: '',
  clinic_address: '',
  city: '',
  state: '',
  postal_code: '',
  latitude: '',
  longitude: '',
  location_override_confirmed: false,
  specialization: '',
  qualifications: '',
  consultation_fee: '',
  home_visit_fee: '',
  license_number: '',
  years_of_experience: '',
  accepted_species: [],
  services_offered: [],
  schedule: DEFAULT_SCHEDULE,
};

export default function VetApply() {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_FORM, ...parsed, password: '', password_confirmation: '' };
      }
    } catch { /* ignore */ }
    return INITIAL_FORM;
  });

  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [docFiles, setDocFiles] = useState({
    license: [],
    degree: [],
    id_proof: [],
    clinic_registration: [],
  });

  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [deviceCoords, setDeviceCoords] = useState({ latitude: null, longitude: null });
  const [geoStatus, setGeoStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(1);
  const [stepSuccess, setStepSuccess] = useState({});
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const { password, password_confirmation, ...saveable } = form;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saveable));
      } catch { /* quota exceeded */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [form]);

  useEffect(() => {
    if (!navigator.geolocation) { setGeoStatus('error'); return; }
    setGeoStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected = {
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        };
        setDeviceCoords(detected);
        setForm((prev) => ({
          ...prev,
          latitude: prev.latitude || String(detected.latitude),
          longitude: prev.longitude || String(detected.longitude),
        }));
        setGeoStatus('done');
      },
      () => setGeoStatus('error'),
      { timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const updateField = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const toggleArrayItem = (field, item) => {
    setForm((prev) => {
      const list = prev[field];
      return { ...prev, [field]: list.includes(item) ? list.filter((v) => v !== item) : [...list, item] };
    });
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  // ─── Profile Photo ───
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setErrors((prev) => ({ ...prev, profile_photo: ['Only JPG/PNG images are allowed.'] }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, profile_photo: ['Image must be under 5MB.'] }));
      return;
    }
    setProfilePhotoFile(file);
    setProfilePhotoPreview(URL.createObjectURL(file));
    setErrors((prev) => { const n = { ...prev }; delete n.profile_photo; return n; });
    stopCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      streamRef.current = stream;
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      });
    } catch {
      setErrors((prev) => ({ ...prev, profile_photo: ['Camera access denied or unavailable.'] }));
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setProfilePhotoFile(file);
        setProfilePhotoPreview(URL.createObjectURL(blob));
        setErrors((prev) => { const n = { ...prev }; delete n.profile_photo; return n; });
      }
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // ─── Schedule ───
  const updateSchedule = (dayIndex, key, value) => {
    setForm((prev) => ({
      ...prev,
      schedule: prev.schedule.map((s, i) => i === dayIndex ? { ...s, [key]: value } : s),
    }));
  };

  // ─── Documents ───
  const handleDocFileChange = (type, files) => {
    setDocFiles((prev) => ({ ...prev, [type]: files }));
  };

  // ─── Location ───
  const handleLocationChange = (lat, lng) => {
    setForm((prev) => ({
      ...prev,
      latitude: String(lat),
      longitude: String(lng),
      location_override_confirmed: false,
    }));
    setErrors((prev) => {
      if (!prev.location && !prev.latitude && !prev.longitude) return prev;
      const next = { ...prev };
      delete next.location;
      delete next.latitude;
      delete next.longitude;
      return next;
    });
  };

  const handleAddressFound = ({ address, city, state, postal_code }) => {
    setForm((prev) => ({
      ...prev,
      clinic_address: address || prev.clinic_address,
      city: city || prev.city,
      state: state || prev.state,
      postal_code: postal_code || prev.postal_code,
    }));
  };

  // ─── Validation ───
  const getValidationIssues = useCallback(() => {
    const issues = [];
    if (!profilePhotoFile) issues.push({ field: 'profile_photo', label: 'Profile Photo', step: 1 });
    if (!form.full_name.trim()) issues.push({ field: 'full_name', label: 'Full Name', step: 1 });
    if (!form.email.trim()) issues.push({ field: 'email', label: 'Email', step: 1 });
    if (!form.phone_number.trim()) issues.push({ field: 'phone_number', label: 'Phone Number', step: 1 });
    if (!form.password || form.password.length < 8) issues.push({ field: 'password', label: 'Password (min 8 chars)', step: 1 });
    if (form.password !== form.password_confirmation) issues.push({ field: 'password_confirmation', label: 'Password Confirmation', step: 1 });
    if (!form.specialization.trim()) issues.push({ field: 'specialization', label: 'Specialization', step: 2 });
    if (!form.qualifications.trim()) issues.push({ field: 'qualifications', label: 'Qualifications', step: 2 });
    if (!form.license_number.trim()) issues.push({ field: 'license_number', label: 'License Number', step: 2 });
    if (form.accepted_species.length === 0) issues.push({ field: 'accepted_species', label: 'Accepted Species', step: 2 });
    if (form.services_offered.length === 0) issues.push({ field: 'services_offered', label: 'Services Offered', step: 2 });
    if (!form.clinic_name.trim()) issues.push({ field: 'clinic_name', label: 'Clinic Name', step: 3 });
    if (!form.clinic_address.trim()) issues.push({ field: 'clinic_address', label: 'Clinic Address', step: 3 });
    if (!form.city.trim()) issues.push({ field: 'city', label: 'City', step: 3 });
    if (!form.consultation_fee) issues.push({ field: 'consultation_fee', label: 'Consultation Fee', step: 3 });

    const clinicLat = toNumber(form.latitude);
    const clinicLng = toNumber(form.longitude);
    if (clinicLat === null || clinicLng === null) {
      issues.push({ field: 'location', label: 'Clinic Coordinates', step: 3 });
    } else if (deviceCoords.latitude !== null && deviceCoords.longitude !== null) {
      const dist = calculateDistanceKm(deviceCoords.latitude, deviceCoords.longitude, clinicLat, clinicLng);
      if (dist > 10 && !form.location_override_confirmed) {
        issues.push({ field: 'location_override_confirmed', label: `Clinic ${dist.toFixed(1)}km away — confirm override`, step: 3 });
      }
    }

    if (docFiles.license.length === 0) issues.push({ field: 'doc_license', label: 'License Document', step: 5 });

    return issues;
  }, [form, profilePhotoFile, deviceCoords, docFiles]);

  const goToIssue = (issue) => {
    setCurrentStep(issue.step);
    setShowValidationSummary(false);
    setTimeout(() => {
      const el = document.getElementById(`field-${issue.field}`) || document.querySelector(`[name="${issue.field}"]`);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus?.(); }
    }, 100);
  };

  const goNext = () => {
    setStepSuccess((prev) => ({ ...prev, [currentStep]: true }));
    setCurrentStep((s) => Math.min(TOTAL_STEPS, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Submit ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});
    setShowValidationSummary(false);

    const issues = getValidationIssues();
    if (issues.length > 0) {
      setShowValidationSummary(true);
      setError('Please fix the missing fields before submitting.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('full_name', form.full_name.trim());
    formData.append('email', form.email.trim());
    formData.append('phone_number', form.phone_number.trim());
    formData.append('password', form.password);
    formData.append('password_confirmation', form.password_confirmation);
    if (profilePhotoFile) formData.append('profile_photo', profilePhotoFile);
    formData.append('clinic_name', form.clinic_name.trim());
    formData.append('clinic_address', form.clinic_address.trim());
    formData.append('city', form.city.trim());
    if (form.state.trim()) formData.append('state', form.state.trim());
    if (form.postal_code.trim()) formData.append('postal_code', form.postal_code.trim());
    formData.append('latitude', String(form.latitude).trim());
    formData.append('longitude', String(form.longitude).trim());
    if (deviceCoords.latitude !== null) {
      formData.append('device_latitude', String(deviceCoords.latitude));
      formData.append('device_longitude', String(deviceCoords.longitude));
      formData.append('location_override_confirmed', form.location_override_confirmed ? '1' : '0');
    }
    formData.append('qualifications', form.qualifications.trim());
    formData.append('specialization', form.specialization.trim());
    formData.append('consultation_fee', form.consultation_fee);
    if (form.home_visit_fee) formData.append('home_visit_fee', form.home_visit_fee);
    formData.append('license_number', form.license_number.trim());
    if (form.years_of_experience) formData.append('years_of_experience', form.years_of_experience);
    form.accepted_species.forEach((s, i) => formData.append(`accepted_species[${i}]`, s));
    form.services_offered.forEach((s, i) => formData.append(`services_offered[${i}]`, s));

    const activeSlots = form.schedule.filter((s) => s.is_open);
    activeSlots.forEach((slot, i) => {
      formData.append(`working_hours[${i}][day_of_week]`, String(slot.day_of_week));
      formData.append(`working_hours[${i}][open_time]`, slot.open_time);
      formData.append(`working_hours[${i}][close_time]`, slot.close_time);
    });

    let docIndex = 0;
    Object.values(docFiles).forEach((files) => {
      files.forEach((file) => {
        formData.append(`documents[${docIndex}]`, file);
        docIndex++;
      });
    });

    try {
      await api.post('/vet/apply', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      sessionStorage.removeItem(STORAGE_KEY);
      navigate('/vet/apply/success');
    } catch (err) {
      if (err?.errors) setErrors(err.errors);
      setError(err?.message || 'Something went wrong. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const issues = getValidationIssues();
  const progress = Math.round(((currentStep - 1) / TOTAL_STEPS) * 100);
  const hasActiveSchedule = form.schedule.some((s) => s.is_open);
  const photoInputRef = useRef(null);

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoMark}>P</span>
            <span className={styles.logoText}>PetSathi</span>
          </Link>
          <h1 className={styles.title}>Apply as a Veterinarian</h1>
          <p className={styles.subtitle}>Join our network of trusted veterinary professionals</p>
        </div>

        {/* ═══ Progress Bar ═══ */}
        <div className={styles.progressContainer}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.progressSteps}>
            {STEP_LABELS.map((label, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.progressStep} ${currentStep === i + 1 ? styles.progressStepActive : ''} ${currentStep > i + 1 ? styles.progressStepDone : ''}`}
                onClick={() => { setCurrentStep(i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              >
                <span className={styles.progressDot}>{currentStep > i + 1 ? '✓' : i + 1}</span>
                <span className={styles.progressLabel}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.stepHeader}>
          <span className={styles.stepBadge}>Step {currentStep} of {TOTAL_STEPS}</span>
          <h2 className={styles.stepTitle}>{STEP_LABELS[currentStep - 1]}</h2>
        </div>

        {stepSuccess[currentStep - 1] && currentStep > 1 && (
          <div className={styles.successBanner}>✓ {STEP_LABELS[currentStep - 2]} saved successfully</div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {showValidationSummary && issues.length > 0 && (
          <div className={styles.validationSummary}>
            <p className={styles.validationTitle}>Cannot submit application. Missing fields:</p>
            <ul className={styles.validationList}>
              {issues.map((issue) => (
                <li key={issue.field}>
                  <button type="button" className={styles.validationLink} onClick={() => goToIssue(issue)}>
                    {issue.label} <span className={styles.validationStep}>(Step {issue.step})</span>
                  </button>
                </li>
              ))}
            </ul>
            <Button type="button" size="sm" variant="ghost" onClick={() => goToIssue(issues[0])}>
              Go to missing fields
            </Button>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>

          {/* ═══ STEP 1 ═══ */}
          {currentStep === 1 && (
            <fieldset className={styles.section}>
              <legend className={styles.sectionTitle}>Profile Photo</legend>
              <p className={styles.sectionHint}>Upload a professional photo or capture one using your camera. Required.</p>

              <div className={styles.photoSection}>
                {profilePhotoPreview ? (
                  <div className={styles.photoPreviewWrap}>
                    <img src={profilePhotoPreview} alt="Profile preview" className={styles.photoPreview} />
                    <button type="button" className={styles.photoRemove} onClick={() => { setProfilePhotoFile(null); setProfilePhotoPreview(''); }}>Remove</button>
                    <p className={styles.photoSuccess}>✓ Photo uploaded successfully</p>
                  </div>
                ) : cameraActive ? (
                  <div className={styles.cameraWrap}>
                    <video ref={videoRef} className={styles.cameraVideo} autoPlay playsInline muted />
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                    <div className={styles.cameraActions}>
                      <Button type="button" onClick={capturePhoto}>Capture Photo</Button>
                      <Button type="button" variant="ghost" onClick={stopCamera}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.photoActions}>
                    <input ref={photoInputRef} type="file" accept="image/jpeg,image/png" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    <Button type="button" onClick={() => photoInputRef.current?.click()}>Upload Photo</Button>
                    <Button type="button" variant="secondary" onClick={startCamera}>Capture Photo</Button>
                  </div>
                )}
              </div>
              {errors.profile_photo && <span className={styles.fieldError}>{errors.profile_photo[0]}</span>}

              <legend className={styles.sectionTitle} style={{ marginTop: 28 }}>Personal Details</legend>
              <div className={styles.grid2}>
                <FormInput label="Full Name" value={form.full_name} onChange={updateField('full_name')} error={errors.full_name?.[0]} placeholder="Dr. John Doe" required />
                <FormInput label="Email" type="email" value={form.email} onChange={updateField('email')} error={errors.email?.[0]} placeholder="name@example.com" required />
              </div>
              <FormInput label="Phone Number" type="tel" value={form.phone_number} onChange={updateField('phone_number')} error={errors.phone_number?.[0]} placeholder="+91 98765 43210" required />
              <div className={styles.grid2}>
                <FormInput label="Password" type="password" value={form.password} onChange={updateField('password')} error={errors.password?.[0]} placeholder="Min. 8 characters" required />
                <FormInput label="Confirm Password" type="password" value={form.password_confirmation} onChange={updateField('password_confirmation')} error={errors.password_confirmation?.[0]} placeholder="Re-enter password" required />
              </div>
            </fieldset>
          )}

          {/* ═══ STEP 2 ═══ */}
          {currentStep === 2 && (
            <fieldset className={styles.section}>
              <legend className={styles.sectionTitle}>Professional Details</legend>
              <FormInput label="Specialization" value={form.specialization} onChange={updateField('specialization')} error={errors.specialization?.[0]} placeholder="e.g., Small Animal Specialist" required />
              <FormInput label="Qualifications" as="textarea" rows={3} value={form.qualifications} onChange={updateField('qualifications')} error={errors.qualifications?.[0]} placeholder="e.g., BVSc, MVSc in Small Animal Surgery" required />
              <div className={styles.grid2}>
                <FormInput label="License Number" value={form.license_number} onChange={updateField('license_number')} error={errors.license_number?.[0]} placeholder="e.g., VCI-12345" required />
                <FormInput label="Years of Experience" type="number" min="0" max="60" value={form.years_of_experience} onChange={updateField('years_of_experience')} error={errors.years_of_experience?.[0]} placeholder="e.g., 5" />
              </div>
              <div className={styles.chipField}>
                <label className={styles.chipLabel}>Accepted Species <span className={styles.required}>*</span></label>
                <div className={styles.chipGroup}>
                  {SPECIES_OPTIONS.map((sp) => (
                    <button key={sp} type="button" className={`${styles.chip} ${form.accepted_species.includes(sp) ? styles.chipActive : ''}`} onClick={() => toggleArrayItem('accepted_species', sp)}>
                      {sp}
                    </button>
                  ))}
                </div>
                {errors.accepted_species && <span className={styles.fieldError}>{errors.accepted_species[0]}</span>}
              </div>
              <div className={styles.chipField}>
                <label className={styles.chipLabel}>Services Offered <span className={styles.required}>*</span></label>
                <div className={styles.chipGroup}>
                  {SERVICES_OPTIONS.map((svc) => (
                    <button key={svc} type="button" className={`${styles.chip} ${form.services_offered.includes(svc) ? styles.chipActive : ''}`} onClick={() => toggleArrayItem('services_offered', svc)}>
                      {svc}
                    </button>
                  ))}
                </div>
                {errors.services_offered && <span className={styles.fieldError}>{errors.services_offered[0]}</span>}
              </div>
            </fieldset>
          )}

          {/* ═══ STEP 3: Clinic Location ═══ */}
          {currentStep === 3 && (
            <fieldset className={styles.section}>
              <legend className={styles.sectionTitle}>Clinic Information</legend>
              
              <FormInput 
                label="Clinic Name" 
                value={form.clinic_name} 
                onChange={updateField('clinic_name')} 
                error={errors.clinic_name?.[0]} 
                placeholder="e.g., City Pet Hospital" 
                required 
              />

              {/* Location Picker Section */}
              <div className={styles.locationSection}>
                <h4 className={styles.locationHeader}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Clinic Location
                </h4>
                <p className={styles.locationHint}>
                  Search for your clinic address, use your current location, or click anywhere on the map
                  to drop a pin. Drag the pin to fine-tune — city, state and postal code fill in automatically.
                </p>

                <LocationPicker
                  latitude={form.latitude}
                  longitude={form.longitude}
                  onLocationChange={handleLocationChange}
                  onAddressFound={handleAddressFound}
                />

                {errors.location?.[0] && (
                  <span className={styles.fieldError}>{errors.location[0]}</span>
                )}

                {/* Location override warning */}
                {errors.location_override_confirmed && (
                  <span className={styles.fieldError}>{errors.location_override_confirmed[0]}</span>
                )}
                <label className={styles.checkboxRow}>
                  <input 
                    type="checkbox" 
                    checked={form.location_override_confirmed} 
                    onChange={updateField('location_override_confirmed')} 
                  />
                  <span>I confirm the clinic location is intentionally different from my current device location.</span>
                </label>
              </div>

              {/* Address Details */}
              <div className={styles.addressDetails}>
                <h4 className={styles.addressHeader}>Address Details</h4>
                <FormInput 
                  label="Street Address" 
                  as="textarea" 
                  rows={2} 
                  value={form.clinic_address} 
                  onChange={updateField('clinic_address')} 
                  error={errors.clinic_address?.[0]} 
                  placeholder="Full street address" 
                  required 
                />
                <div className={styles.grid2}>
                  <FormInput 
                    label="City" 
                    value={form.city} 
                    onChange={updateField('city')} 
                    error={errors.city?.[0]} 
                    placeholder="e.g., Mumbai" 
                    required 
                  />
                  <FormInput 
                    label="State" 
                    value={form.state} 
                    onChange={updateField('state')} 
                    error={errors.state?.[0]} 
                    placeholder="e.g., Maharashtra" 
                  />
                </div>
                <FormInput 
                  label="Postal Code" 
                  value={form.postal_code} 
                  onChange={updateField('postal_code')} 
                  error={errors.postal_code?.[0]} 
                  placeholder="e.g., 400001" 
                />
              </div>

              {/* Consultation Fees */}
              <div className={styles.feesSection}>
                <h4 className={styles.feesHeader}>Consultation Fees</h4>
                <div className={styles.grid2}>
                  <FormInput 
                    label="In-Clinic Consultation (₹)" 
                    type="number" 
                    min="0" 
                    value={form.consultation_fee} 
                    onChange={updateField('consultation_fee')} 
                    error={errors.consultation_fee?.[0]} 
                    placeholder="e.g., 800" 
                    required 
                  />
                  <FormInput 
                    label="Home Visit Fee (₹)" 
                    type="number" 
                    min="0" 
                    value={form.home_visit_fee} 
                    onChange={updateField('home_visit_fee')} 
                    error={errors.home_visit_fee?.[0]} 
                    placeholder="e.g., 1200 (optional)" 
                  />
                </div>
              </div>

              {geoStatus === 'detecting' && <p className={styles.sectionHint}>Detecting your location...</p>}
              {geoStatus === 'done' && <p className={styles.sectionHint}>Device location detected.</p>}
              {geoStatus === 'error' && <p className={styles.sectionHint}>Location detection unavailable.</p>}
            </fieldset>
          )}

          {/* ═══ STEP 4: Weekly Schedule ═══ */}
          {currentStep === 4 && (
            <fieldset className={styles.section}>
              <legend className={styles.sectionTitle}>Weekly Schedule</legend>
              <p className={styles.sectionHint}>
                Set your weekly availability. Working hours are optional — if you skip this, users will see "Please contact vet for availability."
              </p>

              <div className={styles.scheduleList}>
                {form.schedule.map((day, idx) => (
                  <div key={idx} className={`${styles.scheduleRow} ${!day.is_open ? styles.scheduleRowClosed : ''}`}>
                    <div className={styles.scheduleDayHeader}>
                      <span className={styles.scheduleDayName}>{DAY_NAMES[idx]}</span>
                      <label className={styles.toggleLabel}>
                        <input type="checkbox" checked={day.is_open} onChange={(e) => updateSchedule(idx, 'is_open', e.target.checked)} className={styles.toggleInput} />
                        <span className={`${styles.toggleSwitch} ${day.is_open ? styles.toggleOn : ''}`} />
                        <span className={styles.toggleText}>{day.is_open ? 'Open' : 'Closed'}</span>
                      </label>
                    </div>
                    {day.is_open && (
                      <div className={styles.scheduleTimeRow}>
                        <div className={styles.scheduleTimeField}>
                          <label className={styles.scheduleTimeLabel}>Start Time</label>
                          <input type="time" value={day.open_time} onChange={(e) => updateSchedule(idx, 'open_time', e.target.value)} className={styles.scheduleTimeInput} />
                        </div>
                        <div className={styles.scheduleTimeField}>
                          <label className={styles.scheduleTimeLabel}>End Time</label>
                          <input type="time" value={day.close_time} onChange={(e) => updateSchedule(idx, 'close_time', e.target.value)} className={styles.scheduleTimeInput} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {!hasActiveSchedule && (
                <p className={styles.scheduleNote}>No days selected. Users will see: "Please contact vet for availability"</p>
              )}
            </fieldset>
          )}

          {/* ═══ STEP 5: Documents ═══ */}
          {currentStep === 5 && (
            <fieldset className={styles.section}>
              <legend className={styles.sectionTitle}>Verification Documents</legend>
              <p className={styles.sectionHint}>Upload your professional documents. Each field supports multiple files (PDF, JPG, PNG — max 5MB each).</p>

              {DOCUMENT_TYPES.map((docType) => (
                <div key={docType.key} className={styles.docUploadBlock}>
                  <h4 className={styles.docUploadLabel}>
                    Upload {docType.label}
                    {docType.key === 'license' && <span className={styles.required}> *</span>}
                  </h4>
                  <FileUpload
                    files={docFiles[docType.key]}
                    onChange={(files) => handleDocFileChange(docType.key, files)}
                    maxFiles={3}
                    label=""
                    error={errors[`doc_${docType.key}`]?.[0]}
                  />
                </div>
              ))}
            </fieldset>
          )}

          {/* ═══ STEP 6: Review & Submit ═══ */}
          {currentStep === 6 && (
            <fieldset className={styles.section}>
              <legend className={styles.sectionTitle}>Review Your Application</legend>
              <p className={styles.sectionHint}>Please review all your information before submitting.</p>

              <div className={styles.reviewBlock}>
                <div className={styles.reviewHeader}>
                  <h4>Profile Photo</h4>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setCurrentStep(1)}>Edit</Button>
                </div>
                {profilePhotoPreview ? (
                  <img src={profilePhotoPreview} alt="Profile" className={styles.reviewPhoto} />
                ) : (
                  <span className={styles.reviewMissing}>Not uploaded</span>
                )}
              </div>

              <div className={styles.reviewBlock}>
                <div className={styles.reviewHeader}>
                  <h4>Personal Details</h4>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setCurrentStep(1)}>Edit</Button>
                </div>
                <div className={styles.reviewGrid}>
                  <div><strong>Name:</strong> {form.full_name || '—'}</div>
                  <div><strong>Email:</strong> {form.email || '—'}</div>
                  <div><strong>Phone:</strong> {form.phone_number || '—'}</div>
                </div>
              </div>

              <div className={styles.reviewBlock}>
                <div className={styles.reviewHeader}>
                  <h4>Professional Details</h4>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setCurrentStep(2)}>Edit</Button>
                </div>
                <div className={styles.reviewGrid}>
                  <div><strong>Specialization:</strong> {form.specialization || '—'}</div>
                  <div><strong>License:</strong> {form.license_number || '—'}</div>
                  <div><strong>Qualifications:</strong> {form.qualifications || '—'}</div>
                  <div><strong>Experience:</strong> {form.years_of_experience ? `${form.years_of_experience} years` : '—'}</div>
                  <div><strong>Species:</strong> {form.accepted_species.join(', ') || '—'}</div>
                  <div><strong>Services:</strong> {form.services_offered.join(', ') || '—'}</div>
                </div>
              </div>

              <div className={styles.reviewBlock}>
                <div className={styles.reviewHeader}>
                  <h4>Clinic Address</h4>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setCurrentStep(3)}>Edit</Button>
                </div>
                <div className={styles.reviewGrid}>
                  <div><strong>Clinic:</strong> {form.clinic_name || '—'}</div>
                  <div><strong>Address:</strong> {form.clinic_address || '—'}</div>
                  <div><strong>City:</strong> {form.city || '—'}{form.state && `, ${form.state}`}</div>
                  <div><strong>Fee:</strong> ₹{form.consultation_fee || '—'}</div>
                  <div><strong>Coordinates:</strong> {form.latitude || '—'}, {form.longitude || '—'}</div>
                </div>
              </div>

              <div className={styles.reviewBlock}>
                <div className={styles.reviewHeader}>
                  <h4>Working Hours</h4>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setCurrentStep(4)}>Edit</Button>
                </div>
                {hasActiveSchedule ? (
                  <div className={styles.reviewSchedule}>
                    {form.schedule.filter((s) => s.is_open).map((s) => (
                      <div key={s.day_of_week} className={styles.reviewScheduleRow}>
                        <strong>{DAY_NAMES[s.day_of_week]}:</strong> {s.open_time} – {s.close_time}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className={styles.reviewNote}>Not set — "Please contact vet for availability"</span>
                )}
              </div>

              <div className={styles.reviewBlock}>
                <div className={styles.reviewHeader}>
                  <h4>Documents Uploaded</h4>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setCurrentStep(5)}>Edit</Button>
                </div>
                <div className={styles.reviewDocs}>
                  {DOCUMENT_TYPES.map((dt) => (
                    <div key={dt.key} className={styles.reviewDocRow}>
                      <strong>{dt.label}:</strong>
                      {docFiles[dt.key].length > 0 ? (
                        <span className={styles.reviewDocCount}>✓ {docFiles[dt.key].length} file(s)</span>
                      ) : (
                        <span className={styles.reviewMissing}>Not uploaded</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {issues.length > 0 && (
                <div className={styles.validationSummary}>
                  <p className={styles.validationTitle}>Cannot submit. Missing fields:</p>
                  <ul className={styles.validationList}>
                    {issues.map((issue) => (
                      <li key={issue.field}>
                        <button type="button" className={styles.validationLink} onClick={() => goToIssue(issue)}>
                          {issue.label} <span className={styles.validationStep}>(Step {issue.step})</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </fieldset>
          )}

          {/* ═══ Navigation ═══ */}
          <div className={styles.stepActions}>
            {currentStep > 1 && <Button type="button" variant="ghost" onClick={goBack}>Back</Button>}
            <div style={{ flex: 1 }} />
            {currentStep < TOTAL_STEPS ? (
              <Button type="button" onClick={goNext}>Next</Button>
            ) : (
              <Button type="submit" fullWidth loading={loading} size="lg" disabled={loading || issues.length > 0}>
                Submit Application
              </Button>
            )}
          </div>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
 