import AsyncStorage from '@react-native-async-storage/async-storage'

// Get a string value from localStorage as an object
export const getLocalStorageObj = async <O>(localStorageKey: string) => {
  const stringifiedObj = await AsyncStorage.getItem(localStorageKey)
  let object = null

  if (stringifiedObj) {
    try {
      object = JSON.parse(stringifiedObj)
    } catch (error) {
      object = null
    }
  }

  return object
}

// Get a property of an object value from localStorage
export const getLocalStorageObjProperty = async <
  O extends Record<string, P>,
  P,
>(
  localStorageKey: string,
  property: string
) => {
  const object = await AsyncStorage.getItem(localStorageKey)
  if (!object) return null
  return object[property]
}

// Set a property of an object value in localStorage
export const setLocalStorageObjProperty = async <
  O extends Record<string, string>,
>(
  localStorageKey: string,
  property: string,
  value: string
) => {
  const object: any = await getLocalStorageObj<O>(localStorageKey)

  if (!object) return

  object[property] = value
  await AsyncStorage.setItem(localStorageKey, JSON.stringify(object))
}
