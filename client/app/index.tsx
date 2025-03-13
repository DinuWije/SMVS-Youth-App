import Login from './Login'
import Interests from './Interests'
import Register from './Register'
import Welcome from './Welcome'
import Feed from './Feed'
import Articles from './Articles'
import Verification from './Verification'
import AccountSettings from './AccountSettings'

import { createStackNavigator } from '@react-navigation/stack'
import '../global.css'
import { useFonts } from 'expo-font'
import ProfileSettings from '@/app/ProfileSettings'
import ChangePassword from './ChangePassword'
import CreateNotification from './CreateNotification'
import ResetPassword from './ResetPassword'

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
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="Interests" component={Interests} />
        <Stack.Screen name="CreateNotification" component={CreateNotification} />
        <Stack.Screen name="Articles" component={Articles}/>
      </Stack.Navigator>
    </AuthProvider>
  )
}

export default App
