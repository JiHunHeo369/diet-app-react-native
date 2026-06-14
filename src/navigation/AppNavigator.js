import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

import CalendarScreen  from '../screens/CalendarScreen';
import DayDetailScreen from '../screens/DayDetailScreen';
import FoodDetailScreen from '../screens/FoodDetailScreen';
import UploadScreen    from '../screens/UploadScreen';
import SettingsScreen  from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:       { backgroundColor: colors.primary },
        headerTintColor:   colors.white,
        headerTitleStyle:  { fontWeight: 'bold' },
        contentStyle:      { backgroundColor: colors.grayBg },
      }}
    >
      <Stack.Screen name="Calendar"   component={CalendarScreen}   options={{ title: '식단 캘린더' }} />
      <Stack.Screen name="DayDetail"  component={DayDetailScreen}  options={{ title: '일별 식단' }} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} options={{ title: '음식 상세' }} />
      <Stack.Screen name="Upload"     component={UploadScreen}     options={{ title: '식단 업로드' }} />
      <Stack.Screen name="Settings"   component={SettingsScreen}   options={{ title: '설정' }} />
    </Stack.Navigator>
  );
}
