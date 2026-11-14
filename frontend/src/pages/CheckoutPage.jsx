import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, QrCode, Building, Wallet, CheckCircle2, XCircle, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import api from '../api/axios';

export const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    trip,
    seats = [],
    passengers = [],
    boardingPoint,
    dropPoint,
    contactInfo,
    fareDetails
  } = location.state || {};

  const totalPayable = fareDetails?.totalAmount || 0;

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [selectedWallet, setSelectedWallet] = useState('Paytm');

  // Dummy Card Info (never real credentials)
  const [cardLast4, setCardLast4] = useState('4242');

  // Simulation outcome toggle
  const [simulatedSuccess, setSimulatedSuccess] = useState(true);

  // Payment states: 'idle' | 'processing' | 'failed'
  const [paymentState, setPaymentState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePayNow = async () => {
    setPaymentState('processing');
    setErrorMessage('');

    // Emulate realistic payment processing latency
    setTimeout(async () => {
      try {
        const idempotencyKey = `PAY_${Date.now()}_${Math.random().toString(36).substring(7)}`;

        const res = await api.post('/bookings', {
          tripId: trip._id,
          seats,
          passengers,
          boardingPoint,
          dropPoint,
          contactInfo,
          paymentMethod,
          simulatedSuccess,
          idempotencyKey
        });

        const confirmedBooking = res.data.data;
        // Navigate to confirmation page
        navigate(`/ticket/${confirmedBooking.pnr}`, {
          state: { booking: confirmedBooking, isNewlyConfirmed: true }
        });
      } catch (err) {
        setPaymentState('failed');
        setErrorMessage(
          err.response?.data?.message ||
          'Simulated payment failed or was declined. You can switch to Success mode to proceed.'
        );
      }
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="text-center space-y-2 border-b border-gray-200 pb-6">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Simulated 256-Bit SSL Sandbox Gateway</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
          Complete Your Simulated Payment
        </h1>
        <p className="text-xs text-gray-500">
          Total Amount to Pay: <strong className="text-lg font-black text-gray-900">₹{totalPayable}</strong>
        </p>
      </div>

      {paymentState === 'processing' ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-lg space-y-4">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-xl font-black text-gray-900">Processing Simulated Transaction...</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Contacting issuing mock PSP & securing your atomic seat allocation. Please do not refresh.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          {errorMessage && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SIMULATION CONTROLS BOX */}
          <div className="bg-amber-50/70 p-4 border-b border-amber-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-extrabold text-amber-900 block">Assessment Simulator Mode</span>
              <span className="text-amber-700">Choose simulated payment outcome for grading:</span>
            </div>
            <div className="inline-flex rounded-xl bg-white p-1 border border-amber-300 font-bold text-xs">
              <button
                type="button"
                onClick={() => setSimulatedSuccess(true)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  simulatedSuccess ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600'
                }`}
              >
                Simulate Success
              </button>
              <button
                type="button"
                onClick={() => setSimulatedSuccess(false)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  !simulatedSuccess ? 'bg-rose-600 text-white shadow-xs' : 'text-gray-600'
                }`}
              >
                Simulate Failure
              </button>
            </div>
          </div>

          {/* PAYMENT METHOD TABS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-gray-200 text-xs font-bold text-center">
            {[
              { id: 'upi', label: 'UPI / QR', icon: QrCode },
              { id: 'card', label: 'Debit / Card', icon: CreditCard },
              { id: 'net_banking', label: 'Net Banking', icon: Building },
              { id: 'wallet', label: 'Wallets', icon: Wallet }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = paymentMethod === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setPaymentMethod(tab.id)}
                  className={`py-3.5 px-2 flex flex-col items-center justify-center space-y-1 transition ${
                    isActive
                      ? 'border-b-2 border-brand-600 text-brand-600 bg-brand-50/40'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB CONTENTS */}
          <div className="p-6 space-y-5">
            {paymentMethod === 'upi' && (
              <div className="space-y-4 max-w-md mx-auto text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Enter Dummy UPI VPA / ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="user@okaxis"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium"
                  />
                  <span className="text-[11px] text-gray-400">Supported: GPay, PhonePe, Paytm, BHIM</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Auto-approved sandbox test VPA</span>
                  <span className="text-emerald-600 font-bold">VERIFIED</span>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-3 max-w-md mx-auto text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Dummy Test Card</label>
                  <input
                    type="text"
                    disabled
                    value="4242 •••• •••• 4242"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 font-mono font-bold text-gray-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    disabled
                    value="12/28"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 font-mono text-center"
                  />
                  <input
                    type="password"
                    disabled
                    value="•••"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 font-mono text-center"
                  />
                </div>
                <span className="text-[11px] text-gray-400 block text-center">
                  Pre-filled safe sandbox token. No real card credentials required.
                </span>
              </div>
            )}

            {paymentMethod === 'net_banking' && (
              <div className="space-y-3 max-w-md mx-auto text-xs">
                <label className="font-bold text-gray-700 block">Select Bank</label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium bg-white"
                >
                  <option>State Bank of India</option>
                  <option>HDFC Bank</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                  <option>Punjab National Bank</option>
                </select>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="space-y-3 max-w-md mx-auto text-xs">
                <label className="font-bold text-gray-700 block">Select Digital Wallet</label>
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium bg-white"
                >
                  <option>Paytm Wallet</option>
                  <option>PhonePe Wallet</option>
                  <option>Amazon Pay Balance</option>
                  <option>Mobikwik</option>
                </select>
              </div>
            )}

            {/* ACTION BUTTON */}
            <div className="pt-4 border-t border-gray-100 flex flex-col items-center space-y-2">
              <button
                type="button"
                onClick={handlePayNow}
                className="w-full max-w-md py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>Simulate Pay ₹{totalPayable}</span>
              </button>
              <span className="text-[11px] text-gray-400">
                Instantly confirms booking & generates valid PNR & PDF boarding pass
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
