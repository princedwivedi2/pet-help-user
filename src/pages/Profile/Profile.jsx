import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import authService from '../../services/authService';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import FormInput from '../../components/common/FormInput/FormInput';
import Tabs from '../../components/common/Tabs/Tabs';
import Icon from '../../components/common/Icon/Icon';
import styles from './Profile.module.css';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'password', label: 'Password' },
  { key: 'account', label: 'Account' },
];

export default function Profile() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await authService.updateProfile(profileForm);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await authService.changePassword(passwordForm);
      setSuccess('Password changed successfully');
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      setError(err?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (key) => {
    setTab(key);
    setError('');
    setSuccess('');
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) return;
    try {
      setDeleting(true);
      setError('');
      await authService.deleteAccount({ password: deletePassword });
      logout();
    } catch (err) {
      setError(err?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          <Icon name="user" size={28} />
        </div>
        <div>
          <h1 className={styles.name}>{user?.name || 'User'}</h1>
          <p className={styles.email}>{user?.email}</p>
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={handleTabChange} />

      {success && <div className={styles.success}>{success}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        {tab === 'profile' && (
          <Card>
            <h2 className={styles.sectionTitle}>Personal Information</h2>
            <form onSubmit={handleProfileSave}>
              <FormInput
                label="Full Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
              <FormInput
                label="Email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
              />
              <FormInput
                label="Phone"
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
              <Button type="submit" loading={saving}>Save Changes</Button>
            </form>
          </Card>
        )}

        {tab === 'password' && (
          <Card>
            <h2 className={styles.sectionTitle}>Change Password</h2>
            <form onSubmit={handlePasswordSave}>
              <FormInput
                label="Current Password"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                required
              />
              <FormInput
                label="New Password"
                type="password"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                required
              />
              <FormInput
                label="Confirm New Password"
                type="password"
                value={passwordForm.password_confirmation}
                onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                required
              />
              <Button type="submit" loading={saving}>Update Password</Button>
            </form>
          </Card>
        )}
        {tab === 'account' && (
          <Card>
            <h2 className={styles.sectionTitle}>Delete Account</h2>
            <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
              Once you delete your account, all your data including pets, appointments, and reviews will be permanently removed. This action cannot be undone.
            </p>
            <form onSubmit={handleDeleteAccount}>
              <FormInput
                label="Enter your password to confirm"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
              />
              <Button type="submit" variant="danger" loading={deleting} disabled={!deletePassword}>
                Delete My Account
              </Button>
            </form>
          </Card>
        )}
      </div>

      <div className={styles.logoutSection}>
        <Link to="/incidents" style={{ fontSize: 14, color: 'var(--color-primary)', textDecoration: 'none' }}>
          View Incident Logs
        </Link>
        <Button variant="outline" onClick={logout}>Log out</Button>
      </div>
    </div>
  );
}
