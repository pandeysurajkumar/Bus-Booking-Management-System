const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  CUSTOMER: 'customer'
};

const SEAT_STATUS = {
  AVAILABLE: 'available',
  LOCKED: 'locked',
  BOOKED: 'booked',
  BLOCKED: 'blocked'
};

const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

const PAYMENT_METHODS = {
  UPI: 'upi',
  CARD: 'card',
  NET_BANKING: 'net_banking',
  WALLET: 'wallet'
};

const BUS_TYPES = {
  AC_SLEEPER: 'AC Sleeper (2+1)',
  NON_AC_SLEEPER: 'Non-AC Sleeper (2+1)',
  VOLVO_MULTI_AXLE: 'Volvo Multi-Axle AC (2+2)',
  SCANIA_AC_SEATER: 'Scania AC Seater (2+2)',
  BHARAT_BENZ_AC: 'BharatBenz AC Seater/Sleeper',
  DELUXE_EXPRESS: 'Deluxe Non-AC (2+2)'
};

const REFUND_POLICY_DEFAULT = [
  { minHoursBeforeDeparture: 24, refundPercentage: 90, cancellationFeePercentage: 10, description: 'More than 24 hours before journey: 90% refund' },
  { minHoursBeforeDeparture: 12, refundPercentage: 75, cancellationFeePercentage: 25, description: 'Between 12 and 24 hours: 75% refund' },
  { minHoursBeforeDeparture: 4,  refundPercentage: 50, cancellationFeePercentage: 50, description: 'Between 4 and 12 hours: 50% refund' },
  { minHoursBeforeDeparture: 0,  refundPercentage: 0,  cancellationFeePercentage: 100, description: 'Less than 4 hours: No refund' }
];

module.exports = {
  ROLES,
  SEAT_STATUS,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  BUS_TYPES,
  REFUND_POLICY_DEFAULT
};
