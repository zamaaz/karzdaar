import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, Button, Card } from 'react-native-paper';
import { router } from 'expo-router';
import { ScreenLayout, AlertDialog } from '@/src/components/common';
import { useDebtContext } from '@/src/store';
import { useThemedStyles } from '@/src/hooks/useThemedColors';
import { useFormPersistence } from '@/src/hooks';

export default function AddCustomerScreen() {
  const { addCustomer, customerExists } = useDebtContext();
  const styles = useThemedStyles(createStyles);

  const [customerName, setCustomerName] = useState('');
  
  // Form persistence for biometric lock scenarios
  const { restoreFormData, clearFormData } = useFormPersistence({
    formId: 'add-customer',
    formData: { customerName },
    enabled: true,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Dialog state
  const [alertDialog, setAlertDialog] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({ visible: false, title: '', message: '' });

  // Restore form data on component mount if available
  useEffect(() => {
    restoreFormData('add-customer').then((restoredData) => {
      if (restoredData && restoredData.customerName) {
        setCustomerName(restoredData.customerName);
      }
    });
  }, [restoreFormData]);

  // Helper function for showing alert dialogs
  const showAlert = (title: string, message: string) => {
    setAlertDialog({ visible: true, title, message });
  };

  const hideAlert = () => {
    setAlertDialog({ visible: false, title: '', message: '' });
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    // Check if name is provided
    if (!customerName.trim()) {
      newErrors.name = 'Customer name is required';
    }
    
    // Check for duplicate customer (case-insensitive)
    if (customerName.trim() && customerExists(customerName.trim())) {
      newErrors.name = 'A customer with this name already exists';
    }
    
    // Check minimum length
    if (customerName.trim().length < 2) {
      newErrors.name = 'Customer name must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCustomer = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Create the customer using the context method
      await addCustomer(customerName.trim());
      
      // Clear any persisted form data on successful submission
      clearFormData('add-customer');
      
      // Show success message and navigate back
      showAlert(
        'Customer Created',
        `Customer "${customerName.trim()}" has been created successfully. You can now add debt/credit entries for this customer.`
      );
      // Navigate back after showing success message
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      console.error('Error creating customer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create customer. Please try again.';
      showAlert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>
        <Card style={styles.formCard}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Add New Customer
            </Text>
            
            <Text variant="bodyMedium" style={styles.subtitle}>
              Create a new customer to track debts and credits. You&apos;ll be able to add debt/credit entries from the customer&apos;s detail page.
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                label="Customer Name"
                value={customerName}
                onChangeText={(text) => {
                  setCustomerName(text);
                  // Clear errors when user starts typing
                  if (errors.name) {
                    setErrors(prev => ({ ...prev, name: '' }));
                  }
                }}
                error={!!errors.name}
                mode="outlined"
                style={styles.input}
                placeholder="Enter customer's name"
                autoCapitalize="words"
                autoCorrect={false}
                disabled={isLoading}
                accessible={true}
                accessibilityLabel="Customer name input"
                accessibilityHint="Enter the name of the customer you want to add"
              />
              {errors.name ? (
                <Text variant="bodySmall" style={styles.errorText}>
                  {errors.name}
                </Text>
              ) : null}
            </View>

            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              <Button
                mode="contained"
                onPress={handleCreateCustomer}
                style={styles.createButton}
                loading={isLoading}
                disabled={isLoading || !customerName.trim()}
              >
                Create
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Help section */}
        <Card style={styles.helpCard}>
          <Card.Content>
            <Text variant="titleSmall" style={styles.helpTitle}>
              💡 How it works
            </Text>
            <Text variant="bodySmall" style={styles.helpText}>
              • Each customer represents a person you have financial transactions with{'\n'}
              • After creating a customer, you can add multiple debt/credit entries{'\n'}
              • Customer names must be unique (case-insensitive){'\n'}
              • Use the customer&apos;s detail page to manage all their transactions
            </Text>
          </Card.Content>
        </Card>
      </View>

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
    padding: 20,
    backgroundColor: colors.background,
  },
  formCard: {
    marginBottom: 20,
    backgroundColor: colors.surface,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
    color: colors.onSurface,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: 24,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.surface,
  },
  errorText: {
    color: colors.error,
    marginTop: 4,
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderColor: colors.outline,
  },
  createButton: {
    flex: 1,
  },
  helpCard: {
    backgroundColor: colors.surfaceContainer,
  },
  helpTitle: {
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  helpText: {
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
});
