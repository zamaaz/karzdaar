import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Button, Card, ActivityIndicator, Divider, Searchbar } from 'react-native-paper';
import { router } from 'expo-router';
import { ScreenLayout, ThemedIconButton, ThemedFAB } from '@/src/components/common';
import { useDebtContext } from '@/src/store';
import { formatCurrency, groupDebtsByCustomer } from '@/src/utils';
import { formatRelativeTime } from '@/src/utils/helpers';
import { Debt } from '@/src/types';
import { useThemedColors } from '@/src/hooks/useThemedColors';

export default function HomeScreen() {
  const { state, loadDebts } = useDebtContext();
  const { debts, loading, error } = state;

  // Theme-aware styles - memoized to prevent re-renders
  const colors = useThemedColors();
  const styles = useMemo(() => createStyles(colors, colors.isDark), [colors]);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized search handler to prevent re-renders
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Group debts by customer
  const customers = useMemo(() => {
    let filtered = debts;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(debt => 
        debt.name.toLowerCase().includes(query) ||
        debt.note.toLowerCase().includes(query)
      );
    }

    return groupDebtsByCustomer(filtered);
  }, [debts, searchQuery]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() !== '';

  // Calculate net balances correctly
  const { youWillGet, youOwe, activeDebtsCount, pendingCreditsCount } = useMemo(() => {
    const customers = groupDebtsByCustomer(debts);
    let totalYouWillGet = 0;
    let totalYouOwe = 0;
    let activeDebtsCount = 0;
    let pendingCreditsCount = 0;
    
    customers.forEach(customer => {
      if (customer.totalBalance > 0) {
        totalYouWillGet += customer.totalBalance; // They owe you
        pendingCreditsCount += 1; // This customer owes you money
      } else if (customer.totalBalance < 0) {
        totalYouOwe += Math.abs(customer.totalBalance); // You owe them
        activeDebtsCount += 1; // You owe this customer money
      }
    });
    
    return { 
      youWillGet: totalYouWillGet, 
      youOwe: totalYouOwe,
      activeDebtsCount,
      pendingCreditsCount
    };
  }, [debts]);

  // Render individual customer item
  const renderCustomerItem = ({ item }: { 
    item: { 
      name: string; 
      debts: Debt[]; 
      totalBalance: number; 
      latestTransaction: Debt; 
    }
  }) => {
    const { name, totalBalance, latestTransaction, debts } = item;
    const isPositive = totalBalance >= 0;
    const absoluteBalance = Math.abs(totalBalance);
    const hasRealTransactions = debts.length > 0; // Non-placeholder transactions
    
    // For display purposes
    const balanceText = hasRealTransactions 
      ? (isPositive ? 'They owe you' : 'You owe them')
      : 'No transactions yet';
    const activityText = hasRealTransactions 
      ? `Last activity: ${formatRelativeTime(latestTransaction.date)}`
      : `Customer added: ${formatRelativeTime(latestTransaction.date)}`;
    
    return (
      <View>
        <Card 
          style={styles.customerItem} 
          onPress={() => {
            // Navigate to customer details page
            router.push(`/customer/${encodeURIComponent(name)}` as any);
          }}
        >
        <Card.Content style={styles.customerContent}>
          <View style={styles.customerHeader}>
            <View style={styles.customerInfo}>
              <Text variant="titleMedium" style={styles.customerName}>
                {name}
              </Text>
              <Text variant="bodySmall" style={styles.lastActivity}>
                {activityText}
              </Text>
            </View>
            <View style={styles.customerBalanceContainer}>
              <Text variant="bodySmall" style={styles.balanceLabel}>
                {balanceText}
              </Text>
              {hasRealTransactions && (
                <View style={[
                  styles.balanceAmountContainer,
                  { backgroundColor: isPositive ? colors.creditContainer : colors.debtContainer }
                ]}>
                  <Text 
                    variant="titleSmall" 
                    style={[
                      styles.balanceAmount,
                      { color: isPositive ? colors.creditOnContainer : colors.debtOnContainer }
                    ]}
                  >
                    {formatCurrency(absoluteBalance)}
                  </Text>
                </View>
              )}
              {!hasRealTransactions && (
                <View style={[styles.balanceAmountContainer, styles.noTransactionsContainer]}>
                  <Text variant="bodySmall" style={styles.noTransactionsText}>
                    Add first transaction
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Card.Content>        </Card>
      </View>
    );
  };

  // Memoized header component for the FlatList
  const ListHeaderComponent = useCallback(() => (
    <View style={styles.headerContainer}>
      {/* Summary Cards - Moved to top */}
      <View style={styles.summaryContainer}>
        <Card style={[styles.summaryCard, styles.debtSummaryCard]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>You Owe</Text>
            <Text variant="headlineSmall" style={[styles.amount, styles.debtAmountText]}>
              {formatCurrency(youOwe || 0)}
            </Text>
            <Text variant="bodySmall">{activeDebtsCount} active debts</Text>
          </Card.Content>
        </Card>

        <Card style={[styles.summaryCard, styles.creditSummaryCard]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>You Will Get</Text>
            <Text variant="headlineSmall" style={[styles.amount, styles.creditAmount]}>
              {formatCurrency(youWillGet || 0)}
            </Text>
            <Text variant="bodySmall">{pendingCreditsCount} pending credits</Text>
          </Card.Content>
        </Card>
      </View>

      {/* Search Bar - Moved below summary */}
      <Searchbar
        placeholder="Search by contact name or note..."
        onChangeText={handleSearchChange}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        elevation={2}
        clearIcon="close"
        accessible={true}
        accessibilityLabel="Search debts and credits"
        accessibilityHint="Enter contact name or note to filter results"
        blurOnSubmit={false}
        autoCorrect={false}
        autoCapitalize="none"
      />

      {/* Results Count */}
      {hasActiveFilters && (
        <View style={styles.resultsContainer}>
          <Text variant="bodyMedium" style={styles.resultsText}>
            {customers.length} result{customers.length !== 1 ? 's' : ''} found
          </Text>
          <Button
            mode="text"
            compact
            onPress={() => {
              setSearchQuery('');
            }}
            textColor="#666"
          >
            Clear
          </Button>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Customers
        </Text>
        {customers.length > 0 && (
          <Text variant="bodySmall" style={styles.debtCount}>
            {customers.length} customers
          </Text>
        )}
      </View>
    </View>
  ), [styles, youOwe, activeDebtsCount, youWillGet, pendingCreditsCount, searchQuery, handleSearchChange, hasActiveFilters, customers.length]); // Dependencies for useCallback

  if (loading) {
    return (
      <ScreenLayout>
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" />
          <Text variant="bodyLarge" style={styles.loadingText}>
            Loading your debts...
          </Text>
        </View>
      </ScreenLayout>
    );
  }

  if (error) {
    return (
      <ScreenLayout>
        <View style={[styles.container, styles.centered]}>
          <Text variant="bodyLarge" style={styles.errorText}>
            {error}
          </Text>
          <Button mode="contained" onPress={loadDebts}>
            Retry
          </Button>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout scrollable={false}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text variant="headlineLarge" style={styles.appTitle}>
              Karzdaar
            </Text>
          </View>
          <View style={styles.headerRight}>
            <ThemedIconButton
              icon="settings"
              size="large"
              onPress={() => router.push('/settings')}
              style={styles.settingsButton}
              colorContext="navigation"
            />
          </View>
        </View>
        {customers.length === 0 && debts.length > 0 ? (
          // No results state (when there are debts but filter/search returns empty)
          <FlatList
            data={[]}
            renderItem={() => null}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  No results found
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtitle}>
                  Try adjusting your search or filters
                </Text>
                <Button 
                  mode="outlined" 
                  style={styles.emptyButton}
                  onPress={() => {
                    setSearchQuery('');
                  }}
                >
                  Clear Filters
                </Button>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : debts.length === 0 ? (
          // Empty state with header
          <FlatList
            data={[]}
            renderItem={() => null}
            ListHeaderComponent={ListHeaderComponent}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text variant="titleMedium" style={styles.emptyTitle}>
                  No customers yet
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtitle}>
                  Add your first customer to get started
                </Text>
                <Button 
                  mode="contained" 
                  style={styles.emptyButton}
                  onPress={() => router.push('/add-customer' as any)}
                >
                  Add Your First Customer
                </Button>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          // FlatList with customers
          <FlatList
            data={customers}
            renderItem={renderCustomerItem}
            keyExtractor={(item) => item.name}
            ListHeaderComponent={ListHeaderComponent}
            ItemSeparatorComponent={() => <Divider style={styles.separator} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        )}
      </View>

      <View>
        <ThemedFAB
          icon="personAdd"
          label="Add Customer"
          style={styles.fab}
          onPress={() => router.push('/add-customer' as any)}
          variant="primary"
        />
      </View>
    </ScreenLayout>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  appTitle: {
    fontWeight: '900',
    color: colors.onBackground,
    fontSize: 30,
  },
  settingsButton: {
    margin: 0,
  },
  headerContainer: {
    padding: 20,
  },
  footerContainer: {
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    color: colors.onBackground,
  },
  errorText: {
    marginBottom: 16,
    textAlign: 'center',
    color: colors.error,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '900', // Extra bold for Material 3 expressive typography
    color: colors.onBackground,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: colors.onSurfaceVariant,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  summaryTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: colors.onSurface,
  },
  debtSummaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.getDebtColor('got'),
  },
  creditSummaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.getDebtColor('gave'),
  },
  amount: {
    fontWeight: 'bold',
    marginTop: 4,
    color: colors.onSurface,
  },
  creditAmount: {
    color: colors.credit,
    fontWeight: 'bold',
  },
  debtAmountText: {
    color: colors.debt,
    fontWeight: 'bold',
  },
  card: {
    marginBottom: 24,
    backgroundColor: colors.surface,
  },
  cardText: {
    marginTop: 8,
    lineHeight: 20,
    color: colors.onSurface,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  // New FlatList styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontWeight: '700', // Bold for Material 3 expressive typography
    color: colors.onBackground,
  },
  debtCount: {
    opacity: 0.7,
    color: colors.onSurfaceVariant,
  },
  flatListContent: {
    paddingBottom: 100, // Space for FAB
  },
  // Customer item styles
  customerItem: {
    marginHorizontal: 20,
    marginVertical: 6,
    backgroundColor: colors.surface,
  },
  customerContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  customerInfo: {
    flex: 1,
    marginRight: 16,
  },
  customerName: {
    fontWeight: '600',
    marginBottom: 4,
    color: colors.onSurface,
  },
  lastActivity: {
    opacity: 0.7,
    color: colors.onSurfaceVariant,
  },
  customerBalanceContainer: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    opacity: 0.7,
    color: colors.onSurfaceVariant,
    marginBottom: 4,
  },
  balanceAmountContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    minWidth: 90,
    alignItems: 'center',
  },
  balanceAmount: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  noTransactionsContainer: {
    backgroundColor: colors.surfaceContainer,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.outline,
  },
  noTransactionsText: {
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    fontSize: 12,
  },
  separator: {
    marginVertical: 4,
    backgroundColor: colors.divider,
  },
  // Empty state styles
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
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
  emptyButton: {
    paddingHorizontal: 24,
  },
  // Search and filter styles
  searchBar: {
    marginBottom: 16,
    backgroundColor: colors.surface,
  },
  searchInput: {
    fontSize: 16,
    color: colors.onSurface,
  },
  filterContainer: {
    marginBottom: 16,
  },
  segmentedButtons: {
    backgroundColor: 'transparent',
  },
  filterButton: {
    backgroundColor: 'transparent',
  },
  activeFilterButton: {
    backgroundColor: colors.primaryContainer,
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  resultsText: {
    opacity: 0.7,
    color: colors.onSurfaceVariant,
  },
});
