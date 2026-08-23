export type PurposeId = 'passport' | 'residentId' | 'driverLicense' | 'job';

export type Policy = {
  policyId: string;
  purposeId: PurposeId;
  editLevel: 0 | 1 | 2 | 3;
  spec: {
    widthMm: number;
    heightMm: number;
    headHeightMm: number;
    background: 'white' | 'lightGray';
  };
  guides: { id: string; title: string; description: string }[];
  sampleImageUrl: string | null;
  guideImageUrls: string[];
  lockedOptions: {
    hair: string[];
    face: string[];
    expression: string[];
  };
};

export type PhotoUploadResult = { photoId: string };

export type GenerationOptions = {
  hair: 'original' | 'tidy' | 'flyaway';
  expression: 'natural';
  background: 'white' | 'lightGray' | 'original';
};

export type GenerationStatus = 'idle' | 'queued' | 'running' | 'done' | 'failed';

export type Generation = {
  generationId: string;
  status: GenerationStatus;
  progress: number; // 0-100
  previewUrl: string | null;
};

export type Order = { orderId: string; productId: string; amount: number };
