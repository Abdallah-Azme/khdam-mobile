import type {
  ApiEnvelope,
  CompleteProfilePayload,
  CompleteProfileResponse,
  LoginPayload,
  LoginResponse,
  NewPasswordPayload,
  RegisterPayload,
  ResetCodePayload,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from '@/features/auth/types';
import { apiRequest } from '@/services/api/client';
import { secureStorage } from '@/services/storage/secure-storage';
import { storageKeys } from '@/services/storage/keys';
import { ApiError } from '@/services/api/errors';

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const formData = new FormData();
  formData.append('login_type', payload.login_type);
  formData.append('password', payload.password);
  if (payload.login_type === 'phone') {
    formData.append('country_id', String(payload.country_id));
    formData.append('phone', payload.phone);
  } else {
    formData.append('email', payload.email);
  }

  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: formData,
    authenticated: false,
  });
  if (!response.status) {
    throw new ApiError(response.message || 'Login failed', 400, response.errors);
  }
  return response;
}

export async function register(payload: RegisterPayload): Promise<ApiEnvelope> {
  const formData = new FormData();
  formData.append('type', payload.type);
  formData.append('country_id', String(payload.country_id));
  formData.append('phone', payload.phone);
  const response = await apiRequest<ApiEnvelope>('/auth/register', {
    method: 'POST',
    body: formData,
    authenticated: false,
  });
  assertOk(response, 'Registration failed');
  return response;
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<VerifyOtpResponse> {
  const formData = new FormData();
  formData.append('phone', payload.phone);
  formData.append('country_id', String(payload.country_id));
  formData.append('otp', payload.otp);
  formData.append('device_id', payload.device_id);
  formData.append('device_type', payload.device_type);
  const response = await apiRequest<VerifyOtpResponse>('/auth/verify-otp', {
    method: 'POST',
    body: formData,
    authenticated: false,
  });
  assertOk(response, 'Failed to verify OTP');
  return response;
}

export async function resendOtp(payload: Omit<VerifyOtpPayload, 'otp' | 'device_id' | 'device_type'>): Promise<ApiEnvelope> {
  const formData = new FormData();
  formData.append('phone', payload.phone);
  formData.append('country_id', String(payload.country_id));
  const response = await apiRequest<ApiEnvelope>('/auth/resend-otp', {
    method: 'POST',
    body: formData,
    authenticated: false,
  });
  assertOk(response, 'Failed to resend OTP');
  return response;
}

export async function forgotPassword(payload: Omit<ResetCodePayload, 'code'>): Promise<ApiEnvelope> {
  const formData = new FormData();
  formData.append('phone', payload.phone);
  formData.append('country_id', String(payload.country_id));
  const response = await apiRequest<ApiEnvelope>('/auth/forgot-password', {
    method: 'POST',
    body: formData,
    authenticated: false,
  });
  assertOk(response, 'Failed to send reset code');
  return response;
}

export async function checkResetCode(payload: ResetCodePayload): Promise<ApiEnvelope> {
  const formData = new FormData();
  formData.append('phone', payload.phone);
  formData.append('country_id', String(payload.country_id));
  formData.append('code', payload.code);
  const response = await apiRequest<ApiEnvelope>('/auth/check-code', {
    method: 'POST',
    body: formData,
    authenticated: false,
  });
  assertOk(response, 'Invalid code');
  return response;
}

export async function newPassword(payload: NewPasswordPayload): Promise<ApiEnvelope> {
  const formData = new FormData();
  formData.append('phone', payload.phone);
  formData.append('country_id', String(payload.country_id));
  formData.append('password', payload.password);
  formData.append('password_confirmation', payload.password_confirmation);
  const response = await apiRequest<ApiEnvelope>('/auth/new-password', {
    method: 'POST',
    body: formData,
    authenticated: false,
  });
  assertOk(response, 'Failed to reset password');
  return response;
}

export async function completeProfile(payload: CompleteProfilePayload): Promise<CompleteProfileResponse> {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('is_completed_profile', payload.userType === '1' ? '1' : '0');
  if (payload.country_id) formData.append('country_id', String(payload.country_id));
  if (payload.phone) formData.append('phone', payload.phone);
  appendFile(formData, 'image', payload.image);
  if (payload.userType === '2') {
    appendFile(formData, 'cover_image', payload.cover_image);
    appendFile(formData, 'commercial_license', payload.commercial_license);
    appendFile(formData, 'manager_id_image', payload.manager_id_image);
    appendText(formData, 'state_id', payload.state_id);
    appendText(formData, 'lat', payload.lat);
    appendText(formData, 'lng', payload.lng);
    appendText(formData, 'map_desc', payload.map_desc);
    appendText(formData, 'website', payload.website);
    appendText(formData, 'whatsapp', payload.whatsapp);
    appendText(formData, 'email', payload.email);
    appendText(formData, 'national_number_manager', payload.national_number_manager);
    if (payload.country_id_manager) formData.append('country_id_manager', String(payload.country_id_manager));
    appendText(formData, 'phone_manager', payload.phone_manager);
    appendText(formData, 'description', payload.description);
  }

  const token = await secureStorage.get(storageKeys.token);
  const response = await apiRequest<CompleteProfileResponse>('/auth/complete-profile', {
    method: 'POST',
    body: formData,
    authenticated: Boolean(token),
  });
  assertOk(response, 'Failed to complete profile');
  return response;
}

function assertOk(response: ApiEnvelope, fallback: string) {
  if (!response.status) {
    throw new ApiError(response.message || fallback, 400, response.errors);
  }
}

function appendText(formData: FormData, key: string, value?: string) {
  if (value) formData.append(key, value);
}

function appendFile(formData: FormData, key: string, file?: CompleteProfilePayload['image']) {
  if (!file) return;
  formData.append(key, file as unknown as Blob);
}
