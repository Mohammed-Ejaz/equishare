import React from 'react';
import { AnalyticsCharts } from '../components/AnalyticsCharts';

export function AnalyticsPage({
  group,
  balances,
  currency = '₹'
}) {
  return (
    <div className="space-y-6">
      <AnalyticsCharts
        expenses={group.expenses || []}
        supplies={group.supplies || []}
        members={group.members || []}
        balances={balances}
        currency={currency}
      />
    </div>
  );
}
