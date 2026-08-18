import { Order, OrderPriority } from '../types/order';

export interface PriorityScoreBreakdown {
  slaWeightScore: number; // 0-40 based on minutes remaining to SLA cutoff
  customerTierScore: number; // 0-30 based on VIP, Strategic, Standard tier
  orderValueScore: number; // 0-15 based on order dollar magnitude
  shippingSpeedScore: number; // 0-15 based on Same-Day / Overnight vs Ground
  totalScore: number; // 0-100
  assignedPriority: OrderPriority;
  rationale: string;
}

/**
 * Calculates a deterministic priority score (0-100) and priority bucket for an incoming or updated order.
 *
 * @param order - The order to evaluate
 * @returns PriorityScoreBreakdown with calculated score, assigned priority, and human-readable explanation
 *
 * TODO (Future Module):
 * 1. Implement dynamic SLA countdown decay curve
 * 2. Incorporate customer contract penalty clauses for late delivery
 * 3. Integrate real-time carrier flight and truck dispatch cutoff times
 */
export function calculateOrderPriority(order: Order): PriorityScoreBreakdown {
  let customerTierScore = 10;
  if (order.customer.tier === 'ENTERPRISE_VIP') customerTierScore = 30;
  else if (order.customer.tier === 'STRATEGIC') customerTierScore = 20;

  let shippingSpeedScore = 5;
  if (order.shippingMethod === 'SAME_DAY') shippingSpeedScore = 15;
  else if (order.shippingMethod === 'OVERNIGHT_EXPRESS') shippingSpeedScore = 12;
  else if (order.shippingMethod === 'EXPEDITED') shippingSpeedScore = 8;

  const orderValueScore = Math.min(15, Math.round((order.totalValue / 2000) * 15));
  const slaWeightScore = order.slaRisk ? 35 : 20;

  const totalScore = Math.min(100, slaWeightScore + customerTierScore + orderValueScore + shippingSpeedScore);

  let assignedPriority: OrderPriority = 'LOW';
  if (totalScore >= 85) assignedPriority = 'CRITICAL';
  else if (totalScore >= 65) assignedPriority = 'HIGH';
  else if (totalScore >= 45) assignedPriority = 'MEDIUM';

  const rationale = `Calculated priority score ${totalScore}/100 based on ${order.customer.tier} tier (+${customerTierScore}), ${order.shippingMethod} delivery (+${shippingSpeedScore}), and SLA urgency (+${slaWeightScore}).`;

  return {
    slaWeightScore,
    customerTierScore,
    orderValueScore,
    shippingSpeedScore,
    totalScore,
    assignedPriority,
    rationale,
  };
}
