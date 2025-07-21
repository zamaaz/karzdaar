import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, Card, TextInput, Snackbar } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { ScreenLayout } from '@/src/components/common';
import { useDebtContext } from '@/src/store';
import { DebtType } from '@/src/types';
import { useThemedStyles } from '@/src/hooks/useThemedColors';
import { DatePickerModal, TimePickerModal } from 'react-native-paper-dates';

export default function AddDebtScreen() {
  const { type, editId, customer } = useLocalSearchParams();
  const { addDebt, updateDebt, getDebtById, processPaymentAgainstDebts } = useDebtContext();
  
  const styles = useThemedStyles(createStyles);
  
  const isEditMode = !!editId;
  const existingDebt = isEditMode ? getDebtById(editId as string) : null;
  const prefilledCustomer = customer ? decodeURIComponent(customer as string) : '';
  
  const [formData, setFormData] = useState({
    name: existingDebt?.name || prefilledCustomer || '',
    amount: existingDebt?.amount ? (existingDebt.amount / 100).toString() : '',
    note: existingDebt?.note || '',
    type: existingDebt?.type || (type as DebtType) || 'got',
    dueDate: existingDebt?.dueDate?.toISOString().split('T')[0] || '', // YYYY-MM-DD format
    transactionDate: existingDebt?.date || new Date(),
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);

  // Update form data when existing debt changes
  useEffect(() => {
    if (existingDebt) {
      setFormData({
        name: existingDebt.name,
        amount: existingDebt.amount ? (existingDebt.amount / 100).toString() : '',
        note: existingDebt.note,
        type: existingDebt.type,
        dueDate: existingDebt.dueDate?.toISOString().split('T')[0] || '',
        transactionDate: existingDebt.date || new Date(),
      });
    }
  }, [existingDebt]);

  const isCredit = formData.type === 'gave';

  // Format date and time for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleDateConfirm = (params: any) => {
    setDatePickerOpen(false);
    if (params?.date) {
      const newDate = new Date(formData.transactionDate);
      newDate.setFullYear(params.date.getFullYear(), params.date.getMonth(), params.date.getDate());
      setFormData(prev => ({ ...prev, transactionDate: newDate }));
    }
  };

  const handleTimeConfirm = ({ hours, minutes }: { hours: number; minutes: number }) => {
    setTimePickerOpen(false);
    const newDate = new Date(formData.transactionDate);
    newDate.setHours(hours, minutes);
    setFormData(prev => ({ ...prev, transactionDate: newDate }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Please enter a valid amount';
      }
    }

    if (!formData.note.trim()) {
      newErrors.note = 'Note is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert amount to paise (multiply by 100)
      const amountInPaise = Math.round(parseFloat(formData.amount) * 100);
      
      if (isEditMode && editId) {
        // Update existing debt
        const updates = {
          name: formData.name.trim(),
          amount: amountInPaise,
          note: formData.note.trim(),
          type: formData.type,
          updatedAt: new Date(),
          // Add dueDate if provided
          ...(formData.dueDate.trim() && { 
            dueDate: new Date(formData.dueDate) 
          })
        };

        await updateDebt(editId as string, updates);
      } else {
        // Create new entry
        const amountInPaise = Math.round(parseFloat(formData.amount) * 100);
        
        // Always create a transaction entry regardless of type
        const debtData = {
          name: formData.name.trim(),
          amount: amountInPaise,
          originalAmount: amountInPaise,
          note: formData.note.trim(),
          type: formData.type,
          date: formData.transactionDate,
          status: formData.type === 'got' ? 'paid' as const : 'pending' as const, // GOT entries are immediately paid
          payments: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          // Add dueDate if provided
          ...(formData.dueDate.trim() && { 
            dueDate: new Date(formData.dueDate) 
          })
        };

        if (formData.type === 'got') {
          // For GOT PAYMENT, always create a visible transaction entry
          await addDebt(debtData);
          
          // Also process payment against existing "gave" debts (this handles overpayments internally)
          await processPaymentAgainstDebts(formData.name.trim(), amountInPaise);
        } else {
          // Create new debt for "gave" type
          await addDebt(debtData);
        }
      }

      // Show success and go back
      setShowSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);

    } catch (error) {
      console.error('Error saving debt:', error);
      setErrors({ submit: 'Failed to save debt. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScreenLayout>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          style={styles.container} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          <Text variant="headlineMedium" style={styles.title}>
            {isEditMode ? 'Edit Transaction' : (isCredit ? 'Lent Money' : 'Got Payment')}
          </Text>

          <Card style={styles.card}>
            <Card.Content>
              {/* Name Input */}
              <TextInput
                label="Person/Entity Name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                mode="outlined"
                style={styles.input}
                error={!!errors.name}
                placeholder="e.g., John Doe, ABC Company"
                disabled={!!prefilledCustomer && !isEditMode}
              />
              {errors.name && <Text variant="bodySmall" style={styles.errorText}>{errors.name}</Text>}

              {/* Amount Input */}
              <TextInput
                label="Amount (₹)"
                value={formData.amount}
                onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
                mode="outlined"
                style={styles.input}
                keyboardType="numeric"
                error={!!errors.amount}
                placeholder="0.00"
                left={<TextInput.Affix text="₹" />}
              />
              {errors.amount && <Text variant="bodySmall" style={styles.errorText}>{errors.amount}</Text>}

              {/* Note Input */}
              <TextInput
                label="Note/Description"
                value={formData.note}
                onChangeText={(text) => setFormData(prev => ({ ...prev, note: text }))}
                mode="outlined"
                style={[styles.input, styles.noteInput]}
                multiline
                numberOfLines={3}
                error={!!errors.note}
                placeholder="What was this for?"
                textAlignVertical="top"
              />
              {errors.note && <Text variant="bodySmall" style={styles.errorText}>{errors.note}</Text>}

              {/* Date Picker */}
              <Text variant="titleSmall" style={styles.fieldLabel}>Transaction Date & Time</Text>
              <TextInput
                label="Date"
                value={formatDate(formData.transactionDate)}
                mode="outlined"
                style={styles.input}
                editable={false}
                right={<TextInput.Icon icon="calendar" onPress={() => setDatePickerOpen(true)} />}
              />

              {/* Time Picker */}
              <TextInput
                label="Time"
                value={formatTime(formData.transactionDate)}
                mode="outlined"
                style={styles.input}
                editable={false}
                right={<TextInput.Icon icon="clock" onPress={() => setTimePickerOpen(true)} />}
              />

              {/* Due Date Input (only for "gave" type) */}
              {isCredit && (
                <>
                  <TextInput
                    label="Due Date (Optional)"
                    value={formData.dueDate}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, dueDate: text }))}
                    mode="outlined"
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    error={!!errors.dueDate}
                  />
                  {errors.dueDate && <Text variant="bodySmall" style={styles.errorText}>{errors.dueDate}</Text>}
                </>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <Text variant="bodySmall" style={[styles.errorText, styles.submitError]}>
                  {errors.submit}
                </Text>
              )}
            </Card.Content>

            <Card.Actions style={styles.actions}>
              <Button 
                mode="outlined" 
                onPress={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isEditMode ? 'Update Transaction' : (isCredit ? 'Save Loan' : 'Save Payment')}
              </Button>
            </Card.Actions>
          </Card>
        </ScrollView>

        {/* Date Picker Modal */}
        <DatePickerModal
          locale="en-GB"
          mode="single"
          visible={datePickerOpen}
          onDismiss={() => setDatePickerOpen(false)}
          date={formData.transactionDate}
          onConfirm={handleDateConfirm}
          presentationStyle="overFullScreen"
        />

        {/* Time Picker Modal */}
        <TimePickerModal
          visible={timePickerOpen}
          onDismiss={() => setTimePickerOpen(false)}
          onConfirm={handleTimeConfirm}
          hours={formData.transactionDate.getHours()}
          minutes={formData.transactionDate.getMinutes()}
        />

        <Snackbar
          visible={showSuccess}
          onDismiss={() => setShowSuccess(false)}
          duration={1500}
        >
          {isCredit ? 'Loan' : 'Payment'} {isEditMode ? 'updated' : 'recorded'} successfully!
        </Snackbar>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  title: {
    fontWeight: '800',
    marginBottom: 24,
    color: colors.onBackground,
  },
  card: {
    marginBottom: 20,
    backgroundColor: colors.surface,
  },
  fieldLabel: {
    marginBottom: 8,
    marginTop: 8,
    color: colors.onSurface,
  },
  segmentedButtons: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: colors.surface,
  },
  noteInput: {
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    marginBottom: 8,
    marginLeft: 4,
  },
  helperText: {
    color: colors.primary,
    marginBottom: 8,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  submitError: {
    marginTop: 8,
    textAlign: 'center',
    color: colors.error,
  },
  actions: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
});
