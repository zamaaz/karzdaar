import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Share, Platform } from 'react-native';
import { 
  Text, 
  Button, 
  Card, 
  Chip, 
  FAB, 
  Divider, 
  ActivityIndicator,
  TextInput,
  Dialog,
  Portal
} from 'react-native-paper';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { ScreenLayout, ConfirmDialog, AlertDialog } from '@/src/components/common';
import { useDebtContext } from '@/src/store';
import { formatCurrency } from '@/src/utils';
import { Debt } from '@/src/types';
import { useThemedColors, useThemedStyles } from '@/src/hooks/useThemedColors';

interface DebtDetailScreenProps {
  debtId: string;
}

export default function DebtDetailScreen({ debtId }: DebtDetailScreenProps) {
  const { state, getDebtById, markAsPaid, deleteDebt, addPartialPayment, getDebtsByPerson } = useDebtContext();
  const [debt, setDebt] = useState<Debt | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Dialog states
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });
  const [markPaidLoading, setMarkPaidLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Theme-aware styles and colors
  const colors = useThemedColors();
  const styles = useThemedStyles(createStyles);

  useEffect(() => {
    const foundDebt = getDebtById(debtId);
    setDebt(foundDebt || null);
  }, [debtId, state.debts, getDebtById]);

  // Helper function for showing alert dialogs
  const showAlert = (title: string, message: string) => {
    setAlertDialog({ visible: true, title, message });
  };

  const hideAlert = () => {
    setAlertDialog({ visible: false, title: '', message: '' });
  };

  const handleEdit = () => {
    router.push(`/add-debt?editId=${debtId}` as any);
  };

  const handleMarkAsPaid = async () => {
    if (!debt) return;
    setShowMarkPaidDialog(true);
  };

  const confirmMarkAsPaid = async () => {
    if (!debt) return;
    
    setMarkPaidLoading(true);
    try {
      await markAsPaid(debtId);
      setShowMarkPaidDialog(false);
      router.back();
    } catch (err) {
      console.error('Error marking as paid:', err);
      setShowMarkPaidDialog(false);
      showAlert('Error', 'Failed to mark as paid');
    } finally {
      setMarkPaidLoading(false);
    }
  };

  const handlePartialPayment = async () => {
    if (!debt || !paymentAmount.trim()) {
      showAlert('Error', 'Please enter a valid payment amount');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      showAlert('Error', 'Please enter a valid positive amount');
      return;
    }

    const amountInPaise = Math.round(amount * 100);
    if (amountInPaise > debt.amount) {
      showAlert('Error', 'Payment amount cannot exceed the debt amount');
      return;
    }

    setLoading(true);
    try {
      await addPartialPayment(debtId, amountInPaise, paymentNote.trim() || undefined);
      
      setShowPaymentDialog(false);
      setPaymentAmount('');
      setPaymentNote('');
      
      const remainingAmount = debt.amount - amountInPaise;
      if (remainingAmount === 0) {
        showAlert('Success', 'Debt has been fully paid!');
        setTimeout(() => router.back(), 1500); // Auto-navigate after showing success message
      } else {
        showAlert('Success', `Payment of ₹${Math.round(amount)} recorded!`);
      }
    } catch (err) {
      console.error('Error recording payment:', err);
      showAlert('Error', 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!debt) return;
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!debt) return;
    
    setDeleteLoading(true);
    try {
      await deleteDebt(debtId);
      setShowDeleteDialog(false);
      router.back();
    } catch (err) {
      console.error('Error deleting debt:', err);
      setShowDeleteDialog(false);
      showAlert('Error', 'Failed to delete entry');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Generate formatted text for sharing
  const generateShareText = (currentDebt: Debt): string => {
    // Get all debts for this person
    const personDebts = getDebtsByPerson(currentDebt.name);
    
    // Handle case where no debts found
    if (personDebts.length === 0) {
      return `📊 DEBT HISTORY REPORT\n=======================\n\n📝 Contact: ${currentDebt.name}\n❌ No debt history found.`;
    }
    
    // Sort by date (oldest first)
    const sortedDebts = personDebts.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    const contactName = currentDebt.name;
    const exportDate = new Date().toLocaleDateString('en-IN');
    
    let shareText = `📊 DEBT HISTORY REPORT\n`;
    shareText += `=======================\n\n`;
    shareText += `📝 Contact: ${contactName}\n`;
    shareText += `📅 Export Date: ${exportDate}\n`;
    shareText += `📱 Generated by Karzdaar App\n\n`;
    
    // Summary section
    const totalGave = sortedDebts.filter(d => d.type === 'gave').reduce((sum, d) => sum + (d.originalAmount || d.amount), 0);
    const totalGot = sortedDebts.filter(d => d.type === 'got').reduce((sum, d) => sum + (d.originalAmount || d.amount), 0);
    const totalPaid = sortedDebts.reduce((sum, d) => sum + ((d.originalAmount || d.amount) - d.amount), 0);
    const totalOutstanding = sortedDebts.reduce((sum, d) => sum + d.amount, 0);
    
    shareText += `💰 SUMMARY\n`;
    shareText += `----------\n`;
    shareText += `Money You Gave: ${formatCurrency(totalGave)}\n`;
    shareText += `Money You Got: ${formatCurrency(totalGot)}\n`;
    shareText += `Total Paid: ${formatCurrency(totalPaid)}\n`;
    shareText += `Outstanding: ${formatCurrency(totalOutstanding)}\n`;
    shareText += `Net Balance: ${formatCurrency(totalGave - totalGot)}\n\n`;
    
    // Detailed entries
    shareText += `📋 DETAILED ENTRIES (${sortedDebts.length})\n`;
    shareText += `===================\n\n`;
    
    sortedDebts.forEach((debt, index) => {
      shareText += `${index + 1}. ${debt.type === 'gave' ? '💸 YOU GAVE' : '💰 YOU GOT'}\n`;
      shareText += `   Amount: ${formatCurrency(debt.originalAmount || debt.amount)}\n`;
      shareText += `   Current: ${formatCurrency(debt.amount)}\n`;
      shareText += `   Status: ${debt.status?.toUpperCase() || 'PENDING'}\n`;
      shareText += `   Date: ${debt.date.toLocaleDateString('en-IN')}\n`;
      if (debt.dueDate) {
        shareText += `   Due: ${debt.dueDate.toLocaleDateString('en-IN')}\n`;
      }
      shareText += `   Note: ${debt.note || 'No description'}\n`;
      
      // Payment history
      if (debt.payments && debt.payments.length > 0) {
        shareText += `   💳 Payments (${debt.payments.length}):\n`;
        debt.payments.forEach((payment, pIndex) => {
          shareText += `      ${pIndex + 1}. ${formatCurrency(payment.amount)} on ${payment.paymentDate.toLocaleDateString('en-IN')}\n`;
          if (payment.description) {
            shareText += `         Note: ${payment.description}\n`;
          }
        });
      }
      shareText += `\n`;
    });
    
    shareText += `---\n`;
    shareText += `📱 Manage your debts with Karzdaar\n`;
    shareText += `Generated on ${new Date().toLocaleString('en-IN')}`;
    
    return shareText;
  };

  // Generate CSV format
  const generateCSV = (currentDebt: Debt): string => {
    const personDebts = getDebtsByPerson(currentDebt.name);
    const sortedDebts = personDebts.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let csv = `Contact,Type,Original Amount,Current Amount,Status,Date,Due Date,Note,Payments\n`;
    
    sortedDebts.forEach(debt => {
      const paymentsStr = debt.payments?.map(p => 
        `${formatCurrency(p.amount)} on ${p.paymentDate.toLocaleDateString('en-IN')}`
      ).join('; ') || '';
      
      csv += `"${debt.name}","${debt.type}","${formatCurrency(debt.originalAmount || debt.amount)}","${formatCurrency(debt.amount)}","${debt.status || 'pending'}","${debt.date.toLocaleDateString('en-IN')}","${debt.dueDate?.toLocaleDateString('en-IN') || ''}","${debt.note}","${paymentsStr}"\n`;
    });
    
    return csv;
  };

  // Handle share functionality
  const handleShare = async () => {
    if (!debt) return;
    setShowShareDialog(true);
  };

  const shareAsText = async () => {
    if (!debt) return;
    setShowShareDialog(false);
    
    try {
      const shareText = generateShareText(debt);
      
      if (Platform.OS === 'web') {
        // For web, use navigator.share or fallback to copying
        if (navigator.share) {
          await navigator.share({
            title: `Debt History - ${debt.name}`,
            text: shareText
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(shareText);
          showAlert('Copied', 'Debt history copied to clipboard');
        }
      } else {
        // For mobile, use React Native's Share API
        await Share.share({
          message: shareText,
          title: `Debt History - ${debt.name}`
        });
      }
    } catch (error) {
      console.error('Error sharing text:', error);
      showAlert('Error', 'Failed to share as text');
    }
  };

  const shareAsCSV = async () => {
    if (!debt) return;
    setShowShareDialog(false);
    
    try {
      const csvContent = generateCSV(debt);
      const fileName = `debt_history_${debt.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showAlert('Success', 'CSV file downloaded');
      } else {
        // For mobile, create a temporary file and share it
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, csvContent);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          showAlert('Error', 'Sharing is not available on this device');
        }
      }
    } catch (error) {
      console.error('Error sharing CSV:', error);
      showAlert('Error', 'Failed to share as CSV');
    }
  };

  if (!debt) {
    return (
      <ScreenLayout>
        <View style={[styles.container, styles.centered]}>
          <Text variant="titleLarge">Debt not found</Text>
          <Button mode="contained" onPress={() => router.back()}>
            Go Back
          </Button>
        </View>
      </ScreenLayout>
    );
  }  
  const isCredit = debt.type === 'gave';
  const isPaid = debt.status === 'paid';
  const isOverdue = debt.dueDate && debt.dueDate < new Date() && !isPaid;
  const amountColor = isCredit ? { color: colors.getDebtColor('gave') } : { color: colors.getDebtColor('got') };

  // Helper function to format time nicely
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Helper function to format date nicely
  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  };

  // Group transactions by date
  const groupTransactionsByDate = () => {
    if (!debt?.payments) return [];

    // Create initial debt entry
    const allTransactions = [
      {
        id: 'initial-debt',
        type: 'debt_created',
        amount: debt.originalAmount || debt.amount,
        date: debt.date,
        description: `${debt.type === 'gave' ? 'Credit given' : 'Debt recorded'} - ${debt.note || 'No description'}`,
        isInitial: true,
        runningBalance: debt.originalAmount || debt.amount,
      },
      ...debt.payments.map((payment, index) => {
        // Calculate running balance
        const previousPayments = debt.payments.slice(0, index + 1);
        const totalPaid = previousPayments.reduce((sum, p) => sum + p.amount, 0);
        const runningBalance = (debt.originalAmount || debt.amount) - totalPaid;
        
        return {
          id: payment.id,
          type: payment.type,
          amount: payment.amount,
          date: payment.paymentDate,
          description: payment.description || 'Payment',
          isInitial: false,
          runningBalance,
        };
      })
    ];

    // Sort by date (newest first for chat-like feel)
    allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

    // Group by date
    const grouped: { [key: string]: any[] } = {};
    allTransactions.forEach(transaction => {
      const dateKey = transaction.date.toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(transaction);
    });

    return Object.entries(grouped).map(([dateKey, transactions]) => ({
      date: new Date(dateKey),
      transactions: transactions.sort((a, b) => b.date.getTime() - a.date.getTime())
    }));
  };

  // Render grouped transactions
  const renderGroupedTransactions = () => {
    const groupedTransactions = groupTransactionsByDate();

    return groupedTransactions.map((group, groupIndex) => (
      <View key={group.date.toDateString()}>
        {/* Date Header */}
        <View style={styles.dateHeader}>
          <Text variant="bodySmall" style={styles.dateHeaderText}>
            {formatDate(group.date)}
          </Text>
        </View>

        {/* Transactions for this date */}
        {group.transactions.map((transaction, index) => (
          <View key={transaction.id} style={styles.transactionContainer}>
            <View style={[
              styles.transactionBubble,
              transaction.isInitial ? styles.initialTransactionBubble : 
              transaction.type === 'full' ? styles.fullPaymentBubble : styles.partialPaymentBubble
            ]}>
              {/* Transaction Header */}
              <View style={styles.transactionHeader}>
                <Text variant="bodyMedium" style={[
                  styles.transactionAmount,
                  transaction.isInitial ? styles.initialTransactionAmount :
                  transaction.type === 'full' ? styles.fullTransactionAmount : styles.partialTransactionAmount
                ]}>
                  <Text>{transaction.isInitial ? '+' : '-'}</Text>
                  <Text>{formatCurrency(transaction.amount || 0)}</Text>
                </Text>
                <Text variant="bodySmall" style={styles.transactionTime}>
                  {formatTime(transaction.date)}
                </Text>
              </View>

              {/* Transaction Description */}
              <Text variant="bodyMedium" style={styles.transactionDescription}>
                {transaction.description || 'No description'}
              </Text>

              {/* Running Balance Display */}
              <View style={styles.balanceContainer}>
                <Text variant="bodySmall" style={styles.balanceLabel}>
                  {transaction.isInitial ? 'Initial amount:' : 'Remaining balance:'}
                </Text>
                <Text variant="bodyMedium" style={[
                  styles.balanceAmount,
                  transaction.runningBalance === 0 ? styles.zeroBalance : styles.activeBalance
                ]}>
                  <Text>{formatCurrency(transaction.runningBalance || 0)}</Text>
                </Text>
              </View>

              {/* Transaction Type Indicator */}
              <View style={styles.transactionFooter}>
                <Chip 
                  mode="outlined" 
                  compact
                  style={[
                    styles.transactionTypeChip,
                    transaction.isInitial ? styles.initialChip :
                    transaction.type === 'full' ? styles.fullPaymentChip : styles.partialPaymentChip
                  ]}
                  textStyle={{ 
                    fontSize: 10,
                    color: transaction.isInitial ? colors.primary :
                           transaction.type === 'full' ? colors.getStatusColor('paid') : colors.getStatusColor('pending')
                  }}
                >
                  {transaction.isInitial 
                    ? (debt?.type === 'gave' ? 'CREDIT' : 'DEBT') 
                    : (transaction.type === 'full' 
                      ? 'FULL PAYMENT' 
                      : 'PARTIAL PAYMENT')
                  }
                </Chip>
              </View>
            </View>
          </View>
        ))}

        {/* Add spacing between date groups */}
        {groupIndex < groupedTransactions.length - 1 && (
          <View style={styles.dateGroupSeparator} />
        )}
      </View>
    ));
  };

  return (
    <ScreenLayout scrollable>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={[styles.title, isPaid && styles.paidText]}>
            {debt.name}
          </Text>
          <View style={styles.chipContainer}>
            <Chip 
              mode="outlined" 
              style={[
                styles.typeChip, 
                { 
                  backgroundColor: colors.getDebtBackgroundColor(debt.type),
                  borderColor: colors.getDebtColor(debt.type)
                }
              ]}
              textStyle={{ color: colors.getDebtOnContainerColor(debt.type) }}
            >
              {isCredit ? 'You Gave' : 'You Owe'}
            </Chip>
            {isPaid && (
              <Chip 
                mode="outlined" 
                style={[
                  styles.paidChip,
                  { 
                    backgroundColor: colors.getStatusBackgroundColor('paid'),
                    borderColor: colors.getStatusColor('paid')
                  }
                ]}
                textStyle={{ color: colors.getStatusOnContainerColor('paid') }}
              >
                PAID
              </Chip>
            )}
            {isOverdue && (
              <Chip 
                mode="outlined" 
                style={[
                  styles.overdueChip,
                  { 
                    backgroundColor: colors.getStatusBackgroundColor('overdue'),
                    borderColor: colors.getStatusColor('overdue')
                  }
                ]}
                textStyle={{ color: colors.getStatusOnContainerColor('overdue') }}
              >
                OVERDUE
              </Chip>
            )}
          </View>
        </View>

        {/* Amount Card */}
        <Card style={[styles.card, isPaid && styles.paidCard]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Amount</Text>
            <Text variant="displaySmall" style={[styles.amount, amountColor, isPaid && styles.paidText]}>
              {formatCurrency(debt.amount || 0)}
            </Text>
            {debt.status === 'partial' && (
              <Text variant="bodyMedium" style={styles.partialNote}>
                (Partial payment recorded)
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Details</Text>
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Description:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {debt.note || 'No description provided'}
              </Text>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.detailRow}>
              <Text variant="bodyMedium" style={styles.detailLabel}>Date Created:</Text>
              <Text variant="bodyMedium" style={styles.detailValue}>
                {debt.date.toLocaleDateString()}
              </Text>
            </View>
            
            {debt.dueDate && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>Due Date:</Text>
                  <Text variant="bodyMedium" style={[
                    styles.detailValue,
                    isOverdue && styles.overdueText
                  ]}>
                    {debt.dueDate.toLocaleDateString()}
                  </Text>
                </View>
              </>
            )}
            
            {debt.updatedAt && debt.updatedAt.getTime() !== debt.date.getTime() && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.detailRow}>
                  <Text variant="bodyMedium" style={styles.detailLabel}>Last Updated:</Text>
                  <Text variant="bodyMedium" style={styles.detailValue}>
                    {debt.updatedAt.toLocaleDateString()}
                  </Text>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Payment History Card */}
        {debt.payments && debt.payments.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Transaction History</Text>
              <Text variant="bodySmall" style={styles.historySubtitle}>
                {debt.payments.length} transaction{debt.payments.length !== 1 ? 's' : ''}
              </Text>
              
              <View style={styles.transactionHistory}>
                {renderGroupedTransactions()}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Actions Card */}
        {!isPaid && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>Actions</Text>
              
              <View style={styles.actionButtons}>
                <Button
                  mode="outlined"
                  style={styles.actionButton}
                  onPress={() => setShowPaymentDialog(true)}
                  disabled={loading}
                >
                  Add Payment
                </Button>
                
                <Button
                  mode="contained"
                  style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                  onPress={handleMarkAsPaid}
                  disabled={loading}
                >
                  Mark as Paid
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Management Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Manage</Text>
            
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                style={styles.actionButton}
                onPress={handleEdit}
                disabled={loading}
                icon="pencil"
              >
                Edit Details
              </Button>
              
              <Button
                mode="outlined"
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShare}
                disabled={loading}
                icon="share-variant"
              >
                Share History
              </Button>
            </View>
            
            <Text variant="bodySmall" style={styles.shareHint}>
              📤 Share complete debt history for {debt.name} as text or CSV file
            </Text>
            
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
                disabled={loading}
                textColor="#F44336"
                icon="delete"
              >
                Delete
              </Button>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="pencil"
        style={styles.fab}
        onPress={handleEdit}
        disabled={loading}
      />

      {/* Partial Payment Dialog */}
      <Portal>
        <Dialog visible={showPaymentDialog} onDismiss={() => setShowPaymentDialog(false)}>
          <Dialog.Title>Add Payment</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.dialogText}>
              Current amount: {formatCurrency(debt.amount || 0)}
            </Text>
            
            <TextInput
              label="Payment Amount"
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
              style={styles.input}
              placeholder="0.00"
            />
            
            <TextInput
              label="Payment Note (Optional)"
              value={paymentNote}
              onChangeText={setPaymentNote}
              style={styles.input}
              placeholder="e.g., Partial payment via bank transfer"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowPaymentDialog(false)}>Cancel</Button>
            <Button onPress={handlePartialPayment} disabled={loading}>
              {loading ? <ActivityIndicator size="small" /> : 'Add Payment'}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Mark as Paid Confirmation Dialog */}
      <ConfirmDialog
        visible={showMarkPaidDialog}
        onDismiss={() => setShowMarkPaidDialog(false)}
        title="Mark as Paid"
        message={`Are you sure you want to mark this ${debt?.type === 'gave' ? 'credit' : 'debt'} as fully paid?`}
        onConfirm={confirmMarkAsPaid}
        confirmText="Mark Paid"
        loading={markPaidLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        visible={showDeleteDialog}
        onDismiss={() => setShowDeleteDialog(false)}
        title="Delete Entry"
        message={`Are you sure you want to delete this ${debt?.type === 'gave' ? 'credit' : 'debt'}? This action cannot be undone.`}
        onConfirm={confirmDelete}
        confirmText="Delete"
        loading={deleteLoading}
      />

      {/* Share Options Dialog */}
      <Portal>
        <Dialog visible={showShareDialog} onDismiss={() => setShowShareDialog(false)}>
          <Dialog.Title>Share Options</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Choose format to share</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowShareDialog(false)}>Cancel</Button>
            <Button onPress={shareAsText}>Text Format</Button>
            <Button onPress={shareAsCSV} mode="contained">CSV File</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
    padding: 16,
    backgroundColor: colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: 'bold',
    color: colors.onBackground,
  },
  chipContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    alignSelf: 'center',
  },
  paidChip: {
    // Background and border will be set dynamically
  },
  overdueChip: {
    // Background and border will be set dynamically
  },
  card: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  paidCard: {
    opacity: 0.7,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    color: colors.primary,
  },
  amount: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginVertical: 8,
    color: colors.onSurface,
  },
  creditAmount: {
    color: colors.getDebtColor('gave'),
  },
  debtAmount: {
    color: colors.getDebtColor('got'),
  },
  paidText: {
    opacity: 0.6,
    textDecorationLine: 'line-through',
  },
  partialNote: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: colors.getStatusColor('pending'),
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  detailLabel: {
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
    color: colors.onSurface,
  },
  detailValue: {
    flex: 2,
    textAlign: 'right',
    color: colors.onSurfaceVariant,
  },
  overdueText: {
    color: colors.getStatusColor('overdue'),
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
    backgroundColor: colors.divider,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    borderColor: colors.error,
  },
  shareButton: {
    borderColor: colors.primary,
  },
  shareHint: {
    textAlign: 'center',
    opacity: 0.7,
    marginTop: 8,
    marginBottom: 16,
    fontStyle: 'italic',
    color: colors.onSurfaceVariant,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  bottomSpacer: {
    height: 80,
  },
  dialogText: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: colors.onSurface,
  },
  input: {
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  // Transaction history styles
  historySubtitle: {
    opacity: 0.7,
    marginBottom: 16,
    color: colors.onSurfaceVariant,
  },
  transactionHistory: {
    marginTop: 8,
  },
  dateHeader: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateHeaderText: {
    backgroundColor: isDark ? colors.surfaceVariant : '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  transactionContainer: {
    marginBottom: 12,
  },
  transactionBubble: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
    elevation: isDark ? 0 : 1,
    shadowColor: colors.shadow || '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0 : 0.1,
    shadowRadius: 2,
  },
  initialTransactionBubble: {
    backgroundColor: isDark ? colors.primaryContainer : '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  fullPaymentBubble: {
    backgroundColor: colors.getStatusBackgroundColor('paid'),
    borderLeftWidth: 4,
    borderLeftColor: colors.getStatusColor('paid'),
  },
  partialPaymentBubble: {
    backgroundColor: colors.getStatusBackgroundColor('pending'),
    borderLeftWidth: 4,
    borderLeftColor: colors.getStatusColor('pending'),
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.onSurface,
  },
  initialTransactionAmount: {
    color: colors.primary,
  },
  fullTransactionAmount: {
    color: colors.getStatusColor('paid'),
  },
  partialTransactionAmount: {
    color: colors.getStatusColor('pending'),
  },
  transactionTime: {
    opacity: 0.7,
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  transactionDescription: {
    marginBottom: 8,
    lineHeight: 20,
    color: colors.onSurface,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  balanceLabel: {
    opacity: 0.7,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  balanceAmount: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.onSurface,
  },
  zeroBalance: {
    color: colors.getStatusColor('paid'),
  },
  activeBalance: {
    color: colors.primary,
  },
  transactionFooter: {
    alignItems: 'flex-start',
  },
  transactionTypeChip: {
    height: 20,
  },
  initialChip: {
    backgroundColor: colors.primaryContainer,
  },
  fullPaymentChip: {
    backgroundColor: colors.getStatusBackgroundColor('paid'),
  },
  partialPaymentChip: {
    backgroundColor: colors.getStatusBackgroundColor('pending'),
  },
  dateGroupSeparator: {
    height: 16,
  },
  // Legacy payment history styles (keeping for compatibility)
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 12,
  },
  paymentDescription: {
    fontWeight: '500',
    marginBottom: 4,
    color: colors.onSurface,
  },
  paymentDate: {
    opacity: 0.7,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  paymentAmount: {
    fontWeight: 'bold',
    textAlign: 'right',
    color: colors.onSurface,
  },
  fullPaymentAmount: {
    color: colors.getStatusColor('paid'),
  },
  partialPaymentAmount: {
    color: colors.getStatusColor('pending'),
  },
  paymentDivider: {
    marginVertical: 4,
    backgroundColor: colors.divider,
  },
});
