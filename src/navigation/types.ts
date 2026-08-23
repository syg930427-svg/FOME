export type PermissionDeniedVariant = 'camera' | 'photos' | 'notifications';
export type InputMethod = 'camera' | 'gallery';

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  PermissionDenied: { variant: PermissionDeniedVariant };
  UpdateRequired: undefined;
  ServerError: undefined;

  S01_Purpose: undefined;
  S02_PurposeGuide: undefined;
  S03_IdealSample: undefined;
  S04_ShootingGuide: undefined;
  PhotoInputMethod: { preselect?: InputMethod };
  CameraPermissionDenied: undefined;
  PhotoPermissionDenied: undefined;
  S05_Camera: undefined;
  S06_Upload: undefined;
  S07_PhotoConfirm: undefined;
  PhotoCrop: undefined;
  FacePosition: undefined;
  FramingSelect: undefined;
  PhotoConfirmFinal: undefined;
  S08_Options: undefined;
  S09_FinalConfirm: undefined;
  S10_Generating: undefined;
  S11_Preview: undefined;
  S12_Payment: undefined;
};
