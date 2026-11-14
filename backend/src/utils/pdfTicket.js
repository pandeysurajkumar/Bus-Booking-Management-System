const { jsPDF } = require('jspdf');

/**
 * Generates a clean, professional PDF ticket buffer for a confirmed booking.
 * @param {Object} booking - Fully populated booking document
 * @returns {Buffer}
 */
const generateTicketPDF = (booking) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Primary brand colors
  const primaryColor = [220, 38, 38]; // Red (RedBus vibe)
  const darkColor = [31, 41, 55]; // Gray-800
  const lightGray = [243, 244, 246];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('ALGIONS BUS EXPRESS', 15, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Official E-Ticket & Boarding Pass', 15, 26);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`PNR: ${booking.pnr}`, 155, 20);

  // Status Badge
  doc.setFillColor(16, 185, 129); // Green
  doc.roundedRect(155, 23, 40, 6, 1, 1, 'F');
  doc.setFontSize(8);
  doc.text(`STATUS: ${booking.status.toUpperCase()}`, 159, 27.5);

  let y = 44;

  // Journey Summary Box
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, y, 180, 42, 3, 3, 'F');

  doc.setTextColor(...darkColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('JOURNEY DETAILS', 20, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const routeTitle = booking.routeId?.title || `${booking.boardingPoint?.name} to ${booking.dropPoint?.name}`;
  const operatorName = booking.operatorId?.companyName || 'Express Travels';
  const busType = booking.busId?.busType || 'Luxury AC Sleeper';
  const journeyDate = booking.journeyDate ? new Date(booking.journeyDate).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  }) : 'N/A';

  doc.text(`Route: ${routeTitle}`, 20, y + 16);
  doc.text(`Operator: ${operatorName}`, 20, y + 23);
  doc.text(`Bus Type: ${busType}`, 20, y + 30);
  doc.text(`Journey Date: ${journeyDate}`, 20, y + 37);

  const depTime = booking.boardingPoint?.time ? new Date(booking.boardingPoint.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  const arrTime = booking.dropPoint?.time ? new Date(booking.dropPoint.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  doc.text(`Boarding: ${booking.boardingPoint?.name || 'N/A'} (${depTime})`, 110, y + 16);
  doc.text(`Drop: ${booking.dropPoint?.name || 'N/A'} (${arrTime})`, 110, y + 23);
  doc.text(`Bus Number: ${booking.busId?.busNumber || 'N/A'}`, 110, y + 30);
  doc.text(`Seats: ${booking.seats.join(', ')}`, 110, y + 37);

  y += 50;

  // Passenger Manifest Section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkColor);
  doc.text('PASSENGER DETAILS', 15, y);

  y += 6;
  // Table Header
  doc.setFillColor(229, 231, 235);
  doc.rect(15, y, 180, 8, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('#', 18, y + 5.5);
  doc.text('Passenger Name', 30, y + 5.5);
  doc.text('Age', 100, y + 5.5);
  doc.text('Gender', 125, y + 5.5);
  doc.text('Seat Number', 155, y + 5.5);

  y += 8;
  doc.setFont('helvetica', 'normal');

  const passengers = booking.passengers || [];
  passengers.forEach((p, idx) => {
    const isEven = idx % 2 === 0;
    if (isEven) {
      doc.setFillColor(249, 250, 251);
      doc.rect(15, y, 180, 7, 'F');
    }
    doc.text(String(idx + 1), 18, y + 5);
    doc.text(p.fullName || 'Passenger', 30, y + 5);
    doc.text(String(p.age || '-'), 100, y + 5);
    doc.text((p.gender || '-').toUpperCase(), 125, y + 5);
    doc.text(p.seatNumber || booking.seats[idx] || '-', 155, y + 5);
    y += 7;
  });

  y += 10;

  // Fare & Payment Breakdown Box
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, y, 180, 36, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('FARE & PAYMENT SUMMARY', 20, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Base Fare: Rs. ${booking.baseAmount?.toFixed(2) || '0.00'}`, 20, y + 16);
  doc.text(`GST / Taxes: Rs. ${booking.taxAmount?.toFixed(2) || '0.00'}`, 20, y + 23);
  doc.text(`Discount: Rs. ${booking.discountAmount?.toFixed(2) || '0.00'}`, 20, y + 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text(`Total Paid: Rs. ${booking.totalAmount?.toFixed(2) || '0.00'}`, 110, y + 16);

  doc.setTextColor(...darkColor);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Payment ID: ${booking.paymentId?.transactionId || 'SIMULATED-PAID'}`, 110, y + 23);
  doc.text(`Booked On: ${new Date(booking.createdAt).toLocaleString('en-IN')}`, 110, y + 30);

  y += 45;

  // Important Terms & Instructions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('IMPORTANT INSTRUCTIONS:', 15, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(107, 114, 128);
  doc.text('1. Please carry a valid government-issued photo ID (Aadhaar / Voter ID / Driving License) during boarding.', 15, y + 6);
  doc.text('2. Please arrive at the boarding point at least 15 minutes before the scheduled departure time.', 15, y + 11);
  doc.text('3. Cancellations are subject to the standard operator cancellation policy (e.g. 90% refund > 24 hrs).', 15, y + 16);
  doc.text('4. For 24x7 customer support, reach out to support@algionsbus.com or helpline 1800-123-4567.', 15, y + 21);

  // Footer bar
  doc.setFillColor(...darkColor);
  doc.rect(0, 285, 210, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('ALGIONS AI LABS - Bus Booking Management System Assessment', 15, 292);
  doc.text('Powered by Node.js, Express & MongoDB', 135, 292);

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
};

module.exports = {
  generateTicketPDF
};
