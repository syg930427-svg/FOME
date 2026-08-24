import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Onboarding from '../screens/entry/Onboarding';
import PermissionDenied from '../screens/entry/PermissionDenied';
import ServerError from '../screens/entry/ServerError';
import Splash from '../screens/entry/Splash';
import UpdateRequired from '../screens/entry/UpdateRequired';
import CameraPermissionDenied from '../screens/CameraPermissionDenied';
import FacePosition from '../screens/FacePosition';
import FramingSelect from '../screens/FramingSelect';
import GenerationStarted from '../screens/GenerationStarted';
import PhotoConfirmFinal from '../screens/PhotoConfirmFinal';
import PhotoCrop from '../screens/PhotoCrop';
import PhotoInputMethod from '../screens/PhotoInputMethod';
import PhotoPermissionDenied from '../screens/PhotoPermissionDenied';
import S01_Purpose from '../screens/S01_Purpose';
import S02_PurposeGuide from '../screens/S02_PurposeGuide';
import S03_IdealSample from '../screens/S03_IdealSample';
import S04_ShootingGuide from '../screens/S04_ShootingGuide';
import S05_Camera from '../screens/S05_Camera';
import S06_Upload from '../screens/S06_Upload';
import S07_PhotoConfirm from '../screens/S07_PhotoConfirm';
import S08_Options from '../screens/S08_Options';
import S09_FinalConfirm from '../screens/S09_FinalConfirm';
import S10_Generating from '../screens/S10_Generating';
import S11_Preview from '../screens/S11_Preview';
import S12_Payment from '../screens/S12_Payment';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * S01 → S02 → S03 → S04 → PhotoInputMethod → (S05 촬영 | S06 업로드) → S07
 *   → PhotoCrop → FacePosition → FramingSelect → PhotoConfirmFinal
 *   → S08 → S09 → GenerationStarted → S10 → S11 → S12
 * Native stack push/pop transitions (default). Headers are drawn per-screen
 * to match the design's custom nav bar, so the stack header is hidden here.
 */
export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false, gestureEnabled: true }}
      >
        <Stack.Screen name="Splash" component={Splash} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Onboarding" component={Onboarding} options={{ gestureEnabled: false }} />
        <Stack.Screen name="PermissionDenied" component={PermissionDenied} />
        <Stack.Screen name="UpdateRequired" component={UpdateRequired} options={{ gestureEnabled: false }} />
        <Stack.Screen name="ServerError" component={ServerError} />

        <Stack.Screen name="S01_Purpose" component={S01_Purpose} />
        <Stack.Screen name="S02_PurposeGuide" component={S02_PurposeGuide} />
        <Stack.Screen name="S03_IdealSample" component={S03_IdealSample} />
        <Stack.Screen name="S04_ShootingGuide" component={S04_ShootingGuide} />
        <Stack.Screen name="PhotoInputMethod" component={PhotoInputMethod} />
        <Stack.Screen name="CameraPermissionDenied" component={CameraPermissionDenied} />
        <Stack.Screen name="PhotoPermissionDenied" component={PhotoPermissionDenied} />
        <Stack.Screen name="S05_Camera" component={S05_Camera} options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="S06_Upload" component={S06_Upload} />
        <Stack.Screen name="S07_PhotoConfirm" component={S07_PhotoConfirm} />
        <Stack.Screen name="PhotoCrop" component={PhotoCrop} options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="FacePosition" component={FacePosition} />
        <Stack.Screen name="FramingSelect" component={FramingSelect} />
        <Stack.Screen name="PhotoConfirmFinal" component={PhotoConfirmFinal} />
        <Stack.Screen name="S08_Options" component={S08_Options} />
        <Stack.Screen name="S09_FinalConfirm" component={S09_FinalConfirm} />
        <Stack.Screen name="GenerationStarted" component={GenerationStarted} options={{ gestureEnabled: false }} />
        <Stack.Screen name="S10_Generating" component={S10_Generating} options={{ gestureEnabled: false }} />
        <Stack.Screen name="S11_Preview" component={S11_Preview} />
        <Stack.Screen name="S12_Payment" component={S12_Payment} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
