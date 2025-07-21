import React from 'react';
import { StyleSheet } from 'react-native';
import { Dialog, Portal, Text, Button, ActivityIndicator } from 'react-native-paper';

interface DialogAction {
  text: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'text' | 'outlined' | 'contained';
}

interface MaterialDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message?: string;
  actions?: DialogAction[];
  dismissable?: boolean;
}

export const MaterialDialog: React.FC<MaterialDialogProps> = ({
  visible,
  onDismiss,
  title,
  message,
  actions = [],
  dismissable = true,
}) => {
  const handleDismiss = () => {
    if (dismissable) {
      onDismiss();
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss} dismissable={dismissable}>
        <Dialog.Title>{title}</Dialog.Title>
        {message && (
          <Dialog.Content>
            <Text variant="bodyMedium" style={styles.messageText}>
              {message}
            </Text>
          </Dialog.Content>
        )}
        {actions.length > 0 && (
          <Dialog.Actions>
            {actions.map((action, index) => (
              <Button
                key={index}
                onPress={action.onPress}
                disabled={action.disabled || action.loading}
                mode={action.mode || 'text'}
                style={styles.actionButton}
              >
                {action.loading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  action.text
                )}
              </Button>
            ))}
          </Dialog.Actions>
        )}
      </Dialog>
    </Portal>
  );
};

// Convenience components for common dialog types
interface ConfirmDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  onDismiss,
  title,
  message,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
}) => {
  const actions: DialogAction[] = [
    {
      text: cancelText,
      onPress: onDismiss,
      disabled: loading,
    },
    {
      text: confirmText,
      onPress: onConfirm,
      loading,
      mode: 'contained',
    },
  ];

  return (
    <MaterialDialog
      visible={visible}
      onDismiss={onDismiss}
      title={title}
      message={message}
      actions={actions}
      dismissable={!loading}
    />
  );
};

interface AlertDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  buttonText?: string;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  visible,
  onDismiss,
  title,
  message,
  buttonText = 'OK',
}) => {
  const actions: DialogAction[] = [
    {
      text: buttonText,
      onPress: onDismiss,
      mode: 'contained',
    },
  ];

  return (
    <MaterialDialog
      visible={visible}
      onDismiss={onDismiss}
      title={title}
      message={message}
      actions={actions}
    />
  );
};

const styles = StyleSheet.create({
  messageText: {
    lineHeight: 20,
  },
  actionButton: {
    marginLeft: 8,
  },
});
