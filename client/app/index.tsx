import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Welcome from '@/pages/Welcome'
import Feed from './Feed'
import AccountSettings from './AccountSettings'

import { createStackNavigator } from '@react-navigation/stack'
import '../global.css'
import { useFonts } from 'expo-font'
import ProfileSettings from '@/app/ProfileSettings'
import ChangePassword from './ChangePassword'
import AuthProvider from '@/contexts/AuthProvider'
import Interests from '@/pages/Interests'

const Stack = createStackNavigator()

const App = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
  })
  return (
    <AuthProvider>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Feed" component={Feed} />
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettings}
          options={{ headerTitle: 'Settings' }}
        />
        <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="Interests" component={Interests} />
      </Stack.Navigator>
    </AuthProvider>
  )
}

export default App
