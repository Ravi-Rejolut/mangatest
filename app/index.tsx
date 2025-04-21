// app/index.tsx
import { View, Text, Button, StyleSheet } from 'react-native'
import { Link } from 'expo-router'

const Index = () => {
  return (
    <View style={styles.container}>
      <Text>Select a Chapter</Text>

      <Link href="/reader/c1-0" style={styles.link}>
        Chapter1
      </Link>
      <Link href="/reader/c1-1" style={styles.link}>
      Chapter2
      </Link>
      <Link href="/reader/c1-6" style={styles.link}>
      Chapter3
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap:'20px',
    
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,    
    padding: 20,
    backgroundColor: '#0a7ea4',
  },
})

export default Index
