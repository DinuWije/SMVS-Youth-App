import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Welcome from '@/pages/Welcome'
import { createStackNavigator } from '@react-navigation/stack'
import '../global.css'
import { useFonts } from 'expo-font'

const Stack = createStackNavigator()

const App = () => {
  const [fontsLoaded] = useFonts({
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
  })
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* <Stack.Screen name="Welcome" component={Welcome} /> */}
      <Stack.Screen name="Login" component={Login} />
      {/* <Stack.Screen name="Register" component={Register} /> */}
    </Stack.Navigator>
  )
}

export default App
