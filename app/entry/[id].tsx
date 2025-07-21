import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenLayout, ConfirmDialog, AlertDialog } from '@/src/components/common';
import { useDebtContext } from '@/src/store';
import { formatCurrency } from '@/src/utils';
import { useThemedStyles } from '@/src/hooks/useThemedColors';

// Utility function to safely render text values
const safeText = (value: any, fallback: string = ''): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  return fallback;
};

export default function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getDebtById, deleteDebt, getDebtsByPerson } = useDebtContext();
  const styles = useThemedStyles(createStyles);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  const debt = id ? getDebtById(id) : null;

  // Helper function for showing alert dialogs
  const showAlert = (title: string, message: string) => {
    setAlertDialog({ visible: true, title, message });
  };

  const hideAlert = () => {
    setAlertDialog({ visible: false, title: '', message: '' });
  };

  if (!debt) {
    return (
      <ScreenLayout>
        <View style={styles.errorContainer}>
          <Text variant="titleMedium" style={styles.errorText}>
            Entry not found
          </Text>
          <Button mode="contained" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </ScreenLayout>
    );
  }

  // Calculate running balance as of this entry
  const allCustomerDebts = getDebtsByPerson(debt.name)
    .filter(d => !(d.amount === 0 && d.status === 'paid' && d.note === 'Customer created - no transactions yet'))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  let runningBalance = 0;
  for (const d of allCustomerDebts) {
    const debtAmount = d.type === 'gave' ? d.amount : -d.amount;
    runningBalance += debtAmount;
    if (d.id === debt.id) break;
  }

  // Format date as "13 Jul 25 • 04:45 PM"
  const formatFullTimestamp = (date: Date): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
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

  const handleEdit = () => {
    router.push(`/add-debt?editId=${debt.id}` as any);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDebt(debt.id);
      setShowDeleteDialog(false);
      showAlert(
        'Entry Deleted',
        'The entry has been deleted and balances have been updated.'
      );
      // Navigate back after showing success message
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      console.error('Error deleting entry:', error);
      setShowDeleteDialog(false);
      showAlert('Error', 'Failed to delete entry. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isPositiveBalance = runningBalance >= 0;
  const absoluteBalance = Math.abs(runningBalance);
  const isGave = debt.type === 'gave';

  return (
    <ScreenLayout>
      <View style={styles.container}>
        {/* Entry Detail Card */}
        <Card style={styles.detailCard}>
          <Card.Content>
            {/* Customer Name */}
            <Text variant="titleMedium" style={styles.customerName}>
              {safeText(debt.name, 'Unknown Customer')}
            </Text>

            {/* Transaction Type and Amount */}
            <View style={styles.amountSection}>
              <View style={[
                styles.typeIndicator,
                { backgroundColor: isGave ? '#F44336' : '#4CAF50' }
              ]}>
                <Text variant="labelMedium" style={styles.typeText}>
                  {debt.type === 'gave' ? 'YOU GAVE' : 'YOU GOT'}
                </Text>
              </View>
              <Text variant="headlineMedium" style={[
                styles.amount,
                { color: isGave ? '#F44336' : '#4CAF50' }
              ]}>
                {debt.amount !== undefined && debt.amount !== null ? formatCurrency(debt.amount) : '₹0.00'}
              </Text>
            </View>

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Text variant="labelMedium" style={styles.label}>
                Description
              </Text>
              <Text variant="bodyLarge" style={styles.description}>
                {safeText(debt.note, 'No description provided')}
              </Text>
            </View>

            {/* Date and Time */}
            <View style={styles.dateSection}>
              <Text variant="labelMedium" style={styles.label}>
                Date & Time
              </Text>
              <Text variant="bodyLarge" style={styles.dateTime}>
                {debt.date ? formatFullTimestamp(debt.date) : 'Unknown date'}
              </Text>
            </View>

            {/* Running Balance */}
            <View style={styles.balanceSection}>
              <Text variant="labelMedium" style={styles.label}>
                Running Balance (as of this entry)
              </Text>
              <View style={styles.balanceContainer}>
                <Text variant="titleLarge" style={[
                  styles.runningBalanceAmount,
                  { color: isPositiveBalance ? '#4CAF50' : '#F44336' }
                ]}>
                  {absoluteBalance !== undefined && absoluteBalance !== null ? formatCurrency(absoluteBalance) : '₹0.00'}
                </Text>
                <Text variant="bodyMedium" style={styles.balanceLabel}>
                  {runningBalance >= 0 ? 'They owe you' : 'You owe them'}
                </Text>
              </View>
            </View>

            {/* Edit Button */}
            <Button
              mode="contained"
              onPress={handleEdit}
              style={styles.editButton}
              icon="pencil"
            >
              Edit Entry
            </Button>
          </Card.Content>
        </Card>

        {/* Delete Button (at bottom) */}
        <Button
          mode="outlined"
          onPress={handleDelete}
          style={styles.deleteButton}
          buttonColor="transparent"
          textColor="#F44336"
          icon="delete"
          loading={isDeleting}
          disabled={isDeleting}
        >
          Delete Entry
        </Button>
      </View>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={showDeleteDialog}
        onDismiss={() => setShowDeleteDialog(false)}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone and will update the running balance."
        onConfirm={confirmDelete}
        confirmText="Delete"
        loading={isDeleting}
      />

      {/* Alert Dialog */}
      <AlertDialog
        visible={alertDialog.visible}
        onDismiss={hideAlert}
        title={alertDialog.title}
        message={alertDialog.message}
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
  
  // Header with back button
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    color: colors.onBackground,
  },
  pageTitle: {
    color: colors.onBackground,
    fontWeight: 'bold',
  },
  
  // Detail card
  detailCard: {
    backgroundColor: colors.surface,
    marginBottom: 24,
    borderRadius: 12,
    elevation: 4,
  },
  
  // Customer name
  customerName: {
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  
  // Amount section
  amountSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  typeIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  typeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  amount: {
    fontWeight: 'bold',
  },
  
  // Description section
  descriptionSection: {
    marginBottom: 24,
  },
  label: {
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    color: colors.onSurface,
    lineHeight: 22,
  },
  
  // Date section
  dateSection: {
    marginBottom: 24,
  },
  dateTime: {
    color: colors.onSurface,
    fontWeight: '500',
  },
  
  // Balance section
  balanceSection: {
    marginBottom: 32,
  },
  balanceContainer: {
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    padding: 16,
    borderRadius: 12,
  },
  runningBalanceAmount: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceLabel: {
    color: colors.onSurfaceVariant,
  },
  
  // Buttons
  editButton: {
    borderRadius: 8,
  },
  deleteButton: {
    borderRadius: 8,
    borderColor: '#F44336',
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
