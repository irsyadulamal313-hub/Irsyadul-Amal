import React from 'react';
import { AdminResetPasswordView } from '../components/admin/AdminResetPasswordView';

interface ResetPasswordPageProps {
  onReturnToLogin: () => void;
  onReturnToPublic: () => void;
  onGoToForgotPassword?: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = (props) => {
  return <AdminResetPasswordView {...props} />;
};

export default ResetPasswordPage;
