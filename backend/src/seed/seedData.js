// 20 Indian States
const statesData = [
  { name: 'Maharashtra', code: 'MH' },
  { name: 'Karnataka', code: 'KA' },
  { name: 'Delhi', code: 'DL' },
  { name: 'Tamil Nadu', code: 'TN' },
  { name: 'Telangana', code: 'TG' },
  { name: 'Gujarat', code: 'GJ' },
  { name: 'Rajasthan', code: 'RJ' },
  { name: 'Punjab', code: 'PB' },
  { name: 'Haryana', code: 'HR' },
  { name: 'Uttar Pradesh', code: 'UP' },
  { name: 'West Bengal', code: 'WB' },
  { name: 'Kerala', code: 'KL' },
  { name: 'Madhya Pradesh', code: 'MP' },
  { name: 'Goa', code: 'GA' },
  { name: 'Himachal Pradesh', code: 'HP' },
  { name: 'Uttarakhand', code: 'UK' },
  { name: 'Bihar', code: 'BR' },
  { name: 'Odisha', code: 'OD' },
  { name: 'Andhra Pradesh', code: 'AP' },
  { name: 'Chandigarh', code: 'CH' }
];

// 50 Cities mapped to states
const citiesData = [
  // Maharashtra (MH)
  { name: 'Mumbai', stateCode: 'MH', code: 'BOM', isPopular: true },
  { name: 'Pune', stateCode: 'MH', code: 'PNQ', isPopular: true },
  { name: 'Nagpur', stateCode: 'MH', code: 'NAG', isPopular: false },
  { name: 'Nashik', stateCode: 'MH', code: 'ISK', isPopular: false },
  { name: 'Aurangabad', stateCode: 'MH', code: 'IXU', isPopular: false },

  // Karnataka (KA)
  { name: 'Bengaluru', stateCode: 'KA', code: 'BLR', isPopular: true },
  { name: 'Mysuru', stateCode: 'KA', code: 'MYQ', isPopular: true },
  { name: 'Mangaluru', stateCode: 'KA', code: 'IXE', isPopular: false },
  { name: 'Hubballi', stateCode: 'KA', code: 'HBX', isPopular: false },
  { name: 'Belagavi', stateCode: 'KA', code: 'IXG', isPopular: false },

  // Delhi (DL)
  { name: 'New Delhi', stateCode: 'DL', code: 'DEL', isPopular: true },

  // Tamil Nadu (TN)
  { name: 'Chennai', stateCode: 'TN', code: 'MAA', isPopular: true },
  { name: 'Coimbatore', stateCode: 'TN', code: 'CJB', isPopular: true },
  { name: 'Madurai', stateCode: 'TN', code: 'IXM', isPopular: false },
  { name: 'Salem', stateCode: 'TN', code: 'SXV', isPopular: false },

  // Telangana (TG)
  { name: 'Hyderabad', stateCode: 'TG', code: 'HYD', isPopular: true },
  { name: 'Warangal', stateCode: 'TG', code: 'WGC', isPopular: false },
  { name: 'Nizamabad', stateCode: 'TG', code: 'NZB', isPopular: false },

  // Gujarat (GJ)
  { name: 'Ahmedabad', stateCode: 'GJ', code: 'AMD', isPopular: true },
  { name: 'Surat', stateCode: 'GJ', code: 'STV', isPopular: true },
  { name: 'Vadodara', stateCode: 'GJ', code: 'BDQ', isPopular: false },
  { name: 'Rajkot', stateCode: 'GJ', code: 'RAJ', isPopular: false },

  // Rajasthan (RJ)
  { name: 'Jaipur', stateCode: 'RJ', code: 'JAI', isPopular: true },
  { name: 'Udaipur', stateCode: 'RJ', code: 'UDR', isPopular: true },
  { name: 'Jodhpur', stateCode: 'RJ', code: 'JDH', isPopular: false },
  { name: 'Kota', stateCode: 'RJ', code: 'KTU', isPopular: false },

  // Punjab (PB)
  { name: 'Amritsar', stateCode: 'PB', code: 'ATQ', isPopular: true },
  { name: 'Ludhiana', stateCode: 'PB', code: 'LUH', isPopular: true },
  { name: 'Jalandhar', stateCode: 'PB', code: 'JAL', isPopular: false },

  // Haryana (HR)
  { name: 'Gurugram', stateCode: 'HR', code: 'GGN', isPopular: true },
  { name: 'Faridabad', stateCode: 'HR', code: 'FBD', isPopular: false },
  { name: 'Panipat', stateCode: 'HR', code: 'PNP', isPopular: false },

  // Uttar Pradesh (UP)
  { name: 'Lucknow', stateCode: 'UP', code: 'LKO', isPopular: true },
  { name: 'Agra', stateCode: 'UP', code: 'AGR', isPopular: true },
  { name: 'Varanasi', stateCode: 'UP', code: 'VNS', isPopular: true },
  { name: 'Noida', stateCode: 'UP', code: 'NDA', isPopular: false },
  { name: 'Kanpur', stateCode: 'UP', code: 'KNP', isPopular: false },

  // West Bengal (WB)
  { name: 'Kolkata', stateCode: 'WB', code: 'CCU', isPopular: true },
  { name: 'Siliguri', stateCode: 'WB', code: 'IXB', isPopular: false },

  // Kerala (KL)
  { name: 'Kochi', stateCode: 'KL', code: 'COK', isPopular: true },
  { name: 'Thiruvananthapuram', stateCode: 'KL', code: 'TRV', isPopular: false },
  { name: 'Kozhikode', stateCode: 'KL', code: 'CCJ', isPopular: false },

  // Madhya Pradesh (MP)
  { name: 'Indore', stateCode: 'MP', code: 'IDR', isPopular: true },
  { name: 'Bhopal', stateCode: 'MP', code: 'BHO', isPopular: false },

  // Goa (GA)
  { name: 'Panaji', stateCode: 'GA', code: 'GOI', isPopular: true },
  { name: 'Madgaon', stateCode: 'GA', code: 'MAO', isPopular: false },

  // Himachal Pradesh (HP)
  { name: 'Shimla', stateCode: 'HP', code: 'SLV', isPopular: true },
  { name: 'Manali', stateCode: 'HP', code: 'KUU', isPopular: true },

  // Uttarakhand (UK)
  { name: 'Dehradun', stateCode: 'UK', code: 'DED', isPopular: true },
  { name: 'Haridwar', stateCode: 'UK', code: 'HW', isPopular: false },

  // Bihar (BR)
  { name: 'Patna', stateCode: 'BR', code: 'PAT', isPopular: false },

  // Odisha (OD)
  { name: 'Bhubaneswar', stateCode: 'OD', code: 'BBI', isPopular: false },

  // Andhra Pradesh (AP)
  { name: 'Visakhapatnam', stateCode: 'AP', code: 'VTZ', isPopular: false },
  { name: 'Vijayawada', stateCode: 'AP', code: 'VGA', isPopular: false },

  // Chandigarh (CH)
  { name: 'Chandigarh', stateCode: 'CH', code: 'IXC', isPopular: true }
];

// 30 Operators
const operatorsData = [
  { name: 'Zingbus Mobility', companyName: 'Zingbus Electric & Smart Travels', registrationNumber: 'ZING-IND-001', contactEmail: 'support@zingbus.com', contactPhone: '+91 88888 11001', rating: 4.8 },
  { name: 'IntrCity SmartBus', companyName: 'IntrCity Mobility Tech Pvt Ltd', registrationNumber: 'INTR-IND-002', contactEmail: 'ops@intrcity.com', contactPhone: '+91 88888 11002', rating: 4.7 },
  { name: 'VRL Travels', companyName: 'Vijayanand Roadlines Ltd', registrationNumber: 'VRL-IND-003', contactEmail: 'care@vrltravels.com', contactPhone: '+91 88888 11003', rating: 4.6 },
  { name: 'SRS Travels', companyName: 'SRS Tours and Travels', registrationNumber: 'SRS-IND-004', contactEmail: 'help@srstravels.com', contactPhone: '+91 88888 11004', rating: 4.5 },
  { name: 'Orange Tours & Travels', companyName: 'Orange Travels India', registrationNumber: 'ORG-IND-005', contactEmail: 'info@orangetravels.com', contactPhone: '+91 88888 11005', rating: 4.7 },
  { name: 'Hans Travels', companyName: 'Hans Travel Services Ltd', registrationNumber: 'HNS-IND-006', contactEmail: 'support@hanstravels.com', contactPhone: '+91 88888 11006', rating: 4.4 },
  { name: 'NueGo GreenBus', companyName: 'GreenCell Mobility NueGo', registrationNumber: 'NUE-IND-007', contactEmail: 'support@nuego.com', contactPhone: '+91 88888 11007', rating: 4.9 },
  { name: 'Chartered Bus', companyName: 'Chartered Speed Pvt Ltd', registrationNumber: 'CHR-IND-008', contactEmail: 'help@charteredbus.com', contactPhone: '+91 88888 11008', rating: 4.6 },
  { name: 'Kallada Travels', companyName: 'Suresh Kallada Travels', registrationNumber: 'KLL-IND-009', contactEmail: 'info@kalladatravels.com', contactPhone: '+91 88888 11009', rating: 4.3 },
  { name: 'Jabbar Travels', companyName: 'Jabbar Express & Cargo', registrationNumber: 'JAB-IND-010', contactEmail: 'ops@jabbartravels.com', contactPhone: '+91 88888 11010', rating: 4.4 },
  { name: 'Rajdhani Express Bus', companyName: 'Rajdhani Roadways Corp', registrationNumber: 'RJD-IND-011', contactEmail: 'support@rajdhanibus.com', contactPhone: '+91 88888 11011', rating: 4.5 },
  { name: 'Neeta Tours & Travels', companyName: 'Neeta Luxury Transport', registrationNumber: 'NTA-IND-012', contactEmail: 'care@neetatours.com', contactPhone: '+91 88888 11012', rating: 4.5 },
  { name: 'Prasanna Purple', companyName: 'Prasanna Mobility Solutions', registrationNumber: 'PRP-IND-013', contactEmail: 'support@prasannapurple.com', contactPhone: '+91 88888 11013', rating: 4.6 },
  { name: 'Gujarat Travels', companyName: 'Gujarat Travels Agency', registrationNumber: 'GJT-IND-014', contactEmail: 'help@gujarattravels.com', contactPhone: '+91 88888 11014', rating: 4.4 },
  { name: 'Mahasagar Travels', companyName: 'Mahasagar Transport Ltd', registrationNumber: 'MSG-IND-015', contactEmail: 'contact@mahasagartravels.com', contactPhone: '+91 88888 11015', rating: 4.3 },
  { name: 'Shrinath Travels', companyName: 'Shrinath Travel Agency', registrationNumber: 'SHR-IND-016', contactEmail: 'care@shrinathtravels.com', contactPhone: '+91 88888 11016', rating: 4.5 },
  { name: 'Ashok Travels', companyName: 'Ashok Bus Lines', registrationNumber: 'ASH-IND-017', contactEmail: 'info@ashokbus.com', contactPhone: '+91 88888 11017', rating: 4.2 },
  { name: 'Morning Star Travels', companyName: 'Morning Star Express India', registrationNumber: 'MST-IND-018', contactEmail: 'support@morningstar.com', contactPhone: '+91 88888 11018', rating: 4.6 },
  { name: 'Kaveri Travels', companyName: 'Kaveri Bus Logistics', registrationNumber: 'KAV-IND-019', contactEmail: 'contact@kaveritravels.com', contactPhone: '+91 88888 11019', rating: 4.5 },
  { name: 'Diwakar Travels', companyName: 'Diwakar Roadlines', registrationNumber: 'DIW-IND-020', contactEmail: 'help@diwakartravels.com', contactPhone: '+91 88888 11020', rating: 4.4 },
  { name: 'Sharma Transports', companyName: 'Sharma Transports Bangalore', registrationNumber: 'SHM-IND-021', contactEmail: 'support@sharmatrans.com', contactPhone: '+91 88888 11021', rating: 4.3 },
  { name: 'Universal Travels', companyName: 'Universal Highway Liners', registrationNumber: 'UNI-IND-022', contactEmail: 'care@universaltravels.com', contactPhone: '+91 88888 11022', rating: 4.4 },
  { name: 'SVKDT Travels', companyName: 'Sri Venkata Krishna Das Travels', registrationNumber: 'SVK-IND-023', contactEmail: 'info@svkdt.com', contactPhone: '+91 88888 11023', rating: 4.5 },
  { name: 'Navodaya Travels', companyName: 'Navodaya Road Express', registrationNumber: 'NAV-IND-024', contactEmail: 'ops@navodayabus.com', contactPhone: '+91 88888 11024', rating: 4.2 },
  { name: 'Royal Travels', companyName: 'Royal Executive Coach', registrationNumber: 'RYL-IND-025', contactEmail: 'contact@royaltravels.com', contactPhone: '+91 88888 11025', rating: 4.6 },
  { name: 'City Land Travels', companyName: 'City Land Northern Liners', registrationNumber: 'CLT-IND-026', contactEmail: 'help@citylandbus.com', contactPhone: '+91 88888 11026', rating: 4.5 },
  { name: 'Golden Temple Express', companyName: 'Golden Temple Highway Bus', registrationNumber: 'GTE-IND-027', contactEmail: 'care@goldentemplebus.com', contactPhone: '+91 88888 11027', rating: 4.7 },
  { name: 'Laxmi Holidays', companyName: 'Laxmi Holidays Himachal Line', registrationNumber: 'LXH-IND-028', contactEmail: 'info@laxmiholidays.com', contactPhone: '+91 88888 11028', rating: 4.8 },
  { name: 'Indo Canadian Bus', companyName: 'Indo Canadian Transport Corp', registrationNumber: 'ICT-IND-029', contactEmail: 'airport@indocanadian.com', contactPhone: '+91 88888 11029', rating: 4.7 },
  { name: 'Vikas Travels', companyName: 'Vikas Super Express', registrationNumber: 'VIK-IND-030', contactEmail: 'support@vikastravels.com', contactPhone: '+91 88888 11030', rating: 4.4 }
];

// Helper to generate Sleeper 2+1 layout (30 berths: Lower 15, Upper 15)
const generateSleeperLayout = () => {
  const seats = [];
  const rows = 5;
  // Lower Deck: 5 rows (Col 1 Single, Col 2 & 3 Double)
  for (let r = 1; r <= rows; r++) {
    seats.push({ seatNumber: `L${r}A`, row: r, column: 1, deck: 'lower', seatType: 'sleeper', priceMultiplier: 1.1 });
    seats.push({ seatNumber: `L${r}B`, row: r, column: 2, deck: 'lower', seatType: 'sleeper', priceMultiplier: 1.0 });
    seats.push({ seatNumber: `L${r}C`, row: r, column: 3, deck: 'lower', seatType: 'sleeper', priceMultiplier: 1.0 });
  }
  // Upper Deck: 5 rows
  for (let r = 1; r <= rows; r++) {
    seats.push({ seatNumber: `U${r}A`, row: r, column: 1, deck: 'upper', seatType: 'sleeper', priceMultiplier: 1.15 });
    seats.push({ seatNumber: `U${r}B`, row: r, column: 2, deck: 'upper', seatType: 'sleeper', priceMultiplier: 1.05 });
    seats.push({ seatNumber: `U${r}C`, row: r, column: 3, deck: 'upper', seatType: 'sleeper', priceMultiplier: 1.05 });
  }
  return seats;
};

// Helper to generate 2+2 Seater Volvo layout (36 seats)
const generateSeaterLayout = () => {
  const seats = [];
  const rows = 9;
  for (let r = 1; r <= rows; r++) {
    seats.push({ seatNumber: `${r}A`, row: r, column: 1, deck: 'lower', seatType: 'seater', priceMultiplier: 1.05 }); // Window
    seats.push({ seatNumber: `${r}B`, row: r, column: 2, deck: 'lower', seatType: 'seater', priceMultiplier: 1.0 });  // Aisle
    seats.push({ seatNumber: `${r}C`, row: r, column: 3, deck: 'lower', seatType: 'seater', priceMultiplier: 1.0 });  // Aisle
    seats.push({ seatNumber: `${r}D`, row: r, column: 4, deck: 'lower', seatType: 'seater', priceMultiplier: 1.05 }); // Window
  }
  return seats;
};

// Helper to generate Mixed Seater + Sleeper layout (Lower 20 Seater, Upper 10 Sleeper = 30 total)
const generateMixedLayout = () => {
  const seats = [];
  // Lower: 5 rows of 2+2 Seater (20 seats)
  for (let r = 1; r <= 5; r++) {
    seats.push({ seatNumber: `S${r}A`, row: r, column: 1, deck: 'lower', seatType: 'seater', priceMultiplier: 1.0 });
    seats.push({ seatNumber: `S${r}B`, row: r, column: 2, deck: 'lower', seatType: 'seater', priceMultiplier: 0.95 });
    seats.push({ seatNumber: `S${r}C`, row: r, column: 3, deck: 'lower', seatType: 'seater', priceMultiplier: 0.95 });
    seats.push({ seatNumber: `S${r}D`, row: r, column: 4, deck: 'lower', seatType: 'seater', priceMultiplier: 1.0 });
  }
  // Upper: 5 rows of 2+1 Sleeper (Col 1 Single, Col 2 Double) (10 berths)
  for (let r = 1; r <= 5; r++) {
    seats.push({ seatNumber: `U${r}A`, row: r, column: 1, deck: 'upper', seatType: 'sleeper', priceMultiplier: 1.2 });
    seats.push({ seatNumber: `U${r}B`, row: r, column: 2, deck: 'upper', seatType: 'sleeper', priceMultiplier: 1.15 });
  }
  return seats;
};

module.exports = {
  statesData,
  citiesData,
  operatorsData,
  generateSleeperLayout,
  generateSeaterLayout,
  generateMixedLayout
};
