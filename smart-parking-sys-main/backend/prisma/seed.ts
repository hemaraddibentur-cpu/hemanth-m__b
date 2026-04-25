import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.exitLog.deleteMany();
  await prisma.entryLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.pass.deleteMany();
  await prisma.violation.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.parkingSlot.deleteMany();
  await prisma.parkingZone.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@campus.edu',
        password: hashedPassword,
        name: 'Dr. Rajesh Kumar',
        phone: '+91-9876543210',
        role: 'ADMIN',
        department: 'Administration',
        employeeId: 'ADM001',
        rfidTag: 'RFID-ADM-001',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'security@campus.edu',
        password: hashedPassword,
        name: 'Ramesh Singh',
        phone: '+91-9876543211',
        role: 'SECURITY',
        department: 'Security',
        employeeId: 'SEC001',
        rfidTag: 'RFID-SEC-001',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'prof.sharma@campus.edu',
        password: hashedPassword,
        name: 'Prof. Anita Sharma',
        phone: '+91-9876543212',
        role: 'FACULTY',
        department: 'Computer Science',
        employeeId: 'FAC001',
        rfidTag: 'RFID-FAC-001',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'prof.patel@campus.edu',
        password: hashedPassword,
        name: 'Prof. Vikram Patel',
        phone: '+91-9876543213',
        role: 'FACULTY',
        department: 'Electronics',
        employeeId: 'FAC002',
        rfidTag: 'RFID-FAC-002',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'staff.mehra@campus.edu',
        password: hashedPassword,
        name: 'Priya Mehra',
        phone: '+91-9876543214',
        role: 'STAFF',
        department: 'Library',
        employeeId: 'STF001',
        rfidTag: 'RFID-STF-001',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'staff.gupta@campus.edu',
        password: hashedPassword,
        name: 'Amit Gupta',
        phone: '+91-9876543215',
        role: 'STAFF',
        department: 'Finance',
        employeeId: 'STF002',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'student.arjun@campus.edu',
        password: hashedPassword,
        name: 'Arjun Reddy',
        phone: '+91-9876543216',
        role: 'STUDENT',
        department: 'Computer Science',
        employeeId: 'STU001',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'student.neha@campus.edu',
        password: hashedPassword,
        name: 'Neha Verma',
        phone: '+91-9876543217',
        role: 'STUDENT',
        department: 'Mechanical Engineering',
        employeeId: 'STU002',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'student.rahul@campus.edu',
        password: hashedPassword,
        name: 'Rahul Joshi',
        phone: '+91-9876543218',
        role: 'STUDENT',
        department: 'Civil Engineering',
        employeeId: 'STU003',
        isVerified: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'visitor@example.com',
        password: hashedPassword,
        name: 'Suresh Visitor',
        phone: '+91-9876543219',
        role: 'VISITOR',
        isVerified: true,
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.create({ data: { userId: users[0].id, licensePlate: 'KA01AB1234', vehicleType: 'CAR', make: 'Toyota', model: 'Camry', color: 'White', rfidSticker: 'RFID-V-001' } }),
    prisma.vehicle.create({ data: { userId: users[2].id, licensePlate: 'KA02CD5678', vehicleType: 'CAR', make: 'Honda', model: 'City', color: 'Silver', rfidSticker: 'RFID-V-002' } }),
    prisma.vehicle.create({ data: { userId: users[3].id, licensePlate: 'KA03EF9012', vehicleType: 'SUV', make: 'Hyundai', model: 'Creta', color: 'Black', rfidSticker: 'RFID-V-003' } }),
    prisma.vehicle.create({ data: { userId: users[4].id, licensePlate: 'KA04GH3456', vehicleType: 'BIKE', make: 'Honda', model: 'Activa', color: 'Red', rfidSticker: 'RFID-V-004' } }),
    prisma.vehicle.create({ data: { userId: users[5].id, licensePlate: 'KA05IJ7890', vehicleType: 'CAR', make: 'Maruti', model: 'Swift', color: 'Blue', rfidSticker: 'RFID-V-005' } }),
    prisma.vehicle.create({ data: { userId: users[6].id, licensePlate: 'KA06KL2345', vehicleType: 'BIKE', make: 'Royal Enfield', model: 'Classic 350', color: 'Black', rfidSticker: 'RFID-V-006' } }),
    prisma.vehicle.create({ data: { userId: users[7].id, licensePlate: 'KA07MN6789', vehicleType: 'BIKE', make: 'Bajaj', model: 'Pulsar', color: 'Blue', rfidSticker: 'RFID-V-007' } }),
    prisma.vehicle.create({ data: { userId: users[8].id, licensePlate: 'KA08OP0123', vehicleType: 'CAR', make: 'Tata', model: 'Nexon', color: 'Green' } }),
    prisma.vehicle.create({ data: { userId: users[9].id, licensePlate: 'KA09QR4567', vehicleType: 'CAR', make: 'Kia', model: 'Seltos', color: 'Grey' } }),
    prisma.vehicle.create({ data: { userId: users[6].id, licensePlate: 'KA10ST8901', vehicleType: 'CAR', make: 'Hyundai', model: 'i20', color: 'White' } }),
  ]);

  console.log(`✅ Created ${vehicles.length} vehicles`);

  // Create parking zones
  const zones = await Promise.all([
    prisma.parkingZone.create({
      data: { name: 'Zone A - Main Building', description: 'Faculty & Staff parking near main building', totalSlots: 15, hourlyRate: 30, dailyRate: 200, monthlyRate: 3000, rules: 'Faculty and Staff only during 8AM-6PM', latitude: 12.9716, longitude: 77.5946, color: '#3B82F6' },
    }),
    prisma.parkingZone.create({
      data: { name: 'Zone B - Library Block', description: 'Open parking near library', totalSlots: 12, hourlyRate: 20, dailyRate: 150, monthlyRate: 2500, rules: 'All users allowed', latitude: 12.9720, longitude: 77.5950, color: '#10B981' },
    }),
    prisma.parkingZone.create({
      data: { name: 'Zone C - Sports Complex', description: 'Student parking near sports area', totalSlots: 10, hourlyRate: 15, dailyRate: 100, monthlyRate: 1500, rules: 'Students priority', latitude: 12.9725, longitude: 77.5955, color: '#F59E0B' },
    }),
    prisma.parkingZone.create({
      data: { name: 'Zone D - Visitor Parking', description: 'Dedicated visitor parking', totalSlots: 8, hourlyRate: 40, dailyRate: 250, rules: 'Visitors and guests only', latitude: 12.9710, longitude: 77.5942, color: '#EF4444' },
    }),
    prisma.parkingZone.create({
      data: { name: 'Zone E - EV Charging Bay', description: 'Electric vehicle charging stations', totalSlots: 5, hourlyRate: 50, dailyRate: 300, monthlyRate: 5000, rules: 'Electric vehicles only', latitude: 12.9730, longitude: 77.5960, color: '#8B5CF6' },
    }),
  ]);

  console.log(`✅ Created ${zones.length} parking zones`);

  // Create parking slots for each zone
  const slotTypes: ('REGULAR' | 'HANDICAPPED' | 'EV_CHARGING' | 'RESERVED_FACULTY' | 'COMPACT' | 'LARGE')[] = ['REGULAR', 'HANDICAPPED', 'EV_CHARGING', 'RESERVED_FACULTY', 'COMPACT', 'LARGE'];
  let totalSlots = 0;

  for (const zone of zones) {
    const prefix = zone.name.charAt(5);
    const slots = [];
    for (let i = 1; i <= zone.totalSlots; i++) {
      let slotType: typeof slotTypes[number] = 'REGULAR';
      if (zone.name.includes('EV')) slotType = 'EV_CHARGING';
      else if (i === 1) slotType = 'HANDICAPPED';
      else if (i <= 3 && zone.name.includes('Main')) slotType = 'RESERVED_FACULTY';
      else if (i > zone.totalSlots - 2) slotType = 'COMPACT';

      slots.push({
        zoneId: zone.id,
        slotNumber: `${prefix}${i.toString().padStart(3, '0')}`,
        slotType,
        floor: i <= Math.ceil(zone.totalSlots / 2) ? 1 : 2,
        isOccupied: false,
        posX: ((i - 1) % 5) * 70 + 35,
        posY: Math.floor((i - 1) / 5) * 90 + 45,
      });
    }
    await prisma.parkingSlot.createMany({ data: slots });
    totalSlots += slots.length;
  }

  console.log(`✅ Created ${totalSlots} parking slots`);

  // Get all slots for bookings
  const allSlots = await prisma.parkingSlot.findMany({
    include: { zone: true },
    orderBy: { slotNumber: 'asc' },
  });

  // Create bookings
  const now = new Date();
  const bookings = [];

  const bookingData = [
    { userIdx: 2, vehicleIdx: 1, slotIdx: 0, hoursAgo: -2, duration: 4, status: 'ACTIVE' },
    { userIdx: 3, vehicleIdx: 2, slotIdx: 1, hoursAgo: -1, duration: 3, status: 'ACTIVE' },
    { userIdx: 4, vehicleIdx: 3, slotIdx: 15, hoursAgo: -3, duration: 5, status: 'ACTIVE' },
    { userIdx: 5, vehicleIdx: 4, slotIdx: 16, hoursAgo: 0, duration: 2, status: 'CONFIRMED' },
    { userIdx: 6, vehicleIdx: 5, slotIdx: 27, hoursAgo: 1, duration: 3, status: 'CONFIRMED' },
    { userIdx: 7, vehicleIdx: 6, slotIdx: 28, hoursAgo: 2, duration: 4, status: 'CONFIRMED' },
    { userIdx: 8, vehicleIdx: 7, slotIdx: 37, hoursAgo: 3, duration: 2, status: 'CONFIRMED' },
    { userIdx: 9, vehicleIdx: 8, slotIdx: 38, hoursAgo: 4, duration: 3, status: 'CONFIRMED' },
    // Past completed bookings
    { userIdx: 2, vehicleIdx: 1, slotIdx: 2, hoursAgo: -48, duration: 3, status: 'COMPLETED' },
    { userIdx: 3, vehicleIdx: 2, slotIdx: 3, hoursAgo: -72, duration: 2, status: 'COMPLETED' },
    { userIdx: 6, vehicleIdx: 5, slotIdx: 29, hoursAgo: -24, duration: 4, status: 'COMPLETED' },
    { userIdx: 7, vehicleIdx: 6, slotIdx: 30, hoursAgo: -26, duration: 2, status: 'COMPLETED' },
    { userIdx: 8, vehicleIdx: 7, slotIdx: 39, hoursAgo: -50, duration: 3, status: 'COMPLETED' },
    // Cancelled bookings
    { userIdx: 6, vehicleIdx: 5, slotIdx: 4, hoursAgo: -20, duration: 2, status: 'CANCELLED' },
    { userIdx: 9, vehicleIdx: 8, slotIdx: 5, hoursAgo: -30, duration: 1, status: 'CANCELLED' },
    // More recent/future bookings
    { userIdx: 2, vehicleIdx: 1, slotIdx: 6, hoursAgo: 5, duration: 3, status: 'CONFIRMED' },
    { userIdx: 4, vehicleIdx: 3, slotIdx: 17, hoursAgo: 6, duration: 4, status: 'CONFIRMED' },
    { userIdx: 6, vehicleIdx: 5, slotIdx: 31, hoursAgo: -5, duration: 2, status: 'COMPLETED' },
    { userIdx: 7, vehicleIdx: 6, slotIdx: 32, hoursAgo: -10, duration: 3, status: 'COMPLETED' },
    { userIdx: 8, vehicleIdx: 7, slotIdx: 40, hoursAgo: 8, duration: 2, status: 'CONFIRMED' },
  ];

  for (const bd of bookingData) {
    if (bd.slotIdx >= allSlots.length) continue;

    const startTime = new Date(now.getTime() + bd.hoursAgo * 3600000);
    const endTime = new Date(startTime.getTime() + bd.duration * 3600000);
    const totalAmount = bd.duration * allSlots[bd.slotIdx].zone.hourlyRate;

    const qrData = JSON.stringify({
      slot: allSlots[bd.slotIdx].slotNumber,
      zone: allSlots[bd.slotIdx].zone.name,
      vehicle: vehicles[bd.vehicleIdx].licensePlate,
    });
    const qrCode = await QRCode.toDataURL(qrData);

    const booking = await prisma.booking.create({
      data: {
        userId: users[bd.userIdx].id,
        slotId: allSlots[bd.slotIdx].id,
        vehicleId: vehicles[bd.vehicleIdx].id,
        startTime,
        endTime,
        status: bd.status as any,
        totalAmount,
        qrCode,
      },
    });
    bookings.push(booking);

    // Mark active slots as occupied
    if (bd.status === 'ACTIVE') {
      await prisma.parkingSlot.update({
        where: { id: allSlots[bd.slotIdx].id },
        data: { isOccupied: true },
      });
    }
  }

  console.log(`✅ Created ${bookings.length} bookings`);

  // Create entry logs for active and completed bookings
  const activeAndCompleted = bookings.filter((_, i) =>
    bookingData[i] && ['ACTIVE', 'COMPLETED'].includes(bookingData[i].status)
  );

  for (let i = 0; i < activeAndCompleted.length; i++) {
    const bd = bookingData[bookings.indexOf(activeAndCompleted[i])];
    if (!bd) continue;

    const entryLog = await prisma.entryLog.create({
      data: {
        bookingId: activeAndCompleted[i].id,
        vehicleId: vehicles[bd.vehicleIdx].id,
        entryTime: activeAndCompleted[i].startTime,
        entryGate: i % 2 === 0 ? 'Gate A - Main Entrance' : 'Gate B - Side Entrance',
        verificationMethod: i % 3 === 0 ? 'QR_CODE' : i % 3 === 1 ? 'RFID' : 'MANUAL',
        licensePlateCaptured: vehicles[bd.vehicleIdx].licensePlate,
      },
    });

    // Create exit logs for completed bookings
    if (bd.status === 'COMPLETED') {
      const duration = Math.ceil((activeAndCompleted[i].endTime.getTime() - activeAndCompleted[i].startTime.getTime()) / (1000 * 60));
      await prisma.exitLog.create({
        data: {
          entryLogId: entryLog.id,
          exitTime: activeAndCompleted[i].endTime,
          exitGate: 'Gate A - Main Entrance',
          duration,
          amountPaid: activeAndCompleted[i].totalAmount,
          paymentStatus: 'COMPLETED',
        },
      });
    }
  }

  console.log('✅ Created entry/exit logs');

  // Create payments
  const completedBookings = bookings.filter((_, i) => bookingData[i]?.status === 'COMPLETED');
  const methods: ('CREDIT_CARD' | 'DEBIT_CARD' | 'UPI' | 'WALLET' | 'NET_BANKING')[] = ['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'WALLET', 'NET_BANKING'];

  for (let i = 0; i < completedBookings.length; i++) {
    const bd = bookingData[bookings.indexOf(completedBookings[i])];
    if (!bd) continue;

    await prisma.payment.create({
      data: {
        bookingId: completedBookings[i].id,
        userId: users[bd.userIdx].id,
        amount: completedBookings[i].totalAmount,
        method: methods[i % methods.length],
        transactionId: `TXN-SEED-${Date.now()}-${i}`,
        status: 'COMPLETED',
        description: `Parking fee - ${allSlots[bd.slotIdx]?.zone?.name || 'Zone'}`,
      },
    });
  }

  // Add some additional payments for revenue data
  for (let i = 0; i < 15; i++) {
    const d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * 30));
    const userIdx = Math.floor(Math.random() * users.length);
    await prisma.payment.create({
      data: {
        userId: users[userIdx].id,
        amount: Math.floor(Math.random() * 200) + 50,
        method: methods[i % methods.length],
        transactionId: `TXN-HIST-${Date.now()}-${i}`,
        status: 'COMPLETED',
        description: 'Historical parking payment',
        createdAt: d,
      },
    });
  }

  console.log('✅ Created payments');

  // Create violations
  const violationTypes: ('OVERSTAY' | 'WRONG_ZONE' | 'UNAUTHORIZED' | 'NO_BOOKING' | 'DOUBLE_PARKING')[] = ['OVERSTAY', 'WRONG_ZONE', 'UNAUTHORIZED', 'NO_BOOKING', 'DOUBLE_PARKING'];
  const violationData = [
    { userIdx: 6, vehicleIdx: 5, type: 'OVERSTAY', fine: 200, status: 'OPEN', desc: 'Exceeded booking time by 2 hours' },
    { userIdx: 7, vehicleIdx: 6, type: 'WRONG_ZONE', fine: 300, status: 'FINE_ISSUED', desc: 'Parked in faculty zone without authorization' },
    { userIdx: 8, vehicleIdx: 7, type: 'NO_BOOKING', fine: 500, status: 'PAID', desc: 'Entered without booking' },
    { userIdx: 9, vehicleIdx: 8, type: 'DOUBLE_PARKING', fine: 400, status: 'OPEN', desc: 'Double parked blocking exit lane' },
    { userIdx: 6, vehicleIdx: 5, type: 'UNAUTHORIZED', fine: 1000, status: 'DISPUTED', desc: 'Used expired parking pass' },
  ];

  for (const vd of violationData) {
    await prisma.violation.create({
      data: {
        userId: users[vd.userIdx].id,
        vehicleId: vehicles[vd.vehicleIdx].id,
        type: vd.type as any,
        description: vd.desc,
        fineAmount: vd.fine,
        status: vd.status as any,
      },
    });
  }

  console.log('✅ Created violations');

  // Create passes
  const passData = [
    { userIdx: 2, type: 'SEMESTER', price: 15000 },
    { userIdx: 3, type: 'QUARTERLY', price: 9000 },
    { userIdx: 4, type: 'MONTHLY', price: 3000 },
    { userIdx: 6, type: 'MONTHLY', price: 1500 },
  ];

  for (const pd of passData) {
    const startDate = new Date();
    const endDate = new Date();
    if (pd.type === 'MONTHLY') endDate.setMonth(endDate.getMonth() + 1);
    else if (pd.type === 'QUARTERLY') endDate.setMonth(endDate.getMonth() + 3);
    else endDate.setMonth(endDate.getMonth() + 6);

    await prisma.pass.create({
      data: {
        userId: users[pd.userIdx].id,
        passType: pd.type as any,
        startDate,
        endDate,
        price: pd.price,
        isActive: true,
      },
    });
  }

  console.log('✅ Created passes');

  // Create notifications
  const notifData = [
    { userIdx: 2, title: 'Booking Confirmed', message: 'Your parking slot A001 in Zone A has been confirmed.', type: 'success' },
    { userIdx: 6, title: 'Parking Violation', message: 'You have received an overstay violation. Fine: ₹200.', type: 'error' },
    { userIdx: 3, title: 'Pass Expiring Soon', message: 'Your quarterly pass expires in 5 days. Renew now!', type: 'warning' },
    { userIdx: 7, title: 'Booking Reminder', message: 'Your parking booking starts in 1 hour at Zone C.', type: 'info' },
    { userIdx: 0, title: 'System Alert', message: 'Zone E charging stations maintenance scheduled for tomorrow.', type: 'warning' },
  ];

  for (const nd of notifData) {
    await prisma.notification.create({
      data: {
        userId: users[nd.userIdx].id,
        title: nd.title,
        message: nd.message,
        type: nd.type,
      },
    });
  }

  console.log('✅ Created notifications');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Login Credentials (all passwords: password123):');
  console.log('   Admin:    admin@campus.edu');
  console.log('   Security: security@campus.edu');
  console.log('   Faculty:  prof.sharma@campus.edu');
  console.log('   Staff:    staff.mehra@campus.edu');
  console.log('   Student:  student.arjun@campus.edu');
  console.log('   Visitor:  visitor@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
