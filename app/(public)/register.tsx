import { Button, TextInput, View, StyleSheet, Text, Alert } from 'react-native';
import { useSignUp, useUser } from '@clerk/clerk-expo';
import Spinner from 'react-native-loading-spinner-overlay';
import { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { createUser } from '../../api';

const Register = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // This function handles sign up and sends verification email
  const onSignUpPress = async () => {
    if (!isLoaded) {
      return;
    }

    setLoading(true);
    setErrorMessage(null); // Reset error message

    try {
      // Validate inputs
      if (!username.trim()) {
        throw new Error('Username is required');
      }

      // Create the user on Clerk
      await signUp.create({
        emailAddress,
        password,
        username,
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });

      // Change the UI to verify the email address
      setPendingVerification(true);
    } catch (err: any) {
      setErrorMessage(
        err.errors?.[0]?.message || err.message || 'An error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  // This function handles the email verification process
  const onPressVerify = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      // Attempt email verification
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      // Set the active session
      await setActive({ session: completeSignUp.createdSessionId });

      // Wait for the user to be created in the backend
    //   await handleUserCreation(); // This will now be awaited before navigating
    } catch (err: any) {
      setErrorMessage(err.errors?.[0]?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  // This function is responsible for creating the user in your backend
//   const handleUserCreation = async () => {
//     if (isUserLoaded && user) {
//       const { id: clerkId, emailAddresses, username } = user;

//       try {
//         setLoading(true); // Show loading spinner while creating user

//         // Provide a default value for the username if it's null
//         const safeUsername = username ?? 'Anonymous7721821027';

//         // Call your backend API to create the user in the database
//         const response = await createUser(
//           clerkId,
//           emailAddresses[0].emailAddress,
//           safeUsername
//         );

//         console.log('User creation response:', response);

//         // If successful, navigate to the next screen
//         if (response.success) {
//           router.push('/home'); // Update with your desired screen
//         } else {
//           throw new Error('User creation failed.');
//         }
//       } catch (err) {
//         console.error('User creation error:', err);
//         setErrorMessage('Failed to create user in the database');
//       } finally {
//         setLoading(false); // Hide the loading spinner once the process is finished
//       }
//     }
//   };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerBackVisible: !pendingVerification }} />
      <Spinner visible={loading} />{' '}
      {/* Spinner is visible when loading is true */}
      {!pendingVerification && (
        <>
          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

          <TextInput
            autoCapitalize="none"
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.inputField}
          />
          <TextInput
            autoCapitalize="none"
            placeholder="Email"
            value={emailAddress}
            onChangeText={setEmailAddress}
            style={styles.inputField}
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.inputField}
          />

          <Button onPress={onSignUpPress} title="Sign up" color={'#6c47ff'} />
        </>
      )}
      {pendingVerification && (
        <>
          <View>
            <TextInput
              value={code}
              placeholder="Code..."
              style={styles.inputField}
              onChangeText={setCode}
            />
          </View>
          <Button
            onPress={onPressVerify}
            title="Verify Email"
            color={'#6c47ff'}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  inputField: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderColor: '#6c47ff',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
  button: {
    margin: 8,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginVertical: 4,
  },
});

export default Register;
