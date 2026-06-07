export type LoginPayload =
  | {
      login_type: 'phone';
      country_id: number;
      phone: string;
      password: string;
    }
  | {
      login_type: 'email';
      email: string;
      password: string;
    };

export type LoginUser = {
  id: number;
  is_completed_profile: number;
  name: string | null;
  email: string | null;
  type: string;
  type_text: string;
  phone: string;
  country_id: number;
  image: string | null;
};

export type LoginResponse = {
  status: boolean;
  message: string;
  data: {
    user: LoginUser;
    is_completed_profile: number;
    token: string;
  };
  errors: unknown[];
};

export type ApiEnvelope<TData = unknown> = {
  status: boolean;
  message: string;
  data: TData;
  errors: unknown[];
};

export type RegisterPayload = {
  type: '1' | '2';
  country_id: number;
  phone: string;
};

export type VerifyOtpPayload = {
  phone: string;
  country_id: number;
  otp: string;
  device_id: string;
  device_type: 'android' | 'ios' | 'web';
};

export type VerifyOtpResponse = ApiEnvelope<{
  user: LoginUser;
  token?: string;
  is_completed_profile?: number;
}>;

export type ResetCodePayload = {
  phone: string;
  country_id: number;
  code: string;
};

export type NewPasswordPayload = {
  phone: string;
  country_id: number;
  password: string;
  password_confirmation: string;
};

export type NativeUpload = {
  uri: string;
  name: string;
  type: string;
};

export type CompleteProfilePayload = {
  userType: '1' | '2';
  name: string;
  country_id?: number;
  phone?: string;
  image: NativeUpload;
  cover_image?: NativeUpload;
  state_id?: string;
  lat?: string;
  lng?: string;
  map_desc?: string;
  website?: string;
  whatsapp?: string;
  email?: string;
  commercial_license?: NativeUpload;
  national_number_manager?: string;
  country_id_manager?: number;
  phone_manager?: string;
  manager_id_image?: NativeUpload;
  description?: string;
};

export type CompleteProfileResponse = ApiEnvelope<{
  user: LoginUser;
  token?: string;
}>;
