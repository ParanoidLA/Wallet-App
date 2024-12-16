import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons'; // For the logout icon
import {
  getUser,
  updateWalletBalance,
  addTransaction,
  getTransactionHistory,
  createUser,
} from '../../api'; // Import API to create user

const Home = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [newBalance, setNewBalance] = useState<string>('');
  const [transactionAmount, setTransactionAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

useEffect(() => {
  if (user?.id) {
    // Start fetching transactions and wallet details immediately
    fetchUserDetails(user.id);

    // Create user in the backend
     createUserInBackend(user);
  }
}, [user?.id]);
// const createUserInBackend = async (user:any) => {
//   setLoading(true);

//   try {
//     const { id: clerkId, emailAddresses, username } = user;
//     const userEmail = emailAddresses[0]?.emailAddress;
//     const safeUsername = username || 'Anonymous';

//     const existingUser = await getUser(clerkId);
//     if (existingUser) {
//       console.log('User exists. Fetching details.');
//       fetchUserDetails(clerkId);
//     } else {
//       const createResponse = await createUser(clerkId, userEmail, safeUsername);
//       console.log('Create user response:', createResponse);

//       // Delay to account for database synchronization
//       await new Promise((resolve) => setTimeout(resolve, 5000));

//       // Fetch user details after delay
//       // fetchUserDetails(clerkId);
//     }
//   } catch (error) {
//     console.error('Error creating or fetching user in backend:', error);
//     setErrorMessage('Unable to create or fetch user.');
//   } finally {
//     setLoading(false);
//   }
// };
const createUserInBackend = async (user: any) => {
  setLoading(true);

  try {
    const { id: clerkId, emailAddresses, username } = user;
   const userEmail = emailAddresses[0]?.emailAddress;
   const safeUsername = username || 'Anonymous';

   // Check if the user exists
   const existingUser = await getUser(clerkId);
   if (existingUser) {
     console.log('User exists. Fetching details.');
     fetchUserDetails(clerkId);
   } else {
     console.log('User not found. Creating user...');
     const createResponse = await createUser(clerkId, userEmail, safeUsername);
     console.log('User created successfully:', createResponse);
     await new Promise((resolve) => setTimeout(resolve, 5000)); 
     // Fetch the user details and wallet after successful creation
     fetchUserDetails(createResponse.id);
   }
  } catch (error) {
    console.error('Error creating or fetching user in backend:', error);
    setErrorMessage('Unable to create or fetch user.');
  } finally {
    setLoading(false);
  }
};
  const fetchUserDetails = async (clerkId: string) => {
    try {
      const userDetails = await getUser(clerkId);
      setWallet(userDetails.wallets[0]);
      fetchTransactionHistory(userDetails.wallets[0].id);
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const fetchTransactionHistory = async (walletId: string) => {
    try {
      const history = await getTransactionHistory(walletId);
      setTransactions(history);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
  };

  const handleUpdateBalance = async () => {
    if (!newBalance || isNaN(Number(newBalance))) {
      Alert.alert(
        'Invalid Input',
        'Please enter a valid number for the balance.'
      );
      return;
    }

    try {
      const updatedWallet = await updateWalletBalance(
        wallet.id,
        Number(newBalance)
      );
      setWallet(updatedWallet);
      setNewBalance('');
      Alert.alert('Success', 'Wallet balance updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update wallet balance.');
    }
  };

  const handleTransaction = async (type: 'send' | 'receive') => {
    if (!transactionAmount || isNaN(Number(transactionAmount)) || !category) {
      Alert.alert('Invalid Input', 'Please provide valid transaction details.');
      return;
    }

    const amount = Number(transactionAmount);

    try {
      const transaction = await addTransaction(
        wallet.id,
        type,
        amount,
        category
      );
      setTransactions([transaction, ...transactions]); // Add the new transaction to the top of the list
      setWallet((prevWallet: any) => ({
        ...prevWallet,
        balance:
          type === 'send'
            ? prevWallet.balance - amount
            : prevWallet.balance + amount,
      }));
      setTransactionAmount('');
      setCategory('');
      Alert.alert(
        'Success',
        `${type === 'send' ? 'Sent' : 'Received'} transaction added.`
      );
    } catch (error) {
      Alert.alert('Error', `Failed to add ${type} transaction.`);
    }
  };

  const doLogout = () => {
    signOut();
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      <View style={styles.header}>
        <Text style={styles.usernameText}>
          Hi {user?.username ?? 'User'} 
        </Text>
        <Pressable onPress={doLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={'#fff'} />
        </Pressable>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>
          Wallet Balance: ₹
          {wallet?.balance ?? (
            <ActivityIndicator size="small" color="#0000ff" />
          )}
        </Text>
        <Pressable onPress={() => setNewBalance('')} style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.buttonContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter category"
          value={category}
          onChangeText={setCategory}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter transaction amount"
          keyboardType="numeric"
          value={transactionAmount}
          onChangeText={setTransactionAmount}
        />
        <Button
          title="Send"
          color="red"
          onPress={() => handleTransaction('send')}
        />
        <Button
          title="Receive"
          color="green"
          onPress={() => handleTransaction('receive')}
        />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transactionItem}>
            <Text>
              {item.type === 'send' ? 'Sent' : 'Received'} ₹{item.amount} -{' '}
              {item.category}
            </Text>
            <Text style={styles.transactionDate}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        )}
        ListHeaderComponent={
          <Text style={styles.historyHeader}>Transaction History</Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No transactions found.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop:20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usernameText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logoutButton: {
    marginLeft: 10,
    backgroundColor: '#ff6347',
    padding: 8,
    borderRadius: 50,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    marginTop: 8,
    backgroundColor: '#4caf50',
    padding: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  transactionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  transactionDate: {
    fontSize: 12,
    color: '#888',
  },
  historyHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#888',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default Home;
