import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Share, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Card, Divider, Menu, IconButton, TextInput, Portal, Dialog } from 'react-native-paper';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { ScreenLayout, ConfirmDialog, AlertDialog } from '@/src/components/common';
import { useDebtContext } from '@/src/store';
import { formatCurrency } from '@/src/utils';
import { Debt } from '@/src/types';
import { useThemedStyles } from '@/src/hooks/useThemedColors';

export default function CustomerDetailScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const navigation = useNavigation();
  const { getDebtsByPerson, cleanupEntryNumbers, getCustomerBalance, renameCustomer, deleteCustomer, getUniquePersonNames } = useDebtContext();
  const styles = useThemedStyles(createStyles);

  // State for menu and dialogs
  const [menuVisible, setMenuVisible] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  // Setup navigation header with menu
  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
            />
          }
          contentStyle={styles.menuContent}
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setNewCustomerName(decodeURIComponent(name || ''));
              setShowRenameDialog(true);
            }}
            title="Rename Customer"
            leadingIcon="pencil"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              setShowDeleteDialog(true);
            }}
            title="Delete Customer"
            leadingIcon="delete"
          />
        </Menu>
      ),
    });
  }, [navigation, menuVisible, name, styles.menuContent]);

  // Helper functions for dialogs
  const showAlert = (title: string, message: string) => {
    setAlertDialog({ visible: true, title, message });
  };

  const hideAlert = () => {
    setAlertDialog({ visible: false, title: '', message: '' });
  };

  // Handle rename customer
  const handleRenameCustomer = async () => {
    const trimmedName = newCustomerName.trim();
    const currentName = decodeURIComponent(name);
    
    // Validation checks
    if (!trimmedName) {
      showAlert('Invalid Name', 'Customer name cannot be empty.');
      return;
    }
    
    if (trimmedName === currentName) {
      showAlert('Same Name', 'The new name is the same as the current name.');
      return;
    }
    
    // Check if customer name already exists
    const existingCustomers = getUniquePersonNames();
    if (existingCustomers.some(customerName => customerName.toLowerCase() === trimmedName.toLowerCase())) {
      showAlert('Customer Exists', 'A customer with this name already exists. Please choose a different name.');
      return;
    }

    setLoading(true);
    try {
      await renameCustomer(currentName, trimmedName);
      setShowRenameDialog(false);
      setNewCustomerName('');
      // Navigate to the new customer page with the updated name
      router.replace(`/customer/${encodeURIComponent(trimmedName)}` as any);
    } catch (error) {
      console.error('Error renaming customer:', error);
      showAlert('Error', 'Failed to rename customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    setLoading(true);
    try {
      await deleteCustomer(decodeURIComponent(name));
      setShowDeleteDialog(false);
      // Navigate back to home screen
      router.replace('/');
    } catch (error) {
      console.error('Error deleting customer:', error);
      showAlert('Error', 'Failed to delete customer. Please try again.');
      setShowDeleteDialog(false);
    } finally {
      setLoading(false);
    }
  };

  // Clean up any existing Entry # numbers on component mount (only once)
  React.useEffect(() => {
    cleanupEntryNumbers().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - run only once on mount

  // Format date as "13 Jul 25 • 04:45 PM"
  const formatFullTimestamp = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    
    return `${day} ${month} ${year} • ${displayHours}:${minutes} ${ampm}`;
  };

  // Get all debts for this customer (excluding placeholder entries)
  const customerDebts = useMemo(() => {
    if (!name) return [];
    const allDebts = getDebtsByPerson(decodeURIComponent(name));
    // Filter out placeholder customer creation entries and sort chronologically (latest first)
    return allDebts
      .filter(debt => 
        !(debt.amount === 0 && debt.status === 'paid' && debt.note === 'Customer created - no transactions yet')
      )
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Latest first
  }, [name, getDebtsByPerson]);

  // Calculate the actual customer balance (only pending debts matter)
  const actualBalance = useMemo(() => {
    if (!name) return 0;
    return getCustomerBalance(decodeURIComponent(name));
  }, [name, getCustomerBalance]);

  // Calculate running balances for display (including all historical entries)
  const entriesWithRunningBalance = useMemo(() => {
    let runningBalance = 0;
    
    // Process entries in chronological order (oldest first) to calculate running balance
    const chronologicalEntries = [...customerDebts].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const entriesWithBalance = chronologicalEntries.map(debt => {
      const debtAmount = debt.type === 'gave' ? debt.amount : -debt.amount;
      runningBalance += debtAmount;
      return {
        ...debt,
        runningBalance
      };
    });
    
    // Return entries in reverse order (latest first) for display
    return entriesWithBalance.reverse();
  }, [customerDebts]);

  const isPositiveBalance = actualBalance >= 0;
  const absoluteBalance = Math.abs(actualBalance);

  // Handle share functionality
  const handleShare = async () => {
    if (!name) return;
    
    const customerName = decodeURIComponent(name);
    const balanceText = isPositiveBalance 
      ? `${customerName} owes you ${formatCurrency(absoluteBalance)}`
      : `You owe ${customerName} ${formatCurrency(absoluteBalance)}`;
    
    const historyText = entriesWithRunningBalance.map(entry => {
      const date = entry.date.toLocaleDateString();
      const amount = formatCurrency(entry.amount);
      const type = entry.type === 'gave' ? 'You gave' : 'You got';
      const description = entry.note || 'No description';
      const balance = formatCurrency(Math.abs(entry.runningBalance));
      const balanceLabel = entry.runningBalance >= 0 ? 'They owe you' : 'You owe them';
      return `${date}: ${type} ${amount} - ${description} - ${balanceLabel} ${balance}`;
    }).join('\n');
    
    const shareText = `${customerName} - Financial Summary\n\n${balanceText}\n\nTransaction History:\n${historyText}`;
    
    try {
      await Share.share({
        message: shareText,
        title: `${customerName} - Financial Summary`
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Render individual transaction entry
  const renderTransactionEntry = ({ item }: { item: Debt & { runningBalance: number } }) => {
    const isGave = item.type === 'gave';
    const isGot = item.type === 'got';
    
    return (
      <TouchableOpacity 
        style={styles.transactionRow}
        onPress={() => router.push(`/entry/${item.id}` as any)}
        activeOpacity={0.7}
      >
        {/* Entry Details Column (wider) */}
        <View style={styles.entryDetailsColumn}>
          <Text variant="titleSmall" style={styles.entryDescription}>
            {item.note || 'No description'}
          </Text>
          <Text variant="bodySmall" style={styles.transactionDate}>
            {formatFullTimestamp(item.date)}
          </Text>
          <Text variant="bodySmall" style={styles.runningBalance}>
            Balance: {formatCurrency(Math.abs(item.runningBalance))}
          </Text>
        </View>
        
        {/* You Gave Column (narrower) */}
        <View style={[
          styles.amountColumn,
          isGave ? styles.gaveColumnActive : styles.amountColumnInactive
        ]}>
          {isGave && (
            <Text variant="bodyMedium" style={[styles.amountText, { fontSize: 12 }]} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(item.amount)}
            </Text>
          )}
        </View>
        
        {/* You Got Column (narrower) */}
        <View style={[
          styles.amountColumn,
          isGot ? styles.gotColumnActive : styles.amountColumnInactive
        ]}>
          {isGot && (
            <Text variant="bodyMedium" style={[styles.amountText, { fontSize: 12 }]} numberOfLines={1} adjustsFontSizeToFit>
              {formatCurrency(item.amount)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!name) {
    return (
      <ScreenLayout>
        <View style={styles.errorContainer}>
          <Text variant="titleMedium" style={styles.errorText}>
            Customer not found
          </Text>
          <Button mode="contained" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable={false}>
      <View style={styles.container}>
        {/* Customer Name */}
        <Text variant="headlineMedium" style={styles.customerName}>
          {decodeURIComponent(name)}
        </Text>
        
        {/* Total Balance Box */}
        <Card style={[
          styles.balanceCard,
          { backgroundColor: isPositiveBalance ? '#4CAF50' : '#F44336' }
        ]}>
          <Card.Content style={styles.balanceCardContent}>
            <View style={styles.balanceRow}>
              <Text variant="titleMedium" style={[
                styles.balanceLabel,
                { color: '#FFFFFF' }
              ]}>
                {isPositiveBalance ? 'You Will Get' : 'You Will Give'}
              </Text>
              <Text variant="headlineSmall" style={[
                styles.balanceAmount,
                { color: '#FFFFFF' }
              ]}>
                {formatCurrency(absoluteBalance)}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Share Button */}
        <Button
          mode="contained"
          onPress={handleShare}
          style={styles.shareButton}
          icon="share-variant"
          disabled={customerDebts.length === 0}
        >
          Share History
        </Button>

        {/* History Header */}
        {customerDebts.length > 0 && (
          <>
            <Text variant="titleMedium" style={styles.historyTitle}>
              Transaction History
            </Text>
            
            {/* Column Headers */}
            <View style={styles.headerRow}>
              <View style={styles.entryDetailsColumn}>
                <Text variant="labelSmall" style={[styles.headerText, { textAlign: 'left' }]}>Entries</Text>
              </View>
              <View style={styles.amountColumn}>
                <Text variant="labelSmall" style={styles.headerText}>You Gave</Text>
              </View>
              <View style={styles.amountColumn}>
                <Text variant="labelSmall" style={styles.headerText}>You Got</Text>
              </View>
            </View>
            
            <Divider style={styles.headerDivider} />
          </>
        )}

        {/* Transaction History */}
        <View style={styles.historyContainer}>
          {customerDebts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No transactions yet
              </Text>
              <Text variant="bodyMedium" style={styles.emptySubtitle}>
                Add the first transaction for this customer
              </Text>
            </View>
          ) : (
            <FlatList
              data={entriesWithRunningBalance}
              renderItem={renderTransactionEntry}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <Divider style={styles.transactionDivider} />}
            />
          )}
        </View>
      </View>

      {/* Fixed Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        <Button
          mode="contained"
          onPress={() => router.push(`/add-debt?customer=${encodeURIComponent(name)}&type=gave` as any)}
          style={[styles.actionButton, styles.gaveButton]}
          labelStyle={[styles.actionButtonLabel,
                { color: '#FFFFFF' }]}
        >
          LENT MONEY
        </Button>
        
        <Button
          mode="contained"
          onPress={() => router.push(`/add-debt?customer=${encodeURIComponent(name)}&type=got` as any)}
          style={[styles.actionButton, styles.gotButton]}
          labelStyle={[styles.actionButtonLabel,
                { color: '#FFFFFF' }]}
        >
          GOT PAYMENT
        </Button>
      </View>

      {/* Rename Customer Dialog */}
      <Portal>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <Dialog visible={showRenameDialog} onDismiss={() => setShowRenameDialog(false)}>
            <Dialog.Title>Rename Customer</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
                Enter a new name for this customer:
              </Text>
              <TextInput
                mode="outlined"
                value={newCustomerName}
                onChangeText={setNewCustomerName}
                placeholder="Customer name"
                autoFocus
              />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setShowRenameDialog(false)}>Cancel</Button>
              <Button 
                onPress={handleRenameCustomer}
                disabled={loading || !newCustomerName.trim()}
                loading={loading}
              >
                Rename
              </Button>
            </Dialog.Actions>
          </Dialog>
        </KeyboardAvoidingView>
      </Portal>

      {/* Delete Customer Confirmation Dialog */}
      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Customer"
        message={`Are you sure you want to delete "${decodeURIComponent(name)}" and all their transaction history? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteCustomer}
        onDismiss={() => setShowDeleteDialog(false)}
        loading={loading}
      />

      {/* Alert Dialog */}
      <AlertDialog
        visible={alertDialog.visible}
        title={alertDialog.title}
        message={alertDialog.message}
        onDismiss={hideAlert}
      />
    </ScreenLayout>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  
  // Top section styles
  customerName: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
    color: colors.onBackground,
  },
  menuContent: {
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  
  // Balance card styles
  balanceCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
  },
  balanceCardContent: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontWeight: 'bold',
  },
  
  // Share button
  shareButton: {
    marginBottom: 24,
    borderRadius: 8,
  },
  
  // History section
  historyTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
    color: colors.onBackground,
  },
  
  // Column headers
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 0,
    paddingHorizontal: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    marginBottom: 6,
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  headerDivider: {
    marginBottom: 8,
    backgroundColor: colors.outline,
  },
  
  // Transaction history container
  historyContainer: {
    flex: 1,
    marginBottom: 80, // Space for bottom action bar
  },
  
  // Transaction row layout
  transactionRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  
  // Entry details column (wider - 60% of space)
  entryDetailsColumn: {
    flex: 2.5,
    alignItems: 'flex-start',
    paddingRight: 8,
  },
  entryDescription: {
    color: colors.onSurface,
    marginBottom: 4,
    fontWeight: '500',
  },
  transactionDate: {
    color: colors.onSurfaceVariant,
    fontSize: 11,
    marginBottom: 2,
  },
  runningBalance: {
    fontWeight: 'bold',
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  
  // Amount columns (narrower - 20% each)
  amountColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  amountText: {
    fontWeight: 'bold',
    color: colors.onSurface,
    textAlign: 'center',
  },
  
  // Column background states
  amountColumnInactive: {
    backgroundColor: 'transparent',
  },
  gaveColumnActive: {
    backgroundColor: isDark ? '#4A1E1E' : '#FFEBEE', // Darker red for dark mode, lighter for light
  },
  gotColumnActive: {
    backgroundColor: isDark ? '#1E4A1E' : '#E8F5E8', // Darker green for dark mode, lighter for light
  },
  
  // Transaction divider
  transactionDivider: {
    backgroundColor: colors.outlineVariant,
    marginHorizontal: 8,
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
    color: colors.onBackground,
  },
  emptySubtitle: {
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.7,
    color: colors.onSurfaceVariant,
  },
  
  // Fixed bottom action bar
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
  },
  
  // Action buttons
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    elevation: 2,
  },
  actionButtonLabel: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.onSurfaceVariant,
    paddingVertical: 4,
  },
  gaveButton: {
    backgroundColor: '#F44336', // Red for "YOU GAVE"
  },
  gotButton: {
    backgroundColor: '#4CAF50', // Green for "YOU GOT"
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
    color: colors.error,
  },
});
